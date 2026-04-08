-- ============================================================
-- DATABASE SCHEMA: ltc_admission_db
-- วิทยาลัยเทคนิคเลย — ระบบรับสมัครนักเรียนนักศึกษาออนไลน์
-- ปีการศึกษา 2569
-- ============================================================
-- หมายเหตุ: ตารางทั้งหมดอยู่ใน schema "public"
-- UUID ใช้ uuid_generate_v4() จาก extension uuid-ossp
-- ============================================================


-- ------------------------------------------------------------
-- ENUM TYPES
-- ------------------------------------------------------------

-- payment_status / payment_type
-- ใช้แทนค่า string เพื่อความสม่ำเสมอของข้อมูลในคอลัมน์ payment_type
-- ค่าที่ใช้: 'บังคับจ่าย' หรือ 'ไม่บังคับจ่าย'
CREATE TYPE public.payment_type AS ENUM (
    'บังคับจ่าย',
    'ไม่บังคับจ่าย'
);


-- ============================================================
-- MASTER DATA TABLES (ตารางข้อมูลหลัก)
-- ตารางเหล่านี้เป็นข้อมูลที่ admin/staff กรอกไว้ล่วงหน้า
-- ============================================================


-- ------------------------------------------------------------
-- curriculums — หลักสูตร
-- ------------------------------------------------------------
-- เก็บประเภทหลักสูตรของวิทยาลัย
-- ตัวอย่างข้อมูล:
--   cur_id=1, cur_name='ประกาศนียบัตรวิชาชีพ', cur_shortname='ปวช.'
--   cur_id=2, cur_name='ประกาศนียบัตรวิชาชีพชั้นสูง', cur_shortname='ปวส.'
-- หมายเหตุ: cur_shortname ใช้ตรวจสอบสิทธิ์สมัครตามวุฒิการศึกษา
--   - วุฒิ ม.3  → สมัครได้เฉพาะ cur_shortname = 'ปวช.'
--   - วุฒิ ม.6  → สมัครได้เฉพาะ cur_shortname = 'ปวส.'
--   - วุฒิ ปวช. → สมัครได้เฉพาะ cur_shortname = 'ปวส.' ทุกสาขา
CREATE TABLE public.curriculums (
    cur_id  serial4      NOT NULL,  -- PK, auto increment
    cur_name     varchar(200) NULL, -- ชื่อเต็มของหลักสูตร
    cur_shortname varchar(50) NULL, -- ชื่อย่อ (ปวช./ปวส.) — ใช้ใน business logic
    CONSTRAINT curriculums_pkey PRIMARY KEY (cur_id)
);


-- ------------------------------------------------------------
-- divisions — สาขาวิชา
-- ------------------------------------------------------------
-- เก็บรายชื่อสาขาวิชาทั้งหมดของวิทยาลัย
-- แต่ละสาขาผูกกับหลักสูตร (ปวช. หรือ ปวส.) ผ่าน cur_id
-- ตัวอย่างข้อมูล:
--   div_id=1, div_name='ช่างยนต์', cur_id=1 (ปวช.)
--   div_id=2, div_name='เทคนิคยานยนต์', cur_id=2 (ปวส.)
CREATE TABLE public.divisions (
    div_id   serial4      NOT NULL,  -- PK, auto increment
    div_name varchar(100) NULL,      -- ชื่อสาขาวิชา
    cur_id   int4         NULL,      -- FK → curriculums.cur_id (หลักสูตรที่สาขานี้สังกัด)
    CONSTRAINT divisions_pkey PRIMARY KEY (div_id),
    CONSTRAINT fk_cur_id FOREIGN KEY (cur_id) REFERENCES public.curriculums(cur_id)
);


-- ------------------------------------------------------------
-- expense_detail — รายละเอียดค่าใช้จ่าย
-- ------------------------------------------------------------
-- เก็บรายการค่าใช้จ่ายของแต่ละหลักสูตร เช่น
--   ค่าธรรมเนียมการศึกษา, ค่าห้องสมุด, ค่าอินเทอร์เน็ต,
--   เครื่องแบบ, รองเท้า, อุปกรณ์การเรียน ฯลฯ
-- payment_type กำหนดว่ารายการนี้บังคับจ่ายหรือไม่
--   - 'บังคับจ่าย'    → ผู้สมัครต้องชำระทุกคน ไม่มีตัวเลือก
--   - 'ไม่บังคับจ่าย' → ผู้สมัครเลือกสั่งหรือไม่ก็ได้ (เช่น เครื่องแบบ)
CREATE TABLE public.expense_detail (
    exp_id       serial4      NOT NULL,  -- PK, auto increment
    exp_name     varchar(200) NULL,      -- ชื่อรายการค่าใช้จ่าย
    exp_detail   text         NOT NULL,  -- รายละเอียดเพิ่มเติม
    exp_img      text         NULL,      -- URL รูปภาพประกอบ (ถ้ามี)
    cur_id       int4         NULL,      -- FK → curriculums.cur_id (ค่าใช้จ่ายของหลักสูตรไหน)
    exp_cost     float8       NULL,      -- ราคาต่อหน่วย (บาท)
    payment_type varchar(20)  NULL,      -- 'บังคับจ่าย' หรือ 'ไม่บังคับจ่าย'
    CONSTRAINT expense_detail_pkey PRIMARY KEY (exp_id),
    CONSTRAINT fk_cur_id FOREIGN KEY (cur_id) REFERENCES public.curriculums(cur_id)
);


-- ------------------------------------------------------------
-- admission_plan — แผนการรับสมัครประจำปี
-- ------------------------------------------------------------
-- เก็บโควต้าการรับสมัครของแต่ละสาขา แต่ละปีการศึกษา
-- ใช้ดึงสาขาที่เปิดรับสมัคร และคำนวณที่นั่งว่างแบบ real-time
-- ตัวอย่าง: ปีการศึกษา 2569, สาขาช่างยนต์ (ปวช.) รับ 100 คน
-- หมายเหตุ: จำนวนที่ว่าง = plan_num - COUNT(applicants ที่เลือก ap_id นี้)
CREATE TABLE public.admission_plan (
    ap_id     serial4     NOT NULL,  -- PK, auto increment
    ap_years  varchar(10) NULL,      -- ปีการศึกษา เช่น '2569'
    div_id    int4        NULL,      -- FK → divisions.div_id (สาขาที่เปิดรับ)
    cur_id    int4        NULL,      -- FK → curriculums.cur_id (หลักสูตร)
    plan_num  int4        NULL,      -- โควต้าจำนวนที่นั่งที่เปิดรับ
    CONSTRAINT admission_plan_pkey PRIMARY KEY (ap_id),
    CONSTRAINT fk_cur_id FOREIGN KEY (cur_id) REFERENCES public.curriculums(cur_id),
    CONSTRAINT fk_div_id FOREIGN KEY (div_id) REFERENCES public.divisions(div_id)
);


-- ------------------------------------------------------------
-- users — เจ้าหน้าที่และผู้ดูแลระบบ
-- ------------------------------------------------------------
-- เก็บข้อมูล account สำหรับเจ้าหน้าที่ที่เข้าใช้ระบบหลังบ้าน
-- role มีสองค่าเท่านั้น: 'admin' หรือ 'staff'
--   - admin: จัดการระบบ ตั้งค่า อนุมัติ/ปฏิเสธ ได้ทุกอย่าง
--   - staff: ดูข้อมูลผู้สมัคร ยืนยันการชำระเงิน ยืนยันมอบตัว
-- password_hash: เก็บรหัสผ่านที่ผ่าน bcrypt แล้ว ไม่เก็บ plain text
CREATE TABLE public.users (
    id            uuid         DEFAULT gen_random_uuid() NOT NULL, -- PK, UUID auto
    username      varchar(100) NOT NULL,                           -- ชื่อผู้ใช้ (unique)
    password_hash varchar(255) NOT NULL,                           -- รหัสผ่าน (bcrypt hash)
    role          varchar(10)  NOT NULL,                           -- 'admin' หรือ 'staff'
    created_at    timestamp    DEFAULT now() NULL,                 -- วันที่สร้าง account
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff'))
);


-- ============================================================
-- TRANSACTION TABLES (ตารางข้อมูล transaction)
-- ตารางเหล่านี้สร้างขึ้นเมื่อผู้สมัครดำเนินการผ่านระบบ
-- ============================================================


-- ------------------------------------------------------------
-- applicants — ข้อมูลผู้สมัคร
-- ------------------------------------------------------------
-- ตารางหลักของระบบ เก็บข้อมูลส่วนตัวและการสมัครของผู้สมัครทุกคน
-- สร้างเมื่อ: ผู้สมัครกรอกข้อมูลครบ 5 ขั้นตอนและยืนยันการสมัคร
--
-- status มี 3 ค่า:
--   'pending_payment' → กรอกข้อมูลแล้ว รอชำระเงิน (ค่า default)
--   'paid'            → ชำระเงินแล้ว รอมอบตัว
--   'enrolled'        → มอบตัวแล้ว เป็นนักเรียน/นักศึกษาแล้ว
--
-- prev_level เก็บวุฒิการศึกษาเดิม:
--   'm3'  = ม.3  → สมัครได้เฉพาะ ปวช.
--   'm6'  = ม.6  → สมัครได้เฉพาะ ปวส. (เฉพาะสาขาที่รับ ม.6)
--   'pvc' = ปวช. → สมัครได้ ปวส. ทุกสาขา
CREATE TABLE public.applicants (
    app_id         uuid        DEFAULT uuid_generate_v4() NOT NULL, -- PK, UUID auto
    id_card_number varchar(13) NOT NULL,  -- เลขบัตรประชาชน 13 หลัก (unique, ผ่าน validate_thai_id)
    prefix         varchar(20) NOT NULL,  -- คำนำหน้าชื่อ (นาย/นาง/นางสาว/เด็กชาย/เด็กหญิง)
    full_name      varchar(200) NOT NULL, -- ชื่อ-นามสกุล
    address        text        NOT NULL,  -- ที่อยู่ปัจจุบัน
    phone          varchar(15) NOT NULL,  -- เบอร์โทรศัพท์ (format: 0XX-XXX-XXXX)
    email          varchar(200) NOT NULL, -- อีเมล
    prev_school    varchar(200) NOT NULL, -- ชื่อสถานศึกษาเดิม
    prev_level     varchar(10) NOT NULL,  -- วุฒิการศึกษา: 'm3', 'm6', 'pvc'
    prev_year      varchar(4)  NOT NULL,  -- ปีที่จบการศึกษา (พ.ศ.)
    gpa            varchar(10) NOT NULL,  -- เกรดเฉลี่ย
    cur_id         int4        NOT NULL,  -- FK → curriculums.cur_id (หลักสูตรที่สมัคร)
    div_id         int4        NOT NULL,  -- FK → divisions.div_id (สาขาวิชาที่สมัคร)
    ap_id          int4        NOT NULL,  -- FK → admission_plan.ap_id (แผนรับสมัครปีนี้)
    status         varchar(30) NOT NULL DEFAULT 'pending_payment', -- สถานะการสมัคร
    created_at     timestamp   DEFAULT now() NULL, -- วันที่สมัคร
    updated_at     timestamp   DEFAULT now() NULL, -- อัพเดทล่าสุด (auto via trigger)
    CONSTRAINT applicants_pkey PRIMARY KEY (app_id),
    CONSTRAINT applicants_id_card_number_key UNIQUE (id_card_number),
    CONSTRAINT fk_ap_id FOREIGN KEY (ap_id) REFERENCES public.admission_plan(ap_id),
    CONSTRAINT fk_cur_id FOREIGN KEY (cur_id) REFERENCES public.curriculums(cur_id),
    CONSTRAINT fk_div_id FOREIGN KEY (div_id) REFERENCES public.divisions(div_id)
);
-- Trigger: อัพเดท updated_at อัตโนมัติทุกครั้งที่มีการ UPDATE
-- Trigger: ตรวจสอบความถูกต้องของเลขบัตรประชาชน (checksum 13 หลัก) ก่อน INSERT/UPDATE


-- ------------------------------------------------------------
-- documents — ไฟล์เอกสารแนบ
-- ------------------------------------------------------------
-- เก็บ path ของไฟล์ที่ผู้สมัครอัพโหลดทั้งหมด
-- doc_type บอกประเภทของเอกสาร:
--   'id_front'        → บัตรประชาชนด้านหน้า (บังคับ)
--   'id_back'         → บัตรประชาชนด้านหลัง (บังคับ)
--   'certificate_front' → วุฒิการศึกษา (ป.พ.) ด้านหน้า
--   'certificate_back'  → วุฒิการศึกษา (ป.พ.) ด้านหลัง
--   'letter_front'    → หนังสือรับรองการเป็นนักเรียน
--   'studentcard_front' → บัตรนักเรียน
-- หมายเหตุ: ไฟล์จริงเก็บในโฟลเดอร์ uploads/ บน server
--           file_path คือ relative path เช่น 'uploads/1234567890.jpg'
CREATE TABLE public.documents (
    doc_id      uuid        DEFAULT uuid_generate_v4() NOT NULL, -- PK, UUID auto
    app_id      uuid        NOT NULL,      -- FK → applicants.app_id
    doc_type    varchar(50) NOT NULL,      -- ประเภทเอกสาร (ดูรายละเอียดด้านบน)
    file_path   text        NOT NULL,      -- path ไฟล์บน server
    file_name   varchar(200) NOT NULL,     -- ชื่อไฟล์ต้นฉบับที่ผู้ใช้อัพโหลด
    file_size   int4        NULL,          -- ขนาดไฟล์ (bytes)
    uploaded_at timestamp   DEFAULT now() NULL, -- วันเวลาที่อัพโหลด
    CONSTRAINT documents_pkey PRIMARY KEY (doc_id),
    CONSTRAINT fk_app_id FOREIGN KEY (app_id)
        REFERENCES public.applicants(app_id) ON DELETE CASCADE
    -- ON DELETE CASCADE: ถ้าลบ applicant จะลบเอกสารทั้งหมดด้วยอัตโนมัติ
);


-- ------------------------------------------------------------
-- applicant_expenses — รายการค่าใช้จ่ายของผู้สมัครแต่ละคน
-- ------------------------------------------------------------
-- เก็บรายการค่าใช้จ่ายที่ผู้สมัครเลือก/ถูกกำหนด ในขั้นตอนที่ 4
-- ความสัมพันธ์: applicants 1 → many applicant_expenses
--               expense_detail 1 → many applicant_expenses
--
-- is_required:
--   true  → รายการบังคับ (qty=1 เสมอ ไม่มีตัวเลือก)
--   false → รายการไม่บังคับ (ผู้สมัครเลือกจำนวนเอง)
--
-- unit_price เก็บราคา ณ เวลาที่สมัคร เพื่อกันกรณีราคาเปลี่ยนในภายหลัง
-- total_price = unit_price × quantity
CREATE TABLE public.applicant_expenses (
    ae_id       uuid    DEFAULT uuid_generate_v4() NOT NULL, -- PK, UUID auto
    app_id      uuid    NOT NULL,    -- FK → applicants.app_id
    exp_id      int4    NOT NULL,    -- FK → expense_detail.exp_id
    quantity    int4    DEFAULT 1 NOT NULL, -- จำนวนที่สั่ง
    size        varchar(10) NULL,    -- ไซส์ (XS/S/M/L/XL/XXL) สำหรับรายการเครื่องแบบ
    unit_price  float8  NOT NULL,    -- ราคาต่อหน่วย ณ เวลาที่สมัคร
    total_price float8  NOT NULL,    -- ยอดรวม (unit_price × quantity)
    is_required bool    DEFAULT false NOT NULL, -- บังคับจ่ายหรือไม่
    CONSTRAINT applicant_expenses_pkey PRIMARY KEY (ae_id),
    CONSTRAINT fk_app_id FOREIGN KEY (app_id)
        REFERENCES public.applicants(app_id) ON DELETE CASCADE,
    CONSTRAINT fk_exp_id FOREIGN KEY (exp_id)
        REFERENCES public.expense_detail(exp_id)
);


-- ------------------------------------------------------------
-- payments — การชำระเงิน
-- ------------------------------------------------------------
-- เก็บข้อมูลการชำระเงินของผู้สมัครแต่ละคน
-- ความสัมพันธ์: applicants 1 → 1 payments (UNIQUE constraint บน app_id)
--
-- ขั้นตอนการชำระเงิน:
--   1. ระบบสร้าง record นี้อัตโนมัติพร้อมกับ applicants
--   2. ผู้สมัครโอนเงินแล้วอัพโหลดสลิป → slip_path และ paid_at จะถูกอัพเดท
--   3. เจ้าหน้าที่ตรวจสอบและยืนยัน → verified_at และ verified_by จะถูกอัพเดท
--   4. สถานะ applicants.status เปลี่ยนจาก 'pending_payment' → 'paid'
--
-- due_date: วันกำหนดชำระ = created_at + 3 วัน
--           ถ้าไม่ชำระภายในกำหนด ระบบจะตัดสิทธิ์อัตโนมัติ
CREATE TABLE public.payments (
    pay_id          uuid    DEFAULT uuid_generate_v4() NOT NULL, -- PK, UUID auto
    app_id          uuid    NOT NULL,       -- FK → applicants.app_id (unique: 1 คน 1 ใบ)
    total_amount    float8  NOT NULL,       -- ยอดรวมทั้งหมด (บังคับ + ไม่บังคับที่เลือก)
    required_amount float8  NOT NULL,       -- ยอดบังคับจ่าย
    optional_amount float8  DEFAULT 0 NOT NULL, -- ยอดรายการไม่บังคับที่เลือกสั่ง
    slip_path       text    NULL,           -- path ไฟล์สลิปโอนเงิน (NULL = ยังไม่ได้อัพ)
    slip_name       varchar(200) NULL,      -- ชื่อไฟล์สลิป
    paid_at         timestamp NULL,         -- วันเวลาที่อัพโหลดสลิป (NULL = ยังไม่ชำระ)
    due_date        timestamp NOT NULL,     -- วันกำหนดชำระ (สร้างอัตโนมัติ = now() + 3 days)
    verified_at     timestamp NULL,         -- วันเวลาที่เจ้าหน้าที่ยืนยัน
    verified_by     varchar(200) NULL,      -- username ของเจ้าหน้าที่ที่ยืนยัน
    CONSTRAINT payments_pkey PRIMARY KEY (pay_id),
    CONSTRAINT payments_app_id_key UNIQUE (app_id),
    CONSTRAINT fk_app_id FOREIGN KEY (app_id)
        REFERENCES public.applicants(app_id) ON DELETE CASCADE
);


-- ------------------------------------------------------------
-- enrollments — การมอบตัว
-- ------------------------------------------------------------
-- เก็บข้อมูลการมอบตัวออนไลน์ของผู้สมัครที่ชำระเงินแล้ว
-- ความสัมพันธ์: applicants 1 → 1 enrollments (UNIQUE constraint บน app_id)
--
-- ขั้นตอนการมอบตัว:
--   1. ผู้สมัครที่ status = 'paid' เข้าหน้า "มอบตัว"
--   2. อัพโหลดสำเนาทะเบียนบ้านของตนเอง บิดา และมารดา
--   3. ระบบสร้าง record นี้ → enrolled_at จะถูกบันทึก
--   4. เจ้าหน้าที่ตรวจสอบเอกสาร → verified_at และ verified_by ถูกอัพเดท
--   5. สถานะ applicants.status เปลี่ยนจาก 'paid' → 'enrolled'
--      นับเป็นนักเรียน/นักศึกษาอย่างเป็นทางการแล้ว
CREATE TABLE public.enrollments (
    enroll_id          uuid DEFAULT uuid_generate_v4() NOT NULL, -- PK, UUID auto
    app_id             uuid NOT NULL,      -- FK → applicants.app_id (unique: 1 คน 1 ครั้ง)
    tabien_self_path   text NULL,          -- path สำเนาทะเบียนบ้านของตนเอง
    tabien_father_path text NULL,          -- path สำเนาทะเบียนบ้านบิดา
    tabien_mother_path text NULL,          -- path สำเนาทะเบียนบ้านมารดา
    enrolled_at        timestamp DEFAULT now() NULL, -- วันเวลาที่มอบตัว
    verified_at        timestamp NULL,     -- วันเวลาที่เจ้าหน้าที่ยืนยันเอกสาร
    verified_by        varchar(200) NULL,  -- username ของเจ้าหน้าที่ที่ยืนยัน
    CONSTRAINT enrollments_pkey PRIMARY KEY (enroll_id),
    CONSTRAINT enrollments_app_id_key UNIQUE (app_id),
    CONSTRAINT fk_app_id FOREIGN KEY (app_id)
        REFERENCES public.applicants(app_id) ON DELETE CASCADE
);


-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- update_updated_at_column()
-- Trigger function: อัพเดท updated_at = NOW() อัตโนมัติ
-- ใช้กับตาราง: applicants
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- validate_thai_id(varchar)
-- ตรวจสอบความถูกต้องของเลขบัตรประชาชนไทย 13 หลัก
-- ใช้ algorithm checksum มาตรฐานของกรมการปกครอง
-- คืนค่า TRUE ถ้าถูกต้อง, FALSE ถ้าไม่ถูกต้อง
CREATE OR REPLACE FUNCTION public.validate_thai_id(id_number varchar)
RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE
    sum INTEGER := 0;
    i INTEGER;
    digit INTEGER;
    checksum INTEGER;
BEGIN
    -- ต้องมี 13 หลักและเป็นตัวเลขเท่านั้น
    IF LENGTH(id_number) != 13 OR id_number ~ '[^0-9]' THEN
        RETURN FALSE;
    END IF;
    -- คำนวณ checksum ด้วย algorithm กรมการปกครอง
    FOR i IN 1..12 LOOP
        digit := CAST(SUBSTRING(id_number, i, 1) AS INTEGER);
        sum := sum + (digit * (13 - i + 1));
    END LOOP;
    checksum := (11 - (sum % 11)) % 10;
    RETURN checksum = CAST(SUBSTRING(id_number, 13, 1) AS INTEGER);
END;
$$;

-- validate_student_id_card()
-- Trigger function: เรียก validate_thai_id() ก่อน INSERT/UPDATE ใน applicants
-- ถ้าเลขไม่ถูกต้องจะ RAISE EXCEPTION และ rollback อัตโนมัติ
CREATE OR REPLACE FUNCTION public.validate_student_id_card()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NOT validate_thai_id(NEW.id_card_number) THEN
        RAISE EXCEPTION 'Invalid Thai ID number format';
    END IF;
    RETURN NEW;
END;
$$;


-- ============================================================
-- RELATIONSHIP DIAGRAM (ภาพรวมความสัมพันธ์)
-- ============================================================
--
--  curriculums ──┬────────── divisions
--    (ปวช./ปวส.) │               │
--                │               │
--                ├── expense_detail    admission_plan ◄──┤
--                │   (ค่าใช้จ่าย)      (โควต้าต่อปี)      │
--                │        │                  │           │
--                └────────┴──────── applicants ──────────┘
--                                      │
--               ┌──────────────────────┼─────────────────────┐
--               │                      │                     │
--          documents           applicant_expenses        payments
--         (เอกสารแนบ)           (รายการค่าใช้จ่าย)     (การชำระเงิน)
--                                                            │
--                                                       enrollments
--                                                       (การมอบตัว)
--
-- ============================================================
-- STATUS FLOW (สถานะการสมัคร)
-- ============================================================
--
--  [กรอกข้อมูลครบ]
--       ↓
--  pending_payment  →  paid  →  enrolled
--  (รอชำระเงิน)    (ชำระแล้ว)  (มอบตัวแล้ว)
--       ↓               ↓           ↓
--  ถ้าไม่ชำระ      รอมอบตัว    เป็นนักเรียน
--  ภายใน 3 วัน    ผ่านระบบ    อย่างเป็นทางการ
--  ตัดสิทธิ์
--
-- ============================================================