import { Request, Response } from 'express'
import pool from '../config/db'

// Get all curriculums
export const getCurriculums = async (_req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM curriculums ORDER BY cur_id'
    const result = await pool.query(query)
    
    res.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error fetching curriculums:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch curriculums' })
  }
}

// Create new curriculum
export const createCurriculum = async (req: Request, res: Response) => {
  try {
    const { cur_name, cur_shortname } = req.body
    
    if (!cur_name || !cur_shortname) {
      return res.status(400).json({ 
        success: false, 
        message: 'Curriculum name and short name are required' 
      })
    }

    const query = `
      INSERT INTO curriculums (cur_name, cur_shortname)
      VALUES ($1, $2)
      RETURNING *
    `
    const result = await pool.query(query, [cur_name, cur_shortname])
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0],
      message: 'Curriculum created successfully'
    })
  } catch (error) {
    console.error('Error creating curriculum:', error)
    res.status(500).json({ success: false, message: 'Failed to create curriculum' })
  }
}

// Update curriculum
export const updateCurriculum = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { cur_name, cur_shortname } = req.body
    
    const query = `
      UPDATE curriculums 
      SET cur_name = $1, cur_shortname = $2
      WHERE cur_id = $3
      RETURNING *
    `
    const result = await pool.query(query, [cur_name, cur_shortname, id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Curriculum not found' })
    }
    
    res.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Curriculum updated successfully'
    })
  } catch (error) {
    console.error('Error updating curriculum:', error)
    res.status(500).json({ success: false, message: 'Failed to update curriculum' })
  }
}

// Delete curriculum
export const deleteCurriculum = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    // Check if curriculum is referenced by divisions
    const checkQuery = 'SELECT COUNT(*) as count FROM divisions WHERE cur_id = $1'
    const checkResult = await pool.query(checkQuery, [id])
    const referencedCount = parseInt(checkResult.rows[0].count)
    
    if (referencedCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `ไม่สามารถลบหลักสูตรนี้ได้ เนื่องจากยังมีสาขาวิชา ${referencedCount} สาขาที่ใช้หลักสูตรนี้อยู่ กรุณาลบสาขาวิชาที่เกี่ยวข้องก่อน` 
      })
    }
    
    const query = 'DELETE FROM curriculums WHERE cur_id = $1 RETURNING *'
    const result = await pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Curriculum not found' })
    }
    
    res.json({ 
      success: true, 
      message: 'Curriculum deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting curriculum:', error)
    res.status(500).json({ success: false, message: 'Failed to delete curriculum' })
  }
}
