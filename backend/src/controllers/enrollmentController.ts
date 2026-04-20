import { Request, Response } from 'express'
import pool from '../config/db'
import { sendSuccess, sendError } from '../utils/response'
import axios from 'axios'
import fs from 'fs'
import FormData from 'form-data'

// ========================================================
// POST /enrollments/verify-slip
// ตรวจสอบสลิปกับ Slipok แล้วอัปเดต status → paid
// ========================================================
export const verifySlip = async (req: Request, res: Response) => {
  try {
    const file = req.file
    if (!file) return sendError(res, 'ไม่พบไฟล์สลิป', 400)

    const { idCard } = req.body
    if (!idCard) return sendError(res, 'ไม่พบเลขบัตรประชาชน', 400)

    const applicantResult = await pool.query(`
      SELECT a.app_id, a.status, p.total_amount
      FROM applicants a
      JOIN payments p ON p.app_id = a.app_id
      WHERE a.id_card_number = $1
    `, [idCard])

    if (applicantResult.rows.length === 0) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
      return sendError(res, 'ไม่พบข้อมูลผู้สมัคร', 404)
    }

    const { app_id, status, total_amount } = applicantResult.rows[0]

    if (status === 'enrolled') {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
      return sendSuccess(res, { valid: true, message: 'มอบตัวเรียบร้อยแล้ว' })
    }

    const formData = new FormData()
    formData.append('files', fs.createReadStream(file.path), file.originalname)

    const slipokRes = await axios.post(
      `https://api.slipok.com/api/line/apikey/${process.env.SLIPOK_BRANCH_ID}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'x-authorization': process.env.SLIPOK_API_KEY,
        },
      }
    )

    const data = slipokRes.data  // ✅ ไม่ลบไฟล์ก่อน

    if (!data.success) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path) // ❌ ไม่ผ่าน ค่อยลบ
      return sendSuccess(res, {
        valid: false,
        message: data.message ?? 'สลิปไม่ถูกต้อง',
      })
    }

    const slipAmount = Number(data.data.amount)
    const requiredAmount = Number(total_amount)

    if (slipAmount < requiredAmount) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path) // ❌ ไม่ผ่าน ค่อยลบ
      return sendSuccess(res, {
        valid: false,
        message: `ยอดโอนไม่ครบ โอนมา ${slipAmount.toLocaleString()} บาท แต่ต้องชำระ ${requiredAmount.toLocaleString()} บาท`,
      })
    }

    // ✅ สลิปผ่าน → save slip_path ด้วย
   await pool.query(`
  UPDATE applicants
  SET status = 'pending_approve', paid_at = NOW()
  WHERE app_id = $1
`, [app_id])

    await pool.query(`
      UPDATE payments
      SET 
        slip_path     = $1,
        slip_name     = $2,
        paid_at       = NOW(),
        slip_sender   = $3,
        slip_receiver = $4
      WHERE app_id = $5
    `, [
      file.path,
      file.originalname,
      data.data.sender?.displayName ?? '-',
      data.data.receiver?.displayName ?? '-',
      app_id
    ])

    return sendSuccess(res, {
      valid: true,
      amount: slipAmount,
      date: data.data.transDate,
      sender: data.data.sender?.displayName ?? '-',
      receiver: data.data.receiver?.displayName ?? '-',
    })

  } catch (err: any) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)

    const slipokError = err.response?.data
    if (slipokError?.code) {
      return sendSuccess(res, {
        valid: false,
        message: slipokError.message ?? 'สลิปไม่ถูกต้อง',
      })
    }

    sendError(res, 'ตรวจสอบสลิปไม่สำเร็จ', 500, err)
  }
}

// ========================================================
// POST /enrollments/confirm
// ยืนยันการมอบตัว → อัปเดต status เป็น enrolled
// ========================================================
export const confirmEnrollment = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    const { idCard } = req.body

    if (!idCard || idCard.length < 5) {
      return sendError(res, 'เลขบัตรประชาชนไม่ถูกต้อง', 400)
    }

    const applicant = await client.query(`
      SELECT a.app_id, a.status
      FROM applicants a
      WHERE a.id_card_number = $1
    `, [idCard])

    if (applicant.rows.length === 0) {
      return sendError(res, 'ไม่พบข้อมูลการสมัครในระบบ', 404)
    }

    const { app_id, status } = applicant.rows[0]

    // ✅ ต้องเป็น paid หรือ enrolled เท่านั้น (enrolled = มอบตัวซ้ำได้ แค่ upsert)
if (status === 'pending_payment') {
  return sendError(res, 'กรุณารอ admin ยืนยันการชำระเงินก่อน', 400)
}

await client.query(`
  UPDATE applicants SET status = 'pending_approve' WHERE app_id = $1
`, [app_id])

    const files = req.files as Record<string, Express.Multer.File[]>

    const docEntries = [
      { key: 'self_front', type: 'self_house_front' },
      { key: 'self_back', type: 'self_house_back' },
      { key: 'father_front', type: 'father_house_front' },
      { key: 'father_back', type: 'father_house_back' },
      { key: 'mother_front', type: 'mother_house_front' },
      { key: 'mother_back', type: 'mother_house_back' },
      { key: 'payment_slip', type: 'payment_slip' },
    ]

    for (const entry of docEntries) {
      const file = files?.[entry.key]?.[0]
      if (file) {
        await client.query(
          `DELETE FROM documents WHERE app_id = $1 AND doc_type = $2`,
          [app_id, entry.type]
        )
        await client.query(
          `INSERT INTO documents (app_id, doc_type, file_path, file_name, file_size)
           VALUES ($1, $2, $3, $4, $5)`,
          [app_id, entry.type, file.path, file.originalname, file.size]
        )
      }
    }

    await client.query(`
      INSERT INTO enrollments (app_id, enrolled_at, tabien_self_path, tabien_father_path, tabien_mother_path)
      VALUES ($1, NOW(), $2, $3, $4)
      ON CONFLICT (app_id) DO UPDATE SET
        enrolled_at        = NOW(),
        tabien_self_path   = COALESCE(EXCLUDED.tabien_self_path, enrollments.tabien_self_path),
        tabien_father_path = COALESCE(EXCLUDED.tabien_father_path, enrollments.tabien_father_path),
        tabien_mother_path = COALESCE(EXCLUDED.tabien_mother_path, enrollments.tabien_mother_path)
    `, [
      app_id,
      files?.['self_front']?.[0]?.path ?? null,
      files?.['father_front']?.[0]?.path ?? null,
      files?.['mother_front']?.[0]?.path ?? null,
    ])

    await client.query('COMMIT')
    sendSuccess(res, { app_id }, 'บันทึกข้อมูลเรียบร้อยแล้ว', 201)

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ confirmEnrollment error:', JSON.stringify(err, Object.getOwnPropertyNames(err)))
    sendError(res, 'เกิดข้อผิดพลาดในการมอบตัว', 500, err)
  } finally {
    client.release()
  }
}

// ========================================================
// GET /enrollments/status/:idCard
// ========================================================
export const getEnrollmentStatus = async (req: Request, res: Response) => {
  try {
    const { idCard } = req.params
    const result = await pool.query(`
  SELECT 
    ae.ae_id,
    ed.exp_name   AS item_name,
    ae.size,
    ae.quantity,
    ae.unit_price,
    ae.total_price
  FROM applicant_expenses ae
  JOIN expense_detail ed ON ed.exp_id = ae.exp_id
  JOIN applicants a ON a.app_id = ae.app_id
  WHERE a.id_card_number = $1
  ORDER BY ae.ae_id
`, [idCard])

    if (result.rows.length === 0) {
      return sendError(res, 'ไม่พบข้อมูลการสมัคร', 404)
    }
    sendSuccess(res, result.rows[0])
  } catch (err) {
    sendError(res, 'เกิดข้อผิดพลาด', 500, err)
  }
}

// ========================================================
// GET /enrollments/onsite  (admin)
// ========================================================
export const getOnsiteEnrollments = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        o.onsite_id, o.ap_id, o.count, o.note,
        o.recorded_by, o.recorded_at, o.updated_at,
        ap.ap_years, ap.plan_num,
        c.cur_name, c.cur_shortname,
        d.div_name,
        COUNT(DISTINCT a.app_id) FILTER (WHERE a.status = 'enrolled') AS online_count
      FROM onsite_enrollments o
      JOIN admission_plan ap ON ap.ap_id = o.ap_id
      JOIN curriculums c ON c.cur_id = ap.cur_id
      JOIN divisions d ON d.div_id = ap.div_id
      LEFT JOIN applicants a ON a.ap_id = ap.ap_id
      GROUP BY o.onsite_id, ap.ap_id, ap.ap_years, ap.plan_num, c.cur_id,
               c.cur_name, c.cur_shortname, d.div_name
      ORDER BY ap.ap_years DESC, c.cur_id, d.div_name
    `)
    sendSuccess(res, result.rows)
  } catch (err) {
    sendError(res, 'ไม่สามารถดึงข้อมูลได้', 500, err)
  }
}

// ========================================================
// POST /enrollments/onsite  (admin)
// ========================================================
export const upsertOnsiteEnrollment = async (req: Request, res: Response) => {
  try {
    const { ap_id, count, note, recorded_by } = req.body
    if (!ap_id || count === undefined) {
      return sendError(res, 'กรุณาระบุ ap_id และจำนวน', 400)
    }
    const result = await pool.query(`
      INSERT INTO onsite_enrollments (ap_id, count, note, recorded_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (ap_id) DO UPDATE SET
        count       = EXCLUDED.count,
        note        = EXCLUDED.note,
        recorded_by = EXCLUDED.recorded_by,
        updated_at  = NOW()
      RETURNING *
    `, [ap_id, count, note || null, recorded_by || 'staff'])
    sendSuccess(res, result.rows[0], 'บันทึกข้อมูลเรียบร้อย')
  } catch (err) {
    sendError(res, 'ไม่สามารถบันทึกข้อมูลได้', 500, err)
  }
}

// ========================================================
// GET /enrollments/summary  (admin)
// ========================================================
export const getEnrollmentSummary = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        ap.ap_id, ap.ap_years, ap.plan_num,
        c.cur_name, c.cur_shortname, c.cur_id,
        d.div_name, d.div_id,
        COUNT(DISTINCT a.app_id) FILTER (WHERE a.status = 'enrolled') AS online_enrolled,
        COALESCE(o.count, 0) AS onsite_enrolled,
        COUNT(DISTINCT a.app_id) FILTER (WHERE a.status = 'enrolled') + COALESCE(o.count, 0) AS total_enrolled,
        ap.plan_num - (
          COUNT(DISTINCT a.app_id) FILTER (WHERE a.status = 'enrolled') + COALESCE(o.count, 0)
        ) AS remaining
      FROM admission_plan ap
      JOIN curriculums c ON c.cur_id = ap.cur_id
      JOIN divisions d ON d.div_id = ap.div_id
      LEFT JOIN applicants a ON a.ap_id = ap.ap_id
      LEFT JOIN onsite_enrollments o ON o.ap_id = ap.ap_id
      GROUP BY ap.ap_id, ap.ap_years, ap.plan_num, c.cur_id,
               c.cur_name, c.cur_shortname, d.div_name, o.count, d.div_id
      ORDER BY ap.ap_years DESC, c.cur_id, d.div_name
    `)
    sendSuccess(res, result.rows)
  } catch (err) {
    sendError(res, 'ไม่สามารถดึงข้อมูลสรุปได้', 500, err)
  }
}

// ========================================================
// GET /orders/:idCard
// ดึงข้อมูลการสั่งซื้อเครื่องแบบ
// ========================================================
export const getOrdersByIdCard = async (req: Request, res: Response) => {
  try {
    const { idCard } = req.params
    console.log('🔍 getOrdersByIdCard idCard:', idCard) // ✅ เพิ่ม

    const result = await pool.query(`
      SELECT 
        ae.ae_id,
        ed.exp_name   AS item_name,
        ae.size,
        ae.quantity,
        ae.unit_price,
        ae.total_price
      FROM applicant_expenses ae
      JOIN expense_detail ed ON ed.exp_id = ae.exp_id
      JOIN applicants a ON a.app_id = ae.app_id
      WHERE a.id_card_number = $1
      ORDER BY ae.ae_id
    `, [idCard])

    console.log('✅ result rows:', result.rows) // ✅ เพิ่ม
    sendSuccess(res, result.rows)
  } catch (err: any) {
    console.error('❌ getOrdersByIdCard error:', err.message) // ✅ เพิ่ม
    sendError(res, 'ไม่สามารถดึงข้อมูล orders ได้', 500, err)
  }
}

// ========================================================

// POST /admin/payments/approve

// ========================================================
export const approvePayment = async (req: Request, res: Response) => {
  const { app_id, approve } = req.body  // approve = true/false

  await pool.query(`
    UPDATE applicants
    SET status = $1
    WHERE app_id = $2 AND status = 'pending_approve'
  `, [approve ? 'paid' : 'pending_payment', app_id])

  sendSuccess(res, {}, approve ? 'อนุมัติแล้ว' : 'ส่งกลับให้นักเรียนอัปสลิปใหม่')
}