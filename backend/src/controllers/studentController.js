const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/database');
const jwt = require('jsonwebtoken');

const studentController = {
  // Register new student
  register: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        idCardNumber,
        birthDate,
        gender,
        address,
        phone,
        email,
        educationLevel,
        departmentId,
        courseId,
        schoolName,
        gpa,
        parentName,
        parentPhone,
        idCardImages = [],
        educationImages = [],
        certificateImages = [],
        studentCardImages = []
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !idCardNumber || !birthDate || !gender || !phone || !educationLevel || !departmentId || !courseId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if student already exists
      const { data: existingStudent, error: checkError } = await supabase
        .from('students')
        .select('id')
        .eq('id_card_number', idCardNumber)
        .single();

      if (existingStudent) {
        return res.status(400).json({ error: 'Student with this ID card number already exists' });
      }

      // Create new student
      const studentId = uuidv4();
      const { data: student, error: insertError } = await supabase
        .from('students')
        .insert({
          id: studentId,
          first_name: firstName,
          last_name: lastName,
          id_card_number: idCardNumber,
          birth_date: birthDate,
          gender,
          address,
          phone,
          email,
          education_level: educationLevel,
          department_id: departmentId,
          course_id: courseId,
          school_name: schoolName,
          gpa,
          parent_name: parentName,
          parent_phone: parentPhone,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return res.status(500).json({ error: 'Failed to register student' });
      }

      // Store uploaded images
      if (idCardImages.length > 0) {
        await Promise.all(idCardImages.map(async (image) => {
          await supabase
            .from('student_images')
            .insert({
              student_id: studentId,
              image_type: 'id_card',
              image_url: image.url,
              created_at: new Date().toISOString()
            });
        }));
      }

      if (educationImages.length > 0) {
        await Promise.all(educationImages.map(async (image) => {
          await supabase
            .from('student_images')
            .insert({
              student_id: studentId,
              image_type: 'education',
              image_url: image.url,
              created_at: new Date().toISOString()
            });
        }));
      }

      if (certificateImages.length > 0) {
        await Promise.all(certificateImages.map(async (image) => {
          await supabase
            .from('student_images')
            .insert({
              student_id: studentId,
              image_type: 'certificate',
              image_url: image.url,
              created_at: new Date().toISOString()
            });
        }));
      }

      if (studentCardImages.length > 0) {
        await Promise.all(studentCardImages.map(async (image) => {
          await supabase
            .from('student_images')
            .insert({
              student_id: studentId,
              image_type: 'student_card',
              image_url: image.url,
              created_at: new Date().toISOString()
            });
        }));
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: studentId, role: 'student' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

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

  // Verify student status by ID card number
  verifyStatus: async (req, res) => {
    try {
      const { idCardNumber } = req.body;

      if (!idCardNumber) {
        return res.status(400).json({ error: 'ID card number is required' });
      }

      const { data: student, error } = await supabase
        .from('students')
        .select(`
          *,
          departments(name),
          courses(name),
          student_images(image_type, image_url)
        `)
        .eq('id_card_number', idCardNumber)
        .single();

      if (error || !student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json({
        status: student.status,
        student: {
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          idCardNumber: student.id_card_number,
          department: student.departments?.name,
          course: student.courses?.name,
          images: student.student_images
        }
      });
    } catch (error) {
      console.error('Status verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all departments
  getDepartments: async (req, res) => {
    try {
      const { data: departments, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch departments' });
      }

      res.json(departments);
    } catch (error) {
      console.error('Departments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all courses
  getCourses: async (req, res) => {
    try {
      const { departmentId, educationLevel } = req.query;

      let query = supabase.from('courses').select('*');

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      if (educationLevel) {
        query = query.eq('education_level', educationLevel);
      }

      const { data: courses, error } = await query.order('name');

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch courses' });
      }

      res.json(courses);
    } catch (error) {
      console.error('Courses error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get student profile
  getProfile: async (req, res) => {
    try {
      const studentId = req.user.id;

      const { data: student, error } = await supabase
        .from('students')
        .select(`
          *,
          departments(name),
          courses(name),
          student_images(image_type, image_url),
          orders(id, order_items, total_amount, status, created_at),
          payments(id, amount, status, slip_url, created_at)
        `)
        .eq('id', studentId)
        .single();

      if (error || !student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json(student);
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update student profile
  updateProfile: async (req, res) => {
    try {
      const studentId = req.user.id;
      const updates = req.body;

      const { data: student, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      res.json({
        message: 'Profile updated successfully',
        student
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create order
  createOrder: async (req, res) => {
    try {
      const studentId = req.user.id;
      const { items } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order items are required' });
      }

      const orderId = uuidv4();
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          student_id: studentId,
          order_items: items,
          total_amount: totalAmount,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to create order' });
      }

      res.status(201).json({
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get student orders
  getOrders: async (req, res) => {
    try {
      const studentId = req.user.id;

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }

      res.json(orders);
    } catch (error) {
      console.error('Orders error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Upload payment slip
  uploadPaymentSlip: async (req, res) => {
    try {
      const studentId = req.user.id;
      const { orderId, slipUrl, amount } = req.body;

      if (!orderId || !slipUrl || !amount) {
        return res.status(400).json({ error: 'Order ID, slip URL, and amount are required' });
      }

      const paymentId = uuidv4();

      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          id: paymentId,
          student_id: studentId,
          order_id: orderId,
          amount,
          slip_url: slipUrl,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to upload payment slip' });
      }

      res.status(201).json({
        message: 'Payment slip uploaded successfully',
        payment
      });
    } catch (error) {
      console.error('Payment slip error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get payment status
  getPaymentStatus: async (req, res) => {
    try {
      const studentId = req.user.id;

      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders(order_items, total_amount)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch payment status' });
      }

      res.json(payments);
    } catch (error) {
      console.error('Payment status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get application PDF
  getApplicationPDF: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: student, error } = await supabase
        .from('students')
        .select(`
          *,
          departments(name),
          courses(name),
          student_images(image_type, image_url)
        `)
        .eq('id', id)
        .single();

      if (error || !student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // This would generate PDF - for now return data
      res.json({
        student,
        pdfUrl: `/api/pdf/download/application/${id}`
      });
    } catch (error) {
      console.error('Application PDF error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get payment PDF
  getPaymentPDF: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: payment, error } = await supabase
        .from('payments')
        .select(`
          *,
          students(first_name, last_name, id_card_number),
          orders(order_items, total_amount)
        `)
        .eq('id', id)
        .single();

      if (error || !payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      // This would generate PDF - for now return data
      res.json({
        payment,
        pdfUrl: `/api/pdf/download/payment/${id}`
      });
    } catch (error) {
      console.error('Payment PDF error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = studentController;
