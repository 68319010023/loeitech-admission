-- Student Registration System Database Schema
-- Technical College Lamphay

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    full_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    education_level VARCHAR(10) NOT NULL CHECK (education_level IN ('ปวช', 'ปวส')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    id_card_number VARCHAR(13) UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    education_level VARCHAR(10) NOT NULL CHECK (education_level IN ('ปวช', 'ปวส')),
    department_id UUID REFERENCES departments(id),
    course_id UUID REFERENCES courses(id),
    school_name VARCHAR(100),
    gpa DECIMAL(3,2),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student images table
CREATE TABLE student_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    image_type VARCHAR(20) NOT NULL CHECK (image_type IN ('id_card', 'education', 'certificate', 'student_card')),
    image_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    order_items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    slip_url VARCHAR(500),
    slip_file_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory items table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('uniform', 'equipment', 'stationery', 'accessories')),
    target_group VARCHAR(50) CHECK (target_group IN ('male', 'female', 'all', 'ปวช', 'ปวส', 'all_students')),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items junction table (alternative to JSONB)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_id_card_number ON students(id_card_number);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_education_level ON students(education_level);
CREATE INDEX idx_students_department_id ON students(department_id);
CREATE INDEX idx_student_images_student_id ON student_images(student_id);
CREATE INDEX idx_student_images_type ON student_images(image_type);
CREATE INDEX idx_orders_student_id ON orders(student_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_target_group ON inventory_items(target_group);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Students can only access their own data
CREATE POLICY "Students can view own data" ON students FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Students can update own data" ON students FOR UPDATE USING (auth.uid()::text = id::text);

-- Student images policy
CREATE POLICY "Students can view own images" ON student_images FOR SELECT USING (auth.uid()::text = student_id::text);
CREATE POLICY "Students can insert own images" ON student_images FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);

-- Orders policy
CREATE POLICY "Students can view own orders" ON orders FOR SELECT USING (auth.uid()::text = student_id::text);
CREATE POLICY "Students can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);

-- Payments policy
CREATE POLICY "Students can view own payments" ON payments FOR SELECT USING (auth.uid()::text = student_id::text);
CREATE POLICY "Students can create own payments" ON payments FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);

-- Insert initial data
INSERT INTO departments (name, description) VALUES
('คอมพิวเตอร์ธุรกิจ', 'สาขาวิชาคอมพิวเตอร์ธุรกิจ'),
('ช่างไฟฟ้า', 'สาขาวิชาช่างไฟฟ้า'),
('ช่างกลโรงงาน', 'สาขาวิชาช่างกลโรงงาน'),
('ช่างยนต์', 'สาขาวิชาช่างยนต์'),
('เทคโนโลยีสารสนเทศ', 'สาขาวิชาเทคโนโลยีสารสนเทศ'),
('การบัญชี', 'สาขาวิชาการบัญชี');

-- Insert sample courses
INSERT INTO courses (name, department_id, education_level, description) VALUES
('เทคโนโลยีสารสนเทศ', (SELECT id FROM departments WHERE name = 'คอมพิวเตอร์ธุรกิจ'), 'ปวช', 'หลักสูตรประกาศนียบัตรวิชาชีพ'),
('คอมพิวเตอร์ธุรกิจ', (SELECT id FROM departments WHERE name = 'คอมพิวเตอร์ธุรกิจ'), 'ปวส', 'หลักสูตรประกาศนียบัตรวิชาชีพชั้นสูง'),
('ช่างไฟฟ้ากำลัง', (SELECT id FROM departments WHERE name = 'ช่างไฟฟ้า'), 'ปวช', 'หลักสูตรช่างไฟฟ้ากำลัง'),
('ช่างไฟฟ้ากำลัง', (SELECT id FROM departments WHERE name = 'ช่างไฟฟ้า'), 'ปวส', 'หลักสูตรช่างไฟฟ้ากำลังชั้นสูง');

-- Insert sample inventory items
INSERT INTO inventory_items (name, description, category, target_group, price, stock_quantity) VALUES
('เสื้อยืดนักศึกษา', 'เสื้อยืดประจำสถาบัน', 'uniform', 'all_students', 150, 100),
('กางเกงขาสั้น', 'กางเกงขาสั้นนักศึกษา', 'uniform', 'all_students', 200, 100),
('ชุดพละ', 'ชุดพละนักศึกษา', 'uniform', 'all_students', 300, 50),
('เข็มขัด', 'เข็มขัดนักศึกษา', 'uniform', 'male', 100, 100),
('เข็มกลัด', 'เข็มกลัดประจำสถาบัน', 'accessories', 'all_students', 50, 200),
('กระดุม', 'กระดุมเครื่องแบบ', 'accessories', 'female', 10, 500),
('ปากกา', 'ปากกาลูกลื่น', 'stationery', 'all_students', 10, 1000),
('สมุด', 'สมุดเขียน', 'stationery', 'all_students', 15, 500),
('ดินสอกด', 'ดินสอกด', 'stationery', 'all_students', 5, 1000),
('วงเวียน', 'วงเวียน', 'stationery', 'all_students', 8, 500);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('college_name', 'วิทยาลัยเทคนิคเลย', 'ชื่อวิทยาลัย'),
('college_address', '-', 'ที่อยู่วิทยาลัย'),
('college_phone', '053-xxxxxx', 'เบอร์โทรศัพท์วิทยาลัย'),
('college_email', 'info@lamphaytech.ac.th', 'อีเมลวิทยาลัย'),
('bank_account_name', 'ร้านค้าสวัสดิการวิทยาลัยเทคนิคเลย', 'ชื่อบัญชีธนาคาร'),
('bank_account_number', 'xxxx-x-x-x-x-xx', 'เลขที่บัญชีธนาคาร'),
('bank_name', 'ธนาคารกรุงไทย', 'ชื่อธนาคาร'),
('registration_fee', '100', 'ค่าธรรมเนียมการสมัคร'),
('max_file_size', '10485760', 'ขนาดไฟล์สูงสุด (bytes)');

-- Create admin user (password: admin123)
INSERT INTO users (username, email, password, role, full_name) VALUES
('admin', 'admin@lamphaytech.ac.th', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'ผู้ดูแลระบบ');

-- Create function to validate Thai ID number
CREATE OR REPLACE FUNCTION validate_thai_id(id_number VARCHAR(13))
RETURNS BOOLEAN AS $$
DECLARE
    sum INTEGER := 0;
    i INTEGER;
    digit INTEGER;
    checksum INTEGER;
BEGIN
    -- Check if ID is exactly 13 digits
    IF LENGTH(id_number) != 13 OR id_number ~ '[^0-9]' THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate checksum
    FOR i IN 1..12 LOOP
        digit := CAST(SUBSTRING(id_number, i, 1) AS INTEGER);
        sum := sum + (digit * (13 - i + 1));
    END LOOP;
    
    checksum := (11 - (sum % 11)) % 10;
    
    RETURN checksum = CAST(SUBSTRING(id_number, 13, 1) AS INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate Thai ID number
CREATE OR REPLACE FUNCTION validate_student_id_card()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT validate_thai_id(NEW.id_card_number) THEN
        RAISE EXCEPTION 'Invalid Thai ID number format';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_student_id_card_trigger
    BEFORE INSERT OR UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION validate_student_id_card();

-- Create view for student statistics
CREATE VIEW student_statistics AS
SELECT 
    COUNT(*) as total_students,
    COUNT(*) FILTER (WHERE education_level = 'ปวช') as total_pavoc,
    COUNT(*) FILTER (WHERE education_level = 'ปวส') as total_pavas,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_students,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_students,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_students,
    COUNT(*) FILTER (WHERE gender = 'male') as male_students,
    COUNT(*) FILTER (WHERE gender = 'female') as female_students
FROM students;

-- Create view for payment statistics
CREATE VIEW payment_statistics AS
SELECT 
    COUNT(*) as total_payments,
    SUM(amount) as total_amount,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_payments,
    COUNT(*) FILTER (WHERE status = 'verified') as verified_payments,
    SUM(amount) FILTER (WHERE status = 'verified') as verified_amount
FROM payments;

-- Create view for order statistics
CREATE VIEW order_statistics AS
SELECT 
    COUNT(*) as total_orders,
    SUM(total_amount) as total_order_amount,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders
FROM orders;
