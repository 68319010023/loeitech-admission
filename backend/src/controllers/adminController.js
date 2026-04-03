const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const adminController = {

  // ============================================================
  // CURRICULUM MANAGEMENT (แทน Department เดิม)
  // ============================================================
  createCurriculum: async (req, res) => {
    try {
      const { cur_name, cur_shortname } = req.body;
      if (!cur_name || !cur_shortname)
        return res.status(400).json({ error: 'cur_name and cur_shortname are required' });

      const result = await pool.query(
        'INSERT INTO curriculums (cur_name, cur_shortname) VALUES ($1, $2) RETURNING *',
        [cur_name, cur_shortname]
      );
      res.status(201).json({ message: 'Curriculum created successfully', curriculum: result.rows[0] });
    } catch (error) {
      console.error('Create curriculum error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getCurriculums: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT c.*,
          json_agg(
            json_build_object('div_id', d.div_id, 'div_name', d.div_name)
          ) FILTER (WHERE d.div_id IS NOT NULL) as divisions
        FROM curriculums c
        LEFT JOIN divisions d ON d.cur_id = c.cur_id
        GROUP BY c.cur_id
        ORDER BY c.cur_id
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Get curriculums error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateCurriculum: async (req, res) => {
    try {
      const { id } = req.params;
      const { cur_name, cur_shortname } = req.body;

      const result = await pool.query(
        'UPDATE curriculums SET cur_name=$1, cur_shortname=$2, updated_at=NOW() WHERE cur_id=$3 RETURNING *',
        [cur_name, cur_shortname, id]
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: 'Curriculum not found' });
      res.json({ message: 'Curriculum updated successfully', curriculum: result.rows[0] });
    } catch (error) {
      console.error('Update curriculum error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteCurriculum: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM curriculums WHERE cur_id=$1', [id]);
      res.json({ message: 'Curriculum deleted successfully' });
    } catch (error) {
      console.error('Delete curriculum error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // DIVISION MANAGEMENT (แทน Course เดิม)
  // ============================================================
  createDivision: async (req, res) => {
    try {
      const { div_name, cur_id } = req.body;
      if (!div_name || !cur_id)
        return res.status(400).json({ error: 'div_name and cur_id are required' });

      const result = await pool.query(
        'INSERT INTO divisions (div_name, cur_id) VALUES ($1, $2) RETURNING *',
        [div_name, cur_id]
      );
      res.status(201).json({ message: 'Division created successfully', division: result.rows[0] });
    } catch (error) {
      console.error('Create division error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getDivisions: async (req, res) => {
    try {
      const { cur_id } = req.query;
      let query = `
        SELECT d.*, c.cur_name, c.cur_shortname
        FROM divisions d
        LEFT JOIN curriculums c ON c.cur_id = d.cur_id
        WHERE 1=1
      `;
      const params = [];
      if (cur_id) { params.push(cur_id); query += ` AND d.cur_id=$${params.length}`; }
      query += ' ORDER BY d.div_name';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get divisions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateDivision: async (req, res) => {
    try {
      const { id } = req.params;
      const { div_name, cur_id } = req.body;

      const result = await pool.query(
        'UPDATE divisions SET div_name=$1, cur_id=$2, updated_at=NOW() WHERE div_id=$3 RETURNING *',
        [div_name, cur_id, id]
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: 'Division not found' });
      res.json({ message: 'Division updated successfully', division: result.rows[0] });
    } catch (error) {
      console.error('Update division error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteDivision: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM divisions WHERE div_id=$1', [id]);
      res.json({ message: 'Division deleted successfully' });
    } catch (error) {
      console.error('Delete division error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // ADMISSION PLAN MANAGEMENT
  // ============================================================
  createAdmissionPlan: async (req, res) => {
    try {
      const { ap_years, div_id, cur_id, plan_num } = req.body;
      if (!ap_years || !div_id || !cur_id || !plan_num)
        return res.status(400).json({ error: 'ap_years, div_id, cur_id and plan_num are required' });

      const result = await pool.query(
        'INSERT INTO admission_plan (ap_years, div_id, cur_id, plan_num) VALUES ($1, $2, $3, $4) RETURNING *',
        [ap_years, div_id, cur_id, plan_num]
      );
      res.status(201).json({ message: 'Admission plan created successfully', plan: result.rows[0] });
    } catch (error) {
      console.error('Create admission plan error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getAdmissionPlans: async (req, res) => {
    try {
      const { ap_years } = req.query;
      let query = `
        SELECT ap.*, d.div_name, c.cur_name, c.cur_shortname
        FROM admission_plan ap
        LEFT JOIN divisions d ON d.div_id = ap.div_id
        LEFT JOIN curriculums c ON c.cur_id = ap.cur_id
        WHERE 1=1
      `;
      const params = [];
      if (ap_years) { params.push(ap_years); query += ` AND ap.ap_years=$${params.length}`; }
      query += ' ORDER BY ap.ap_years DESC, d.div_name';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get admission plans error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateAdmissionPlan: async (req, res) => {
    try {
      const { id } = req.params;
      const { ap_years, div_id, cur_id, plan_num } = req.body;

      const result = await pool.query(
        'UPDATE admission_plan SET ap_years=$1, div_id=$2, cur_id=$3, plan_num=$4, updated_at=NOW() WHERE ap_id=$5 RETURNING *',
        [ap_years, div_id, cur_id, plan_num, id]
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: 'Admission plan not found' });
      res.json({ message: 'Admission plan updated successfully', plan: result.rows[0] });
    } catch (error) {
      console.error('Update admission plan error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteAdmissionPlan: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM admission_plan WHERE ap_id=$1', [id]);
      res.json({ message: 'Admission plan deleted successfully' });
    } catch (error) {
      console.error('Delete admission plan error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // EXPENSE DETAIL MANAGEMENT
  // ============================================================
  createExpenseDetail: async (req, res) => {
    try {
      const { exp_name, exp_detail, exp_img, cur_id, exp_cost } = req.body;
      if (!exp_name || !exp_detail || !cur_id || !exp_cost)
        return res.status(400).json({ error: 'exp_name, exp_detail, cur_id and exp_cost are required' });

      const result = await pool.query(
        'INSERT INTO expense_detail (exp_name, exp_detail, exp_img, cur_id, exp_cost) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [exp_name, exp_detail, exp_img || null, cur_id, exp_cost]
      );
      res.status(201).json({ message: 'Expense detail created successfully', expense: result.rows[0] });
    } catch (error) {
      console.error('Create expense detail error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getExpenseDetails: async (req, res) => {
    try {
      const { cur_id } = req.query;
      let query = `
        SELECT e.*, c.cur_name, c.cur_shortname
        FROM expense_detail e
        LEFT JOIN curriculums c ON c.cur_id = e.cur_id
        WHERE 1=1
      `;
      const params = [];
      if (cur_id) { params.push(cur_id); query += ` AND e.cur_id=$${params.length}`; }
      query += ' ORDER BY e.exp_name';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get expense details error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateExpenseDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const { exp_name, exp_detail, exp_img, cur_id, exp_cost } = req.body;

      const result = await pool.query(
        'UPDATE expense_detail SET exp_name=$1, exp_detail=$2, exp_img=$3, cur_id=$4, exp_cost=$5, updated_at=NOW() WHERE exp_id=$6 RETURNING *',
        [exp_name, exp_detail, exp_img || null, cur_id, exp_cost, id]
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: 'Expense detail not found' });
      res.json({ message: 'Expense detail updated successfully', expense: result.rows[0] });
    } catch (error) {
      console.error('Update expense detail error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteExpenseDetail: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM expense_detail WHERE exp_id=$1', [id]);
      res.json({ message: 'Expense detail deleted successfully' });
    } catch (error) {
      console.error('Delete expense detail error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // STUDENT MANAGEMENT
  // ============================================================
  getStudents: async (req, res) => {
    try {
      const { page = 1, limit = 50, status, cur_id, div_id } = req.query;
      const offset = (page - 1) * limit;
      const params = [];
      let where = 'WHERE 1=1';

      if (status)  { params.push(status);  where += ` AND s.status=$${params.length}`; }
      if (cur_id)  { params.push(cur_id);  where += ` AND s.cur_id=$${params.length}`; }
      if (div_id)  { params.push(div_id);  where += ` AND s.div_id=$${params.length}`; }

      params.push(limit, offset);
      const result = await pool.query(`
        SELECT s.*,
          c.cur_name, c.cur_shortname,
          d.div_name
        FROM students s
        LEFT JOIN curriculums c ON c.cur_id = s.cur_id
        LEFT JOIN divisions d   ON d.div_id = s.div_id
        ${where}
        ORDER BY s.created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `, params);

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM students s ${where}`,
        params.slice(0, -2)
      );
      const total = parseInt(countResult.rows[0].count);

      res.json({
        students: result.rows,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error) {
      console.error('Get students error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getStudentById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT s.*,
          c.cur_name, c.cur_shortname,
          d.div_name
        FROM students s
        LEFT JOIN curriculums c ON c.cur_id = s.cur_id
        LEFT JOIN divisions d   ON d.div_id = s.div_id
        WHERE s.id=$1
      `, [id]);

      if (result.rows.length === 0)
        return res.status(404).json({ error: 'Student not found' });
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get student error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateStudentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Status is required' });

      const result = await pool.query(
        'UPDATE students SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
        [status, id]
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: 'Student not found' });
      res.json({ message: 'Student status updated successfully', student: result.rows[0] });
    } catch (error) {
      console.error('Update student status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // SUMMARIES
  // ============================================================
  getApplicantSummary: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          s.status,
          c.cur_shortname,
          d.div_name
        FROM students s
        LEFT JOIN curriculums c ON c.cur_id = s.cur_id
        LEFT JOIN divisions d   ON d.div_id = s.div_id
      `);

      const summaryData = { total: result.rows.length, byCurriculum: {}, byDivision: {}, byStatus: {} };
      result.rows.forEach(s => {
        const cur  = s.cur_shortname || 'Unknown';
        const div  = s.div_name      || 'Unknown';
        const stat = s.status        || 'Unknown';
        summaryData.byCurriculum[cur]  = (summaryData.byCurriculum[cur]  || 0) + 1;
        summaryData.byDivision[div]    = (summaryData.byDivision[div]    || 0) + 1;
        summaryData.byStatus[stat]     = (summaryData.byStatus[stat]     || 0) + 1;
      });

      res.json(summaryData);
    } catch (error) {
      console.error('Applicant summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getPaymentSummary: async (req, res) => {
    try {
      const result = await pool.query('SELECT amount, status, created_at FROM payments');
      const summaryData = { totalAmount: 0, totalPayments: result.rows.length, byStatus: {}, monthlyTotals: {} };

      result.rows.forEach(p => {
        summaryData.totalAmount += parseFloat(p.amount || 0);
        summaryData.byStatus[p.status] = (summaryData.byStatus[p.status] || 0) + 1;
        const month = new Date(p.created_at).toISOString().substring(0, 7);
        summaryData.monthlyTotals[month] = (summaryData.monthlyTotals[month] || 0) + parseFloat(p.amount || 0);
      });

      res.json(summaryData);
    } catch (error) {
      console.error('Payment summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getOrderSummary: async (req, res) => {
    try {
      const result = await pool.query('SELECT order_items, total_amount, status, created_at FROM orders');
      const summaryData = { totalOrders: result.rows.length, totalAmount: 0, byStatus: {}, itemCounts: {} };

      result.rows.forEach(o => {
        summaryData.totalAmount += parseFloat(o.total_amount || 0);
        summaryData.byStatus[o.status] = (summaryData.byStatus[o.status] || 0) + 1;
        if (o.order_items) {
          o.order_items.forEach(item => {
            summaryData.itemCounts[item.name] = (summaryData.itemCounts[item.name] || 0) + (item.quantity || 1);
          });
        }
      });

      res.json(summaryData);
    } catch (error) {
      console.error('Order summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  exportStudents: async (req, res) => {
    try {
      const { format = 'json', cur_id, div_id, status } = req.query;
      const params = [];
      let where = 'WHERE 1=1';

      if (cur_id) { params.push(cur_id); where += ` AND s.cur_id=$${params.length}`; }
      if (div_id) { params.push(div_id); where += ` AND s.div_id=$${params.length}`; }
      if (status) { params.push(status); where += ` AND s.status=$${params.length}`; }

      const result = await pool.query(`
        SELECT s.*,
          c.cur_name, c.cur_shortname,
          d.div_name
        FROM students s
        LEFT JOIN curriculums c ON c.cur_id = s.cur_id
        LEFT JOIN divisions d   ON d.div_id = s.div_id
        ${where}
        ORDER BY s.created_at DESC
      `, params);

      res.json({ message: 'Students exported successfully', data: result.rows, format });
    } catch (error) {
      console.error('Export students error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // USER MANAGEMENT (ไม่เปลี่ยน)
  // ============================================================
  getUsers: async (req, res) => {
    try {
      const { page = 1, limit = 50, role } = req.query;
      const offset = (page - 1) * limit;
      const params = [];
      let where = 'WHERE 1=1';

      if (role) { params.push(role); where += ` AND role=$${params.length}`; }
      params.push(limit, offset);

      const result = await pool.query(
        `SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      );
      const countResult = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params.slice(0, -2));
      const total = parseInt(countResult.rows[0].count);

      res.json({ users: result.rows, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  createUser: async (req, res) => {
    try {
      const { username, email, password, role = 'admin', fullName } = req.body;
      if (!username || !email || !password)
        return res.status(400).json({ error: 'Username, email, and password are required' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (username, email, password, role, full_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [username, email, hashedPassword, role, fullName]
      );
      const user = result.rows[0];
      res.status(201).json({
        message: 'User created successfully',
        user: { id: user.id, username: user.username, email: user.email, role: user.role, full_name: user.full_name }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, password, role, full_name } = req.body;
      const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

      const result = await pool.query(
        `UPDATE users SET username=$1, email=$2, ${hashedPassword ? 'password=$3,' : ''} role=$${hashedPassword ? 4 : 3}, full_name=$${hashedPassword ? 5 : 4}, updated_at=NOW() WHERE id=$${hashedPassword ? 6 : 5} RETURNING *`,
        hashedPassword ? [username, email, hashedPassword, role, full_name, id] : [username, email, role, full_name, id]
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'User updated successfully', user: result.rows[0] });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM users WHERE id=$1', [id]);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = adminController;