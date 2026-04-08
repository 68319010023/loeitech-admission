import { Request, Response } from 'express'
import pool from '../config/db'
import { sendSuccess, sendError } from '../utils/response'

// ดึงหลักสูตรทั้งหมด
export const getCurriculums = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT cur_id, cur_name, cur_shortname FROM curriculums ORDER BY cur_id'
    )
    sendSuccess(res, result.rows)
  } catch (err) {
    sendError(res, 'ไม่สามารถดึงข้อมูลหลักสูตรได้', 500, err)
  }
}

// ดึงสาขาตามหลักสูตร
export const getDivisions = async (req: Request, res: Response) => {
  try {
    const { cur_id } = req.query
    const query = cur_id
      ? 'SELECT div_id, div_name, cur_id FROM divisions WHERE cur_id = $1 ORDER BY div_id'
      : 'SELECT div_id, div_name, cur_id FROM divisions ORDER BY div_id'
    const result = await pool.query(query, cur_id ? [cur_id] : [])
    sendSuccess(res, result.rows)
  } catch (err) {
    sendError(res, 'ไม่สามารถดึงข้อมูลสาขาได้', 500, err)
  }
}

// ดึงค่าใช้จ่ายตามหลักสูตร
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { cur_id } = req.query
    const query = cur_id
      ? `SELECT exp_id, exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type
         FROM expense_detail WHERE cur_id = $1 ORDER BY payment_type DESC, exp_id`
      : `SELECT exp_id, exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type
         FROM expense_detail ORDER BY payment_type DESC, exp_id`
    const result = await pool.query(query, cur_id ? [cur_id] : [])
    sendSuccess(res, result.rows)
  } catch (err) {
    sendError(res, 'ไม่สามารถดึงข้อมูลค่าใช้จ่ายได้', 500, err)
  }
}

export const getAdmissionPlan = async (req: Request, res: Response) => {
  try {
    const { prev_level, ap_years } = req.query

    // map prev_level → cur_shortname
    let curShortname: string | null = null
    if (prev_level === 'm3') curShortname = 'ปวช.'
    else if (prev_level === 'm6' || prev_level === 'pvc') curShortname = 'ปวส.'

    const result = await pool.query(`
      SELECT
        ap.ap_id,
        ap.ap_years,
        ap.plan_num,
        ap.cur_id,
        c.cur_name,
        c.cur_shortname,
        ap.div_id,
        d.div_name,
        COUNT(a.app_id) AS applicant_count,
        ap.plan_num - COUNT(a.app_id)::int AS remaining,
        CASE WHEN ap.plan_num - COUNT(a.app_id)::int <= 0 THEN true ELSE false END AS is_full
      FROM admission_plan ap
      JOIN curriculums c ON c.cur_id = ap.cur_id
      JOIN divisions d ON d.div_id = ap.div_id
      LEFT JOIN applicants a ON a.ap_id = ap.ap_id
      WHERE ($1::varchar IS NULL OR c.cur_shortname = $1)
        AND ($2::varchar IS NULL OR ap.ap_years = $2)
      GROUP BY ap.ap_id, c.cur_name, c.cur_shortname, d.div_name, ap.plan_num
      ORDER BY ap.cur_id, ap.div_id
    `, [curShortname, ap_years || null])

    sendSuccess(res, result.rows)
  } catch (err) {
    sendError(res, 'ไม่สามารถดึงข้อมูลแผนการรับสมัครได้', 500, err)
  }
}

// ส่งใบสมัคร
export const createApplication = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const {
      id_card_number, prefix, full_name, address, phone, email,
      prev_school, prev_level, prev_year, gpa,
      cur_id, div_id, ap_id, doc_type,
      expenses, // JSON string array ของรายการค่าใช้จ่าย
    } = req.body

    // เช็คว่าสมัครซ้ำมั้ย
    const existing = await client.query(
      'SELECT app_id FROM applicants WHERE id_card_number = $1',
      [id_card_number]
    )
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK')
      return sendError(res, 'เลขบัตรประชาชนนี้สมัครแล้ว', 400)
    }

    // เช็คว่าสาขายังมีที่ว่างมั้ย
    const planCheck = await client.query(`
      SELECT ap.plan_num, COUNT(a.app_id) AS count
      FROM admission_plan ap
      LEFT JOIN applicants a ON a.ap_id = ap.ap_id
      WHERE ap.ap_id = $1
      GROUP BY ap.plan_num
    `, [ap_id])

    if (planCheck.rows.length > 0) {
      const { plan_num, count } = planCheck.rows[0]
      if (parseInt(count) >= parseInt(plan_num)) {
        await client.query('ROLLBACK')
        return sendError(res, 'สาขาวิชานี้เต็มแล้ว', 400)
      }
    }

    // สร้างใบสมัคร
    const appResult = await client.query(`
      INSERT INTO applicants
        (id_card_number, prefix, full_name, address, phone, email,
         prev_school, prev_level, prev_year, gpa, cur_id, div_id, ap_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING app_id
    `, [id_card_number, prefix, full_name, address, phone, email,
        prev_school, prev_level, prev_year, gpa, cur_id, div_id, ap_id])

    const app_id = appResult.rows[0].app_id

    // บันทึกเอกสาร
    const files = req.files as Record<string, Express.Multer.File[]>
    const docEntries = [
      { key: 'id_front', type: 'id_front' },
      { key: 'id_back', type: 'id_back' },
      { key: 'edu_front', type: `${doc_type}_front` },
      { key: 'edu_back', type: `${doc_type}_back` },
    ]

    for (const entry of docEntries) {
      const file = files?.[entry.key]?.[0]
      if (file) {
        await client.query(`
          INSERT INTO documents (app_id, doc_type, file_path, file_name, file_size)
          VALUES ($1, $2, $3, $4, $5)
        `, [app_id, entry.type, file.path, file.originalname, file.size])
      }
    }

    // บันทึกรายการค่าใช้จ่าย
    let totalAmount = 0
    let requiredAmount = 0
    let optionalAmount = 0

    const expenseList = JSON.parse(expenses || '[]')
    for (const exp of expenseList) {
      if (exp.quantity <= 0) continue
      const total = exp.unit_price * exp.quantity
      totalAmount += total
      if (exp.is_required) requiredAmount += total
      else optionalAmount += total

      await client.query(`
        INSERT INTO applicant_expenses
          (app_id, exp_id, quantity, size, unit_price, total_price, is_required)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
      `, [app_id, exp.exp_id, exp.quantity, exp.size || null,
          exp.unit_price, total, exp.is_required])
    }

    // สร้างรายการชำระเงิน
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3)

    await client.query(`
      INSERT INTO payments (app_id, total_amount, required_amount, optional_amount, due_date)
      VALUES ($1,$2,$3,$4,$5)
    `, [app_id, totalAmount, requiredAmount, optionalAmount, dueDate])

    await client.query('COMMIT')

    sendSuccess(res, { app_id, total_amount: totalAmount, due_date: dueDate },
      'ส่งใบสมัครเรียบร้อยแล้ว', 201)

  } catch (err: any) {
    await client.query('ROLLBACK')
    if (err.message?.includes('Invalid Thai ID')) {
      return sendError(res, 'เลขบัตรประชาชนไม่ถูกต้อง', 400)
    }
    sendError(res, 'เกิดข้อผิดพลาดในการส่งใบสมัคร', 500, err)
  } finally {
    client.release()
  }
}

// ตรวจสอบสถานะ
export const checkStatus = async (req: Request, res: Response) => {
  try {
    const { idCard } = req.params
    const result = await pool.query(`
      SELECT
        a.app_id, a.prefix, a.full_name, a.status, a.created_at,
        c.cur_name, d.div_name,
        p.total_amount, p.required_amount, p.due_date,
        p.paid_at, p.verified_at,
        e.enrolled_at, e.verified_at AS enroll_verified_at
      FROM applicants a
      JOIN curriculums c ON c.cur_id = a.cur_id
      JOIN divisions d ON d.div_id = a.div_id
      LEFT JOIN payments p ON p.app_id = a.app_id
      LEFT JOIN enrollments e ON e.app_id = a.app_id
      WHERE a.id_card_number = $1
    `, [idCard])

    if (result.rows.length === 0) {
      return sendError(res, 'ไม่พบข้อมูลการสมัคร', 404)
    }

    sendSuccess(res, result.rows[0])
  } catch (err) {
    sendError(res, 'เกิดข้อผิดพลาด', 500, err)
  }
}

// สถิติ
export const getStats = async (_req: Request, res: Response) => {
  try {
    const overview = await pool.query(`
      SELECT
        COUNT(*) AS total_applicants,
        COUNT(*) FILTER (WHERE status = 'paid') AS paid,
        COUNT(*) FILTER (WHERE status = 'enrolled') AS enrolled,
        COUNT(*) FILTER (WHERE status = 'pending_payment') AS pending
      FROM applicants
    `)

    const byCourse = await pool.query(`
      SELECT
        c.cur_id, c.cur_name, c.cur_shortname,
        SUM(ap.plan_num) AS quota,
        COUNT(a.app_id) AS applicants,
        COUNT(a.app_id) FILTER (WHERE a.status = 'enrolled') AS enrolled
      FROM curriculums c
      LEFT JOIN admission_plan ap ON ap.cur_id = c.cur_id
      LEFT JOIN applicants a ON a.cur_id = c.cur_id
      GROUP BY c.cur_id, c.cur_name, c.cur_shortname
      ORDER BY c.cur_id
    `)

    const byDivision = await pool.query(`
      SELECT
        d.div_id, d.div_name,
        c.cur_shortname,
        ap.plan_num AS quota,
        COUNT(a.app_id) AS applicants,
        COUNT(a.app_id) FILTER (WHERE a.status = 'enrolled') AS enrolled
      FROM divisions d
      JOIN curriculums c ON c.cur_id = d.cur_id
      LEFT JOIN admission_plan ap ON ap.div_id = d.div_id
      LEFT JOIN applicants a ON a.div_id = d.div_id
      GROUP BY d.div_id, d.div_name, c.cur_shortname, ap.plan_num
      ORDER BY c.cur_id, d.div_id
    `)

    sendSuccess(res, {
      overview: overview.rows[0],
      by_course: byCourse.rows,
      by_division: byDivision.rows,
    })
  } catch (err) {
    sendError(res, 'เกิดข้อผิดพลาด', 500, err)
  }
}