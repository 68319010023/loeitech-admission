import { Request, Response } from 'express'
import pool from '../config/db'
import { sendSuccess, sendError } from '../utils/response'

export const confirmEnrollment = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    const { idCard } = req.body

    if (!idCard || idCard.length !== 13) {
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

    const { app_id } = applicant.rows[0]

    await client.query('BEGIN')

    const files = req.files as Record<string, Express.Multer.File[]>

    const docEntries = [
      { key: 'self_front',   type: 'self_house_front' },
      { key: 'self_back',    type: 'self_house_back' },
      { key: 'father_front', type: 'father_house_front' },
      { key: 'father_back',  type: 'father_house_back' },
      { key: 'mother_front', type: 'mother_house_front' },
      { key: 'mother_back',  type: 'mother_house_back' },
      { key: 'payment_slip', type: 'payment_slip' },
    ]

    for (const entry of docEntries) {
      const file = files?.[entry.key]?.[0]
      if (file) {
        // ลบของเดิมก่อน แล้วค่อย insert ใหม่
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
    console.error('❌ FULL ERROR:', JSON.stringify(err, Object.getOwnPropertyNames(err)))
    sendError(res, 'เกิดข้อผิดพลาดในการมอบตัว', 500, err)
  } finally {
    client.release()
  }
}

export const getEnrollmentStatus = async (req: Request, res: Response) => {
  try {
    const { idCard } = req.params
    const result = await pool.query(`
      SELECT a.app_id, a.prefix, a.full_name, a.status,
             c.cur_name, d.div_name,
             e.enrolled_at, e.verified_at AS enroll_verified_at
      FROM applicants a
      JOIN curriculums c ON c.cur_id = a.cur_id
      JOIN divisions d ON d.div_id = a.div_id
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

export const getEnrollmentSummary = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        ap.ap_id, ap.ap_years, ap.plan_num,
        c.cur_name, c.cur_shortname, c.cur_id,
        d.div_name,
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
               c.cur_name, c.cur_shortname, d.div_name, o.count
      ORDER BY ap.ap_years DESC, c.cur_id, d.div_name
    `)
    sendSuccess(res, result.rows)
  } catch (err) {
    sendError(res, 'ไม่สามารถดึงข้อมูลสรุปได้', 500, err)
  }
}