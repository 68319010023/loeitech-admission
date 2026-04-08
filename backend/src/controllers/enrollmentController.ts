import { Request, Response } from 'express'
import pool from '../config/db'
import { sendSuccess, sendError } from '../utils/response'

// มอบตัว
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
      ORDER BY a.created_at DESC
      LIMIT 1
    `, [idCard])

    if (applicant.rows.length === 0) {
      return sendError(res, 'ไม่พบข้อมูลการสมัครในระบบ', 404)
    }

    const { app_id, status } = applicant.rows[0]

    if (status === 'enrolled') {
      return sendError(res, 'ท่านได้ทำการมอบตัวแล้ว', 400)
    }

    if (!status || !['payment_confirmed', 'PAYMENT_CONFIRMED', 'Payment_Confirmed'].includes(status.toLowerCase())) {
      return sendError(res, 'ยังไม่ได้ชำระเงิน หรือยังไม่ได้รับการยืนยันการชำระเงิน', 400)
    }

    const existing = await client.query(
      'SELECT enroll_id FROM enrollments WHERE app_id = $1',
      [app_id]
    )
    if (existing.rows.length > 0) {
      return sendError(res, 'ท่านได้ทำการมอบตัวแล้ว', 400)
    }

    await client.query('BEGIN')

    await client.query(`
      INSERT INTO enrollments (app_id, enrolled_at)
      VALUES ($1, NOW())
    `, [app_id])

    await client.query(`
      UPDATE applicants SET status = 'enrolled' WHERE app_id = $1
    `, [app_id])

    await client.query('COMMIT')

    sendSuccess(res, { app_id }, 'มอบตัวเรียบร้อยแล้ว', 201)

  } catch (err) {
    await client.query('ROLLBACK')
    sendError(res, 'เกิดข้อผิดพลาดในการมอบตัว', 500, err)
  } finally {
    client.release()
  }
}

// ดึงข้อมูลการมอบตัว
export const getEnrollmentStatus = async (req: Request, res: Response) => {
  try {
    const { idCard } = req.params

    const result = await pool.query(`
      SELECT
        a.app_id, a.prefix, a.full_name, a.status,
        c.cur_name, d.div_name,
        e.enrolled_at
      FROM applicants a
      JOIN curriculums c ON c.cur_id = a.cur_id
      JOIN divisions d ON d.div_id = a.div_id
      LEFT JOIN enrollments e ON e.app_id = a.app_id
      WHERE a.id_card_number = $1
      ORDER BY a.created_at DESC
      LIMIT 1
    `, [idCard])

    if (result.rows.length === 0) {
      return sendError(res, 'ไม่พบข้อมูลการสมัคร', 404)
    }

    sendSuccess(res, result.rows[0])
  } catch (err) {
    sendError(res, 'เกิดข้อผิดพลาด', 500, err)
  }
}