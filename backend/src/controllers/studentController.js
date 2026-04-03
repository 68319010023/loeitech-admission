const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');

const studentController = {

  // ============================================================
  // REGISTER
  // ============================================================
  register: async (req, res) => {
    try {
      const {
        firstName, lastName, idCardNumber, birthDate, gender,
        address, phone, email,
        cur_id, div_id,           // แทน educationLevel, departmentId, courseId เดิม
        schoolName, gpa, parentName, parentPhone,
        idCardImages = [], educationImages = [], certificateImages = [], studentCardImages = []
      } = req.body;

      if (!firstName || !lastName || !idCardNumber || !birthDate || !gender || !phone || !cur_id || !div_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // ตรวจสอบว่า cur_id และ div_id มีอยู่จริง
      const curCheck = await pool.query('SELECT cur_id FROM curriculums WHERE cur_id=$1', [cur_id]);
      if (curCheck.rows.length === 0) return res.status(400).json({ error: 'Invalid curriculum (cur_id)' });

      const divCheck = await pool.query('SELECT div_id FROM divisions WHERE div_id=$1 AND cur_id=$2', [div_id, cur_id]);
      if (divCheck.rows.length === 0) return res.status(400).json({ error: 'Invalid division (div_id) for this curriculum' });

      // ตรวจสอบเลขบัตรประชาชนซ้ำ
      const existing = await pool.query('SELECT id FROM students WHERE id_card_number=$1', [idCardNumber]);
      if (existing.rows.length > 0) return res.status(400).json({ error: 'Student with this ID card number already exists' });

      // Insert student
      const studentId = uuidv4();
      const result = await pool.query(`
        INSERT INTO students (
          id, first_name, last_name, id_card_number, birth_date, gender,
          address, phone, email,
          cur_id, div_id,
          school_name, gpa, parent_name, parent_phone, status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pending')
        RETURNING *
      `, [studentId, firstName, lastName, idCardNumber, birthDate, gender,
          address, phone, email, cur_id, div_id, schoolName, gpa, parentName, parentPhone]);

      const student = result.rows[0];

      // Insert images
      const allImages = [
        ...idCardImages.map(img    => ({ type: 'id_card',      url: img.url })),
        ...educationImages.map(img => ({ type: 'education',    url: img.url })),
        ...certificateImages.map(img => ({ type: 'certificate', url: img.url })),
        ...studentCardImages.map(img => ({ type: 'student_card', url: img.url }))
      ];

      await Promise.all(allImages.map(img =>
        pool.query(
          'INSERT INTO student_images (student_id, image_type, image_url) VALUES ($1,$2,$3)',
          [studentId, img.type, img.url]
        )
      ));

      const token = jwt.sign({ userId: studentId, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        message: 'Student registered successfully',
        student: {
          id: studentId,
          firstName: student.first_name,
          lastName: student.last_name,
          idCardNumber: student.id_card_number,
          status: student.status
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // VERIFY STATUS
  // ============================================================
  verifyStatus: async (req, res) => {
    try {
      const { idCardNumber } = req.body;
      if (!idCardNumber) return res.status(400).json({ error: 'ID card number is required' });

      const result = await pool.query(`
        SELECT s.*,
          c.cur_name, c.cur_shortname,
          d.div_name
        FROM students s
        LEFT JOIN curriculums c ON c.cur_id = s.cur_id
        LEFT JOIN divisions d   ON d.div_id = s.div_id
        WHERE s.id_card_number=$1
      `, [idCardNumber]);

      if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

      const student = result.rows[0];
      const images = await pool.query(
        'SELECT image_type, image_url FROM student_images WHERE student_id=$1',
        [student.id]
      );

      res.json({
        status: student.status,
        student: {
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          idCardNumber: student.id_card_number,
          curriculum: student.cur_shortname,   // แทน department เดิม
          division: student.div_name,           // แทน course เดิม
          images: images.rows
        }
      });
    } catch (error) {
      console.error('Status verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  getCurriculums: async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM curriculums ORDER BY cur_id');
      res.json(result.rows);
    } catch (error) {
      console.error('Curriculums error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  getDivisions: async (req, res) => {
    try {
      const { cur_id } = req.query;
      const params = [];
      let where = 'WHERE 1=1';

      if (cur_id) { params.push(cur_id); where += ` AND d.cur_id=$${params.length}`; }

      const result = await pool.query(`
        SELECT d.*, c.cur_name, c.cur_shortname
        FROM divisions d
        LEFT JOIN curriculums c ON c.cur_id = d.cur_id
        ${where}
        ORDER BY d.div_name
      `, params);

      res.json(result.rows);
    } catch (error) {
      console.error('Divisions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // GET EXPENSE DETAILS (ใหม่ — ให้นักศึกษาดูค่าใช้จ่ายของตัวเอง)
  // ============================================================
  getExpenseDetails: async (req, res) => {
    try {
      const studentId = req.user.id;

      // ดึง cur_id ของนักศึกษาก่อน
      const stuResult = await pool.query('SELECT cur_id FROM students WHERE id=$1', [studentId]);
      if (stuResult.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

      const { cur_id } = stuResult.rows[0];

      const result = await pool.query(`
        SELECT e.*, c.cur_shortname
        FROM expense_detail e
        LEFT JOIN curriculums c ON c.cur_id = e.cur_id
        WHERE e.cur_id=$1
        ORDER BY e.exp_name
      `, [cur_id]);

      res.json(result.rows);
    } catch (error) {
      console.error('Expense details error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // GET PROFILE
  // ============================================================
  getProfile: async (req, res) => {
    try {
      const studentId = req.user.id;
      const result = await pool.query(`
        SELECT s.*,
          c.cur_name, c.cur_shortname,
          d.div_name
        FROM students s
        LEFT JOIN curriculums c ON c.cur_id = s.cur_id
        LEFT JOIN divisions d   ON d.div_id = s.div_id
        WHERE s.id=$1
      `, [studentId]);

      if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

      const student = result.rows[0];
      const images   = await pool.query('SELECT * FROM student_images WHERE student_id=$1', [studentId]);
      const orders   = await pool.query('SELECT * FROM orders   WHERE student_id=$1 ORDER BY created_at DESC', [studentId]);
      const payments = await pool.query('SELECT * FROM payments WHERE student_id=$1 ORDER BY created_at DESC', [studentId]);

      res.json({ ...student, images: images.rows, orders: orders.rows, payments: payments.rows });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // UPDATE PROFILE
  // ============================================================
  updateProfile: async (req, res) => {
    try {
      const studentId = req.user.id;
      const { address, phone, email, parent_name, parent_phone } = req.body;

      const result = await pool.query(
        'UPDATE students SET address=$1, phone=$2, email=$3, parent_name=$4, parent_phone=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
        [address, phone, email, parent_name, parent_phone, studentId]
      );

      res.json({ message: 'Profile updated successfully', student: result.rows[0] });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // ORDERS
  // ============================================================
  createOrder: async (req, res) => {
    try {
      const studentId = req.user.id;
      const { items } = req.body;
      if (!items || items.length === 0) return res.status(400).json({ error: 'Order items are required' });

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const result = await pool.query(
        "INSERT INTO orders (id, student_id, order_items, total_amount, status) VALUES ($1,$2,$3,$4,'pending') RETURNING *",
        [uuidv4(), studentId, JSON.stringify(items), totalAmount]
      );

      res.status(201).json({ message: 'Order created successfully', order: result.rows[0] });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getOrders: async (req, res) => {
    try {
      const studentId = req.user.id;
      const result = await pool.query(
        'SELECT * FROM orders WHERE student_id=$1 ORDER BY created_at DESC',
        [studentId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Orders error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // PAYMENTS
  // ============================================================
  uploadPaymentSlip: async (req, res) => {
    try {
      const studentId = req.user.id;
      const { orderId, slipUrl, amount } = req.body;
      if (!orderId || !slipUrl || !amount)
        return res.status(400).json({ error: 'Order ID, slip URL, and amount are required' });

      const result = await pool.query(
        "INSERT INTO payments (id, student_id, order_id, amount, slip_url, status) VALUES ($1,$2,$3,$4,$5,'pending') RETURNING *",
        [uuidv4(), studentId, orderId, amount, slipUrl]
      );

      res.status(201).json({ message: 'Payment slip uploaded successfully', payment: result.rows[0] });
    } catch (error) {
      console.error('Payment slip error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getPaymentStatus: async (req, res) => {
    try {
      const studentId = req.user.id;
      const result = await pool.query(`
        SELECT p.*, o.order_items, o.total_amount as order_total
        FROM payments p
        LEFT JOIN orders o ON o.id = p.order_id
        WHERE p.student_id=$1
        ORDER BY p.created_at DESC
      `, [studentId]);

      res.json(result.rows);
    } catch (error) {
      console.error('Payment status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================================================
  // PDF
  // ============================================================
  getApplicationPDF: async (req, res) => {
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

      if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

      const images = await pool.query('SELECT * FROM student_images WHERE student_id=$1', [id]);
      res.json({
        student: { ...result.rows[0], images: images.rows },
        pdfUrl: `/api/pdf/download/application/${id}`
      });
    } catch (error) {
      console.error('Application PDF error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getPaymentPDF: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT p.*, s.first_name, s.last_name, s.id_card_number,
          o.order_items, o.total_amount as order_total
        FROM payments p
        LEFT JOIN students s ON s.id = p.student_id
        LEFT JOIN orders o   ON o.id = p.order_id
        WHERE p.id=$1
      `, [id]);

      if (result.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
      res.json({ payment: result.rows[0], pdfUrl: `/api/pdf/download/payment/${id}` });
    } catch (error) {
      console.error('Payment PDF error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = studentController;