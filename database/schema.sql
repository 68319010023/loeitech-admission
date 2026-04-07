-- ============================================================
-- Student Registration System Database Schema
-- วิทยาลัยเทคนิคเลย — โครงสร้างใหม่ (ปรับปรุงรวมทั้งหมด)
-- ============================================================

-- Enable UUID extension (สำหรับ users เท่านั้น)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ตาราง curriculums (หลักสูตร)  ← สร้างก่อนสุด
-- ============================================================
CREATE TABLE curriculums (
    cur_id        SERIAL PRIMARY KEY,
    cur_name      VARCHAR(200) NOT NULL,   -- ชื่อหลักสูตร เช่น ประกาศนียบัตรวิชาชีพ
    cur_shortname VARCHAR(50)  NOT NULL
);

-- ============================================================
-- 2. ตาราง divisions (สาขาวิชา)
-- ============================================================
CREATE TABLE divisions (
    div_id     SERIAL PRIMARY KEY,
    div_name   VARCHAR(100) NOT NULL,                            -- ชื่อสาขา เช่น คอมพิวเตอร์ธุรกิจ
    cur_id     INTEGER NOT NULL REFERENCES curriculums(cur_id)
);

-- ============================================================
-- 3. ตาราง admission_plan (แผนรับสมัคร)
-- ============================================================
CREATE TABLE admission_plan (
    ap_id      SERIAL PRIMARY KEY,
    ap_years   VARCHAR(10)  NOT NULL,                              -- ปีการศึกษา เช่น '2568'
    div_id     INTEGER NOT NULL REFERENCES divisions(div_id),      -- FK → divisions
    cur_id     INTEGER NOT NULL REFERENCES curriculums(cur_id),    -- FK → curriculums
    plan_num   INTEGER NOT NULL
);

-- ============================================================
-- 4. ตาราง expense_detail (ค่าใช้จ่าย)
-- ============================================================
CREATE TABLE expense_detail (
    exp_id     SERIAL PRIMARY KEY,
    exp_name   VARCHAR(200) NOT NULL,                              -- ชื่อรายการค่าใช้จ่าย
    exp_detail TEXT         NOT NULL,                              -- รายละเอียด
    exp_img    TEXT,                                               -- รูปประกอบ (allow null)
    cur_id     INTEGER NOT NULL REFERENCES curriculums(cur_id),    -- FK → curriculums
    exp_cost   DOUBLE PRECISION NOT NULL
);

-- ============================================================
-- 5. ตาราง users (ผู้ใช้งานระบบ)
-- ============================================================
CREATE TABLE users (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username   VARCHAR(50)  UNIQUE NOT NULL,
    email      VARCHAR(100) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    full_name  VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. ตาราง students (นักศึกษา)
-- ============================================================
CREATE TABLE students (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name      VARCHAR(50)  NOT NULL,
    last_name       VARCHAR(50)  NOT NULL,
    id_card_number  VARCHAR(13)  UNIQUE NOT NULL,
    birth_date      DATE         NOT NULL,
    gender          VARCHAR(10)  NOT NULL CHECK (gender IN ('male', 'female')),
    address         TEXT,
    phone           VARCHAR(20),
    email           VARCHAR(100),
    -- เชื่อมกับโครงสร้างใหม่
    cur_id          INTEGER REFERENCES curriculums(cur_id),  -- FK → curriculums (ระดับการศึกษา)
    div_id          INTEGER REFERENCES divisions(div_id),    -- FK → divisions (สาขาวิชา)
    -- ข้อมูลการศึกษาเดิม
    school_name     VARCHAR(100),
    gpa             DECIMAL(3,2),
    -- ข้อมูลผู้ปกครอง
    parent_name     VARCHAR(100),
    parent_phone    VARCHAR(20),
    -- สถานะ
    status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. ตาราง student_images (รูปภาพเอกสาร)
-- ============================================================
CREATE TABLE student_images (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    image_type VARCHAR(20) NOT NULL
               CHECK (image_type IN ('id_card', 'education', 'certificate', 'student_card')),
    image_url  VARCHAR(500) NOT NULL,
    file_name  VARCHAR(255),
    file_size  INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 8. ตาราง inventory_items (สินค้าคลัง)
-- ============================================================
CREATE TABLE inventory_items (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    category       VARCHAR(50)  NOT NULL
                   CHECK (category IN ('uniform', 'equipment', 'stationery', 'accessories')),
    target_group   VARCHAR(50)
                   CHECK (target_group IN ('male', 'female', 'all', 'all_students')),
    -- เชื่อมกับ curriculums แทน education_level เดิม
    cur_id         INTEGER REFERENCES curriculums(cur_id),
    price          DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    is_active      BOOLEAN DEFAULT true,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 9. ตาราง orders (คำสั่งซื้อ)
-- ============================================================
CREATE TABLE orders (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    order_items  JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status       VARCHAR(20) DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    notes        TEXT,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 10. ตาราง order_items (รายการสินค้าในคำสั่งซื้อ)
-- ============================================================
CREATE TABLE order_items (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id),
    quantity          INTEGER       NOT NULL,
    unit_price        DECIMAL(10,2) NOT NULL,
    total_price       DECIMAL(10,2) NOT NULL,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 11. ตาราง payments (การชำระเงิน)
-- ============================================================
CREATE TABLE payments (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    order_id      UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount        DECIMAL(10,2) NOT NULL,
    slip_url      VARCHAR(500),
    slip_file_name VARCHAR(255),
    status        VARCHAR(20) DEFAULT 'pending'
                  CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_by   UUID REFERENCES users(id),
    verified_at   TIMESTAMP WITH TIME ZONE,
    notes         TEXT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 12. ตาราง system_settings (ตั้งค่าระบบ)
-- ============================================================
CREATE TABLE system_settings (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key   VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description   TEXT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 13. ตาราง audit_logs (บันทึกการใช้งาน)
-- ============================================================
CREATE TABLE audit_logs (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES users(id),
    action     VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id  UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_divisions_cur_id          ON divisions(cur_id);
CREATE INDEX idx_admission_plan_div_id     ON admission_plan(div_id);
CREATE INDEX idx_admission_plan_cur_id     ON admission_plan(cur_id);
CREATE INDEX idx_admission_plan_years      ON admission_plan(ap_years);
CREATE INDEX idx_expense_detail_cur_id     ON expense_detail(cur_id);
CREATE INDEX idx_students_id_card_number   ON students(id_card_number);
CREATE INDEX idx_students_status           ON students(status);
CREATE INDEX idx_students_cur_id           ON students(cur_id);
CREATE INDEX idx_students_div_id           ON students(div_id);
CREATE INDEX idx_student_images_student_id ON student_images(student_id);
CREATE INDEX idx_student_images_type       ON student_images(image_type);
CREATE INDEX idx_orders_student_id         ON orders(student_id);
CREATE INDEX idx_orders_status             ON orders(status);
CREATE INDEX idx_payments_student_id       ON payments(student_id);
CREATE INDEX idx_payments_status           ON payments(status);
CREATE INDEX idx_inventory_items_category  ON inventory_items(category);
CREATE INDEX idx_audit_logs_user_id        ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at     ON audit_logs(created_at);

-- ============================================================
-- TRIGGERS — auto update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_curriculums_updated_at    BEFORE UPDATE ON curriculums    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_divisions_updated_at      BEFORE UPDATE ON divisions      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admission_plan_updated_at BEFORE UPDATE ON admission_plan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_detail_updated_at BEFORE UPDATE ON expense_detail FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at          BEFORE UPDATE ON users          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at       BEFORE UPDATE ON students       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at         BEFORE UPDATE ON orders         FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at       BEFORE UPDATE ON payments       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- ============================================================
-- VALIDATE THAI ID
-- ============================================================
CREATE OR REPLACE FUNCTION validate_thai_id(id_number VARCHAR(13))
RETURNS BOOLEAN AS $$
DECLARE
    sum INTEGER := 0;
    i INTEGER;
    digit INTEGER;
    checksum INTEGER;
BEGIN
    IF LENGTH(id_number) != 13 OR id_number ~ '[^0-9]' THEN
        RETURN FALSE;
    END IF;
    FOR i IN 1..12 LOOP
        digit := CAST(SUBSTRING(id_number, i, 1) AS INTEGER);
        sum := sum + (digit * (13 - i + 1));
    END LOOP;
    checksum := (11 - (sum % 11)) % 10;
    RETURN checksum = CAST(SUBSTRING(id_number, 13, 1) AS INTEGER);
END;
$$ LANGUAGE plpgsql;

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
    FOR EACH ROW EXECUTE FUNCTION validate_student_id_card();

-- ============================================================
-- VIEWS
-- ============================================================
CREATE VIEW student_statistics AS
SELECT
    COUNT(*)                                        AS total_students,
    COUNT(*) FILTER (WHERE cur_id = 1)              AS total_pavoc,   -- ปวช
    COUNT(*) FILTER (WHERE cur_id = 2)              AS total_pavas,   -- ปวส
    COUNT(*) FILTER (WHERE status = 'pending')      AS pending_students,
    COUNT(*) FILTER (WHERE status = 'approved')     AS approved_students,
    COUNT(*) FILTER (WHERE status = 'completed')    AS completed_students,
    COUNT(*) FILTER (WHERE gender = 'male')         AS male_students,
    COUNT(*) FILTER (WHERE gender = 'female')       AS female_students
FROM students;

CREATE VIEW payment_statistics AS
SELECT
    COUNT(*)                                            AS total_payments,
    SUM(amount)                                         AS total_amount,
    COUNT(*) FILTER (WHERE status = 'pending')          AS pending_payments,
    COUNT(*) FILTER (WHERE status = 'verified')         AS verified_payments,
    SUM(amount) FILTER (WHERE status = 'verified')      AS verified_amount
FROM payments;

CREATE VIEW order_statistics AS
SELECT
    COUNT(*)                                            AS total_orders,
    SUM(total_amount)                                   AS total_order_amount,
    COUNT(*) FILTER (WHERE status = 'pending')          AS pending_orders,
    COUNT(*) FILTER (WHERE status = 'confirmed')        AS confirmed_orders,
    COUNT(*) FILTER (WHERE status = 'delivered')        AS delivered_orders
FROM orders;

-- ============================================================
-- SEED DATA (ข้อมูลตั้งต้น)
-- ============================================================

-- หลักสูตร
INSERT INTO curriculums (cur_name, cur_shortname) VALUES
('ประกาศนียบัตรวิชาชีพ',       'ปวช'),
('ประกาศนียบัตรวิชาชีพชั้นสูง', 'ปวส');

-- สาขาวิชา
INSERT INTO divisions (div_name, cur_id) VALUES
('คอมพิวเตอร์ธุรกิจ',  1),  -- ปวช
('ช่างไฟฟ้า',          1),
('ช่างกลโรงงาน',       1),
('ช่างยนต์',           1),
('การบัญชี',           1),
('เทคโนโลยีสารสนเทศ',  2),  -- ปวส
('คอมพิวเตอร์ธุรกิจ',  2),
('ช่างไฟฟ้ากำลัง',     2);

-- แผนรับสมัคร ปีการศึกษา 2568
INSERT INTO admission_plan (ap_years, div_id, cur_id, plan_num) VALUES
('2568', 1, 1, 30),
('2568', 2, 1, 30),
('2568', 3, 1, 30),
('2568', 4, 1, 30),
('2568', 5, 1, 30),
('2568', 6, 2, 20),
('2568', 7, 2, 20),
('2568', 8, 2, 20);

-- ค่าใช้จ่าย
INSERT INTO expense_detail (exp_name, exp_detail, cur_id, exp_cost) VALUES
('ค่าธรรมเนียมการเรียน ปวช', 'ค่าธรรมเนียมประจำภาคเรียน สำหรับนักศึกษา ปวช', 1, 2000.00),
('ค่าธรรมเนียมการเรียน ปวส', 'ค่าธรรมเนียมประจำภาคเรียน สำหรับนักศึกษา ปวส', 2, 2500.00),
('ค่าประกันอุบัติเหตุ',       'ค่าประกันอุบัติเหตุประจำปี',                    1, 100.00),
('ค่าประกันอุบัติเหตุ',       'ค่าประกันอุบัติเหตุประจำปี',                    2, 100.00);

-- สินค้าคลัง
INSERT INTO inventory_items (name, description, category, target_group, price, stock_quantity) VALUES
('เสื้อยืดนักศึกษา', 'เสื้อยืดประจำสถาบัน',   'uniform',     'all_students', 150,  100),
('กางเกงขาสั้น',     'กางเกงขาสั้นนักศึกษา',  'uniform',     'all_students', 200,  100),
('ชุดพละ',           'ชุดพละนักศึกษา',          'uniform',     'all_students', 300,   50),
('เข็มขัด',         'เข็มขัดนักศึกษา',         'uniform',     'male',         100,  100),
('เข็มกลัด',        'เข็มกลัดประจำสถาบัน',      'accessories', 'all_students',  50,  200),
('กระดุม',          'กระดุมเครื่องแบบ',          'accessories', 'female',         10,  500),
('ปากกา',           'ปากกาลูกลื่น',             'stationery',  'all_students',  10, 1000),
('สมุด',            'สมุดเขียน',                'stationery',  'all_students',  15,  500),
('ดินสอกด',         'ดินสอกด',                  'stationery',  'all_students',   5, 1000),
('วงเวียน',         'วงเวียน',                   'stationery',  'all_students',   8,  500);

-- ตั้งค่าระบบ
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('college_name',        'วิทยาลัยเทคนิคเลย',                    'ชื่อวิทยาลัย'),
('college_address',     '-',                                      'ที่อยู่วิทยาลัย'),
('college_phone',       '042-xxxxxx',                             'เบอร์โทรศัพท์วิทยาลัย'),
('college_email',       'info@loeitech.ac.th',                    'อีเมลวิทยาลัย'),
('bank_account_name',   'ร้านค้าสวัสดิการวิทยาลัยเทคนิคเลย',     'ชื่อบัญชีธนาคาร'),
('bank_account_number', 'xxxx-x-xxxxx-x',                         'เลขที่บัญชีธนาคาร'),
('bank_name',           'ธนาคารกรุงไทย',                         'ชื่อธนาคาร'),
('registration_fee',    '100',                                    'ค่าธรรมเนียมการสมัคร'),
('max_file_size',       '10485760',                               'ขนาดไฟล์สูงสุด (bytes)');

-- Admin user (password: admin123)
INSERT INTO users (username, email, password, role, full_name) VALUES
('admin', 'admin@loeitech.ac.th', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'ผู้ดูแลระบบ');

-- ============================================================
-- สรุปความสัมพันธ์ตาราง
-- ============================================================
--
--  curriculums (ปวช/ปวส)
--      ├── divisions          (สาขาวิชา)
--      │       └── admission_plan  (แผนรับสมัคร)
--      ├── expense_detail     (ค่าใช้จ่าย)
--      ├── inventory_items    (สินค้า — optional)
--      └── students
--              ├── student_images
--              ├── orders
--              │       └── order_items
--              └── payments
--
--  users ──── audit_logs
--        └─── payments (verified_by)
--
-- ============================================================