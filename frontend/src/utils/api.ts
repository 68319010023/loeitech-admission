import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Student API
export const studentAPI = {
  register: (data: any) => api.post('/students/register', data),
  verifyStatus: (idCardNumber: string) => api.post('/students/verify-status', { idCardNumber }),
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data: any) => api.put('/students/profile', data),
  getDepartments: () => api.get('/students/departments'),
  getCourses: (params: any) => api.get('/students/courses', { params }),
  createOrder: (data: any) => api.post('/students/orders', data),
  getOrders: () => api.get('/students/orders'),
  uploadPayment: (data: any) => api.post('/students/payment', data),
  getPaymentStatus: () => api.get('/students/payment-status'),
  getApplicationPDF: (id: string) => api.get(`/students/application-pdf/${id}`),
  getPaymentPDF: (id: string) => api.get(`/students/payment-pdf/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadImage: (formData: FormData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadDocument: (formData: FormData) => api.post('/upload/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  processOCR: (formData: FormData) => api.post('/upload/ocr/id-card', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getFile: (filename: string) => `${API_BASE_URL}/upload/${filename}`,
};

// Admin API
export const adminAPI = {
  // Departments
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data: any) => api.post('/admin/departments', data),
  updateDepartment: (id: string, data: any) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id: string) => api.delete(`/admin/departments/${id}`),
  
  // Courses
  getCourses: (params: any) => api.get('/admin/courses', { params }),
  createCourse: (data: any) => api.post('/admin/courses', data),
  updateCourse: (id: string, data: any) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/admin/courses/${id}`),
  
  // Students
  getStudents: (params: any) => api.get('/admin/students', { params }),
  getStudentById: (id: string) => api.get(`/admin/students/${id}`),
  updateStudentStatus: (id: string, status: string) => api.put(`/admin/students/${id}/status`, { status }),
  
  // Reports
  getApplicantSummary: () => api.get('/admin/summary/applicants'),
  getPaymentSummary: () => api.get('/admin/summary/payments'),
  getOrderSummary: () => api.get('/admin/summary/orders'),
  exportStudents: (params: any) => api.get('/admin/export/students', { params }),
  
  // Users
  getUsers: (params: any) => api.get('/admin/users', { params }),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};

export default api;
