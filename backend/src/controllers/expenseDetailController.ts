import { Request, Response } from 'express'
import pool from '../config/db'

// Get all expense details with related data
export const getExpenseDetails = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        ed.*,
        c.cur_name
      FROM expense_detail ed
      JOIN curriculums c ON ed.cur_id = c.cur_id
      ORDER BY c.cur_name ASC, ed.exp_name ASC
    `
    const result = await pool.query(query)
    
    const expenses = result.rows.map(row => ({
      exp_id: row.exp_id,
      exp_name: row.exp_name,
      exp_detail: row.exp_detail,
      exp_img: row.exp_img,
      exp_cost: parseFloat(row.exp_cost),
      payment_type: row.payment_type || 'mandatory',
      curriculum: {
        cur_id: row.cur_id,
        cur_name: row.cur_name
      }
    }))
    
    res.json({ success: true, data: expenses })
  } catch (error) {
    console.error('Error fetching expense details:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch expense details' })
  }
}

// Create new expense detail
export const createExpenseDetail = async (req: Request, res: Response) => {
  try {
    const { exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type } = req.body
    
    if (!exp_name || !exp_detail || !cur_id || !exp_cost) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      })
    }

    const query = `
      INSERT INTO expense_detail (exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    const result = await pool.query(query, [exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type || 'mandatory'])
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0],
      message: 'Expense detail created successfully'
    })
  } catch (error) {
    console.error('Error creating expense detail:', error)
    res.status(500).json({ success: false, message: 'Failed to create expense detail' })
  }
}

// Update expense detail
export const updateExpenseDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type } = req.body
    
    const query = `
      UPDATE expense_detail 
      SET exp_name = $1, exp_detail = $2, exp_img = $3, cur_id = $4, exp_cost = $5, payment_type = $6
      WHERE exp_id = $7
      RETURNING *
    `
    const result = await pool.query(query, [exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type, id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense detail not found' })
    }
    
    res.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Expense detail updated successfully'
    })
  } catch (error) {
    console.error('Error updating expense detail:', error)
    res.status(500).json({ success: false, message: 'Failed to update expense detail' })
  }
}

// Delete expense detail
export const deleteExpenseDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const query = 'DELETE FROM expense_detail WHERE exp_id = $1 RETURNING *'
    const result = await pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense detail not found' })
    }
    
    res.json({ 
      success: true, 
      message: 'Expense detail deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting expense detail:', error)
    res.status(500).json({ success: false, message: 'Failed to delete expense detail' })
  }
}
