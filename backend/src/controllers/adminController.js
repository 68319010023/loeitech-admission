const { supabase } = require('../config/database');

const adminController = {
  // Department management
  createDepartment: async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Department name is required' });
      }

      const { data: department, error } = await supabase
        .from('departments')
        .insert({
          name,
          description,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to create department' });
      }

      res.status(201).json({
        message: 'Department created successfully',
        department
      });
    } catch (error) {
      console.error('Create department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getDepartments: async (req, res) => {
    try {
      const { data: departments, error } = await supabase
        .from('departments')
        .select(`
          *,
          courses(id, name, education_level)
        `)
        .order('name');

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch departments' });
      }

      res.json(departments);
    } catch (error) {
      console.error('Get departments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data: department, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update department' });
      }

      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }

      res.json({
        message: 'Department updated successfully',
        department
      });
    } catch (error) {
      console.error('Update department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteDepartment: async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Failed to delete department' });
      }

      res.json({ message: 'Department deleted successfully' });
    } catch (error) {
      console.error('Delete department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Course management
  createCourse: async (req, res) => {
    try {
      const { name, departmentId, educationLevel, description } = req.body;

      if (!name || !departmentId || !educationLevel) {
        return res.status(400).json({ error: 'Name, department ID, and education level are required' });
      }

      const { data: course, error } = await supabase
        .from('courses')
        .insert({
          name,
          department_id: departmentId,
          education_level: educationLevel,
          description,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to create course' });
      }

      res.status(201).json({
        message: 'Course created successfully',
        course
      });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getCourses: async (req, res) => {
    try {
      const { departmentId, educationLevel } = req.query;

      let query = supabase
        .from('courses')
        .select(`
          *,
          departments(name)
        `);

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
      console.error('Get courses error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data: course, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update course' });
      }

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json({
        message: 'Course updated successfully',
        course
      });
    } catch (error) {
      console.error('Update course error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Failed to delete course' });
      }

      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Delete course error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Student management
  getStudents: async (req, res) => {
    try {
      const { page = 1, limit = 50, status, educationLevel, departmentId } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('students')
        .select(`
          *,
          departments(name),
          courses(name),
          payments(amount, status, created_at)
        `, { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }

      if (educationLevel) {
        query = query.eq('education_level', educationLevel);
      }

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data: students, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch students' });
      }

      res.json({
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get students error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getStudentById: async (req, res) => {
    try {
      const { id } = req.params;

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
        .eq('id', id)
        .single();

      if (error || !student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json(student);
    } catch (error) {
      console.error('Get student error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateStudentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const { data: student, error } = await supabase
        .from('students')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update student status' });
      }

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json({
        message: 'Student status updated successfully',
        student
      });
    } catch (error) {
      console.error('Update student status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Reports and summaries
  getApplicantSummary: async (req, res) => {
    try {
      const { data: summary, error } = await supabase
        .from('students')
        .select('education_level, departments(name), status')
        .select(`
          education_level,
          departments(name),
          status
        `);

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch applicant summary' });
      }

      // Process summary data
      const summaryData = {
        total: summary.length,
        byEducationLevel: {},
        byDepartment: {},
        byStatus: {}
      };

      summary.forEach(student => {
        // Count by education level
        summaryData.byEducationLevel[student.education_level] = 
          (summaryData.byEducationLevel[student.education_level] || 0) + 1;

        // Count by department
        const deptName = student.departments?.name || 'Unknown';
        summaryData.byDepartment[deptName] = 
          (summaryData.byDepartment[deptName] || 0) + 1;

        // Count by status
        summaryData.byStatus[student.status] = 
          (summaryData.byStatus[student.status] || 0) + 1;
      });

      res.json(summaryData);
    } catch (error) {
      console.error('Applicant summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getPaymentSummary: async (req, res) => {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, status, created_at');

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch payment summary' });
      }

      // Process payment data
      const summaryData = {
        totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        totalPayments: payments.length,
        byStatus: {},
        monthlyTotals: {}
      };

      payments.forEach(payment => {
        // Count by status
        summaryData.byStatus[payment.status] = 
          (summaryData.byStatus[payment.status] || 0) + 1;

        // Monthly totals
        const month = new Date(payment.created_at).toISOString().substring(0, 7);
        summaryData.monthlyTotals[month] = 
          (summaryData.monthlyTotals[month] || 0) + (payment.amount || 0);
      });

      res.json(summaryData);
    } catch (error) {
      console.error('Payment summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getOrderSummary: async (req, res) => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('order_items, total_amount, status, created_at');

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch order summary' });
      }

      // Process order data
      const summaryData = {
        totalOrders: orders.length,
        totalAmount: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        byStatus: {},
        itemCounts: {}
      };

      orders.forEach(order => {
        // Count by status
        summaryData.byStatus[order.status] = 
          (summaryData.byStatus[order.status] || 0) + 1;

        // Count items
        if (order.order_items) {
          order.order_items.forEach(item => {
            summaryData.itemCounts[item.name] = 
              (summaryData.itemCounts[item.name] || 0) + (item.quantity || 1);
          });
        }
      });

      res.json(summaryData);
    } catch (error) {
      console.error('Order summary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Export students to Excel (placeholder)
  exportStudents: async (req, res) => {
    try {
      const { format = 'json', departmentId, educationLevel, status } = req.query;

      let query = supabase
        .from('students')
        .select(`
          *,
          departments(name),
          courses(name)
        `);

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      if (educationLevel) {
        query = query.eq('education_level', educationLevel);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data: students, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to export students' });
      }

      // For now, return JSON data
      res.json({
        message: 'Students exported successfully',
        data: students,
        format
      });
    } catch (error) {
      console.error('Export students error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // User management
  getUsers: async (req, res) => {
    try {
      const { page = 1, limit = 50, role } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('users')
        .select('*', { count: 'exact' });

      if (role) {
        query = query.eq('role', role);
      }

      const { data: users, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch users' });
      }

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  createUser: async (req, res) => {
    try {
      const { username, email, password, role = 'admin', fullName } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
      }

      // Hash password (simplified - use bcrypt in production)
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: user, error } = await supabase
        .from('users')
        .insert({
          username,
          email,
          password: hashedPassword,
          role,
          full_name: fullName,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Hash password if provided
      if (updates.password) {
        const bcrypt = require('bcryptjs');
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update user' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Failed to delete user' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = adminController;
