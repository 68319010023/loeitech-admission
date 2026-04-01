export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  idCardNumber: string;
  birthDate: string;
  gender: 'male' | 'female';
  address?: string;
  phone?: string;
  email?: string;
  educationLevel: 'ปวช' | 'ปวส';
  departmentId: string;
  courseId: string;
  schoolName?: string;
  gpa?: number;
  parentName?: string;
  parentPhone?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  departmentId: string;
  educationLevel: 'ปวช' | 'ปวส';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentImage {
  id: string;
  studentId: string;
  imageType: 'id_card' | 'education' | 'certificate' | 'student_card';
  imageUrl: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
}

export interface Order {
  id: string;
  studentId: string;
  orderItems: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: 'uniform' | 'equipment' | 'stationery' | 'accessories';
  targetGroup: 'male' | 'female' | 'all' | 'ปวช' | 'ปวส' | 'all_students';
}

export interface Payment {
  id: string;
  studentId: string;
  orderId: string;
  amount: number;
  slipUrl?: string;
  slipFileName?: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: 'uniform' | 'equipment' | 'stationery' | 'accessories';
  targetGroup: 'male' | 'female' | 'all' | 'ปวช' | 'ปวส' | 'all_students';
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
  fullName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OCRResult {
  id_number?: string;
  name?: string;
  last_name?: string;
  birth_date?: string;
  address?: string;
  issue_date?: string;
  expiry_date?: string;
  id_number_valid?: boolean;
  full_name?: string;
  raw_text: Array<{
    text: string;
    confidence: number;
  }>;
  processed_at: string;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  idCardNumber: string;
  birthDate: string;
  gender: 'male' | 'female';
  address?: string;
  phone?: string;
  email?: string;
  educationLevel: 'ปวช' | 'ปวส';
  departmentId: string;
  courseId: string;
  schoolName?: string;
  gpa?: number;
  parentName?: string;
  parentPhone?: string;
  idCardImages: Array<{ url: string; fileName: string }>;
  educationImages: Array<{ url: string; fileName: string }>;
  certificateImages: Array<{ url: string; fileName: string }>;
  studentCardImages: Array<{ url: string; fileName: string }>;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
