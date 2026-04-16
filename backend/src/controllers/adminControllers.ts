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

// GET /api/admin/applicants/:app_id/documents
// ดึงเอกสารทั้งหมดของผู้สมัคร
export const getApplicantDocuments = async (req: Request, res: Response) => {
  try {
    const { app_id } = req.params;
    
    const query = `
      SELECT 
        d.doc_id,
        d.doc_type,
        d.file_name,
        d.file_size,
        d.uploaded_at,
        a.prefix,
        a.full_name,
        a.id_card_number
      FROM documents d
      JOIN applicants a ON d.app_id = a.app_id
      WHERE d.app_id = $1
      ORDER BY d.uploaded_at ASC
    `;
    
    const result = await pool.query(query, [app_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบเอกสารของผู้สมัครคนนี้' 
      });
    }
    
    const applicantInfo = {
      app_id: result.rows[0].app_id,
      prefix: result.rows[0].prefix,
      full_name: result.rows[0].full_name,
      id_card_number: result.rows[0].id_card_number
    };
    
    const documents = result.rows.map(row => ({
      doc_id: row.doc_id,
      doc_type: row.doc_type,
      file_name: row.file_name,
      file_size: row.file_size,
      uploaded_at: row.uploaded_at,
      file_url: `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/${encodeURIComponent(row.file_name)}`
    }));
    
    res.json({ 
      success: true, 
      data: {
        applicant: applicantInfo,
        documents: documents
      }
    });
    
  } catch (error) {
    console.error('Error fetching applicant documents:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch applicant documents' })
  }
}