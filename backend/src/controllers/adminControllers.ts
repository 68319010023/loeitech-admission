import { Request, Response } from 'express'
import pool from '../config/db'
import fs from 'fs'
import path from 'path'

const toUrl = (filePath: string | null) => {
  if (!filePath) return null
  const filename = filePath.replace(/\\/g, '/').split('/').pop()
  return `/uploads/${filename}`
}

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
        p.slip_name,
        p.slip_path,
        e.enrolled_at,   
        -- เพิ่ม 2 บรรทัดนี้
        MAX(CASE WHEN doc.doc_type = 'id_front' THEN doc.file_path END) AS id_front_path,
        MAX(CASE WHEN doc.doc_type = 'id_back'  THEN doc.file_path END) AS id_back_path,
        MAX(CASE WHEN doc.doc_type = 'edu_front' THEN doc.file_path END) AS edu_front_path
      FROM applicants a
      JOIN curriculums c ON a.cur_id = c.cur_id
      JOIN divisions d ON a.div_id = d.div_id
      LEFT JOIN payments p ON a.app_id = p.app_id
      LEFT JOIN enrollments e ON e.app_id = a.app_id
      -- เพิ่ม LEFT JOIN นี้
      LEFT JOIN documents doc ON doc.app_id = a.app_id
      -- เพิ่ม GROUP BY เพราะใช้ MAX()
      GROUP BY
        a.app_id, a.prefix, a.full_name, a.id_card_number,
        a.phone, a.email, a.status, a.created_at,
        c.cur_id, c.cur_name, c.cur_shortname,
        d.div_id, d.div_name,
        p.total_amount, p.paid_at, p.slip_name, p.slip_path,
        e.enrolled_at
      ORDER BY a.created_at DESC
    `
    const result = await pool.query(query)
    console.log('sample payment row:', result.rows[0])

    const applicants = result.rows.map(row => ({
      app_id:         row.app_id,
      prefix:         row.prefix,
      full_name:      row.full_name,
      id_card_number: row.id_card_number,
      phone:          row.phone,
      email:          row.email,
      status:         row.status,
      created_at:     row.created_at,
       enrolled_at: row.enrolled_at,
      

      // เพิ่ม 2 field นี้
      id_front_url:   toUrl(row.id_front_path),
      id_back_url:    toUrl(row.id_back_path),
      edu_front_url: toUrl(row.edu_front_path), 
      curriculum: {
        cur_id:        row.cur_id,
        cur_name:      row.cur_name,
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
       slip_url:     toUrl(row.slip_path),
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
    const appId = Array.isArray(app_id) ? app_id[0] : app_id;
    
  const query = `
  SELECT 
    d.doc_id,
    d.doc_type,
    d.file_name,
    d.file_path,
    d.file_size,
    d.uploaded_at,
    a.prefix,
    a.full_name,
    a.id_card_number,
    a.status,
    p.slip_approved,
    p.slip_error_message
  FROM documents d
  JOIN applicants a ON d.app_id = a.app_id
  LEFT JOIN payments p ON p.app_id = a.app_id
  WHERE d.app_id = $1
  ORDER BY d.uploaded_at ASC
`;
    
   const result = await pool.query(query, [appId]);

    
    const firstRow = result.rows[0];
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบเอกสารของผู้สมัครคนนี้' 
      });
    }
    
    const applicantInfo = {
      app_id:         appId,
      prefix:         firstRow.prefix,
      full_name:      firstRow.full_name,
      id_card_number: firstRow.id_card_number,
      status:         firstRow.status,
    };
    
    const documents = result.rows.map(row => ({
      doc_id:      row.doc_id,
      doc_type:    row.doc_type,
      file_name:   row.file_name,
      file_size:   row.file_size,
      uploaded_at: row.uploaded_at,
      file_url:    toUrl(row.file_path)
    }));
    
    // ✅ เพิ่ม comma หลัง documents และแก้ slip_error_message
    res.json({ 
      success: true, 
      data: {
        applicant:          applicantInfo,
        documents:          documents,
        slip_approved:      firstRow.slip_approved,
        slip_error_message: firstRow.slip_error_message ?? '',
      }
    });
    
  } catch (error) {
    console.error('Error fetching applicant documents:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch applicant documents' })
  }
}

export const truncateApplicants = async (_req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('TRUNCATE TABLE enrollments, applicant_expenses, payments, documents, applicants RESTART IDENTITY CASCADE')
    await client.query('COMMIT')

    // ลบไฟล์อัปโหลดทั้งหมด
    const uploadsDir = path.join(__dirname, '../../uploads')
    if (fs.existsSync(uploadsDir)) {
      for (const file of fs.readdirSync(uploadsDir)) {
        if (file !== '.gitkeep') fs.unlinkSync(path.join(uploadsDir, file))
      }
    }

    res.json({ success: true, message: 'ล้างข้อมูลผู้สมัครเรียบร้อยแล้ว' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('truncateApplicants error:', error)
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการล้างข้อมูล' })
  } finally {
    client.release()
  }
}