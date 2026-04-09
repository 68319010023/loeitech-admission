import { Request, Response } from 'express'
import pool from '../config/db'

// GET /api/admin/applicants
// ดึงรายชื่อผู้สมัครทั้งหมด พร้อม join หลักสูตร + สาขา + การชำระเงิน
export const getApplicants = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        a.app_id,
        a.prefix,
        a.full_name,
        a.id_card_number,
        a.phone,
        a.email,
        a.status,
        a.created_at,
        c.cur_id,
        c.cur_name,
         c.cur_shortname,
        d.div_id,
        d.div_name,
        p.total_amount,
        p.paid_at,
        p.slip_name
      FROM applicants a
      JOIN curriculums c ON a.cur_id = c.cur_id
      JOIN divisions d ON a.div_id = d.div_id
      LEFT JOIN payments p ON a.app_id = p.app_id
      ORDER BY a.created_at DESC
    `
    const result = await pool.query(query)

    const applicants = result.rows.map(row => ({
      app_id:         row.app_id,
      prefix:         row.prefix,
      full_name:      row.full_name,
      id_card_number: row.id_card_number,
      phone:          row.phone,
      email:          row.email,
      status:         row.status,
      created_at:     row.created_at,
      curriculum: {
        cur_id:   row.cur_id,
        cur_name: row.cur_name,
        cur_shortname: row.cur_shortname,
      },
      division: {
        div_id:   row.div_id,
        div_name: row.div_name,
      },
      payment: {
        total_amount: row.total_amount,
        paid_at:      row.paid_at,
        slip_name:    row.slip_name,
      },
    }))

    res.json({ success: true, data: applicants })
  } catch (error) {
    console.error('Error fetching applicants:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch applicants' })
  }
}