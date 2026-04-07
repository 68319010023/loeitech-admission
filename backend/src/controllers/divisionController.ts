import { Request, Response } from 'express'
import pool from '../config/db'

// Get all divisions with curriculum info
export const getDivisions = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        d.*,
        c.cur_name
      FROM divisions d
      JOIN curriculums c ON d.cur_id = c.cur_id
      ORDER BY c.cur_name ASC, d.div_name ASC
    `
    const result = await pool.query(query)
    
    const divisions = result.rows.map(row => ({
      div_id: row.div_id,
      div_name: row.div_name,
      cur_id: row.cur_id,
      curriculum: {
        cur_id: row.cur_id,
        cur_name: row.cur_name
      }
    }))
    
    res.json({ success: true, data: divisions })
  } catch (error) {
    console.error('Error fetching divisions:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch divisions' })
  }
}

// Create new division
export const createDivision = async (req: Request, res: Response) => {
  try {
    const { div_name, cur_id } = req.body
    
    if (!div_name || !cur_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Division name and curriculum are required' 
      })
    }

    const query = `
      INSERT INTO divisions (div_name, cur_id)
      VALUES ($1, $2)
      RETURNING *
    `
    const result = await pool.query(query, [div_name, cur_id])
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0],
      message: 'Division created successfully'
    })
  } catch (error) {
    console.error('Error creating division:', error)
    res.status(500).json({ success: false, message: 'Failed to create division' })
  }
}

// Update division
export const updateDivision = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { div_name, cur_id } = req.body
    
    const query = `
      UPDATE divisions 
      SET div_name = $1, cur_id = $2
      WHERE div_id = $3
      RETURNING *
    `
    const result = await pool.query(query, [div_name, cur_id, id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Division not found' })
    }
    
    res.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Division updated successfully'
    })
  } catch (error) {
    console.error('Error updating division:', error)
    res.status(500).json({ success: false, message: 'Failed to update division' })
  }
}

// Delete division
export const deleteDivision = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    // Check if division is referenced by admission plans
    const checkQuery = 'SELECT COUNT(*) as count FROM admission_plan WHERE div_id = $1'
    const checkResult = await pool.query(checkQuery, [id])
    const referencedCount = parseInt(checkResult.rows[0].count)
    
    if (referencedCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `ไม่สามารถลบสาขาวิชานี้ได้ เนื่องจากยังมีแผนรับสมัคร ${referencedCount} แผนที่ใช้สาขาวิชานี้อยู่ กรุณาลบแผนรับสมัครที่เกี่ยวข้องก่อน` 
      })
    }
    
    const query = 'DELETE FROM divisions WHERE div_id = $1 RETURNING *'
    const result = await pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Division not found' })
    }
    
    res.json({ 
      success: true, 
      message: 'Division deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting division:', error)
    res.status(500).json({ success: false, message: 'Failed to delete division' })
  }
}
