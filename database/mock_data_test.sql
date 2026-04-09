-- ============================================================
-- MOCK DATA: ltc_admission_test
-- วิทยาลัยเทคนิคเลย — ข้อมูลทดสอบ
-- ============================================================
-- รันไฟล์นี้หลังจาก schema.sql แล้วเท่านั้น
-- ============================================================

-- ── TRUNCATE (เคลียร์ข้อมูลเก่าก่อน) ──────────────────────
TRUNCATE TABLE
  enrollments,
  payments,
  applicant_expenses,
  documents,
  applicants,
  admission_plan,
  expense_detail,
  divisions,
  curriculums,
  users
RESTART IDENTITY CASCADE;

-- ── USERS ──────────────────────────────────────────────────
-- superadmin  password: Admin@1234
-- staff1      password: Staff@1234
-- staff2      password: Staff@1234
INSERT INTO users (username, password_hash, role) VALUES
  ('superadmin', '$2b$10$2V5bi11jdGsHUObkX3kH3eq4EYp1ncxQRd7Dg/G9Il9FwSseBAiUi', 'admin'),
  ('admin',      '$2b$10$2V5bi11jdGsHUObkX3kH3eq4EYp1ncxQRd7Dg/G9Il9FwSseBAiUi', 'admin'),
  ('staff1',     '$2b$10$n94ktD.jdt0PPy2Y5Mniz.d3VkQGH4oo6tSAWdP29AfeCOuVqsqZa', 'staff'),
  ('staff2',     '$2b$10$n94ktD.jdt0PPy2Y5Mniz.d3VkQGH4oo6tSAWdP29AfeCOuVqsqZa', 'staff');

-- หมายเหตุ: superadmin และ admin ใช้ hash เดียวกัน (admin123)
-- staff1, staff2 ใช้ hash เดียวกัน (staff123)

-- ── CURRICULUMS ────────────────────────────────────────────
INSERT INTO curriculums (cur_name, cur_shortname) VALUES
  ('ประกาศนียบัตรวิชาชีพ',         'ปวช.'),   -- cur_id = 1
  ('ประกาศนียบัตรวิชาชีพชั้นสูง',  'ปวส.');   -- cur_id = 2

-- ── DIVISIONS ──────────────────────────────────────────────
-- ปวช. (cur_id = 1)
INSERT INTO divisions (div_name, cur_id) VALUES
  ('ช่างยนต์',           1),   -- div_id = 1
  ('ช่างไฟฟ้ากำลัง',    1),   -- div_id = 2
  ('ช่างอิเล็กทรอนิกส์', 1),  -- div_id = 3
  ('ช่างก่อสร้าง',       1),   -- div_id = 4
  ('การบัญชี',           1),   -- div_id = 5
  ('คอมพิวเตอร์ธุรกิจ',  1);  -- div_id = 6

-- ปวส. (cur_id = 2)
INSERT INTO divisions (div_name, cur_id) VALUES
  ('เทคนิคยานยนต์',      2),   -- div_id = 7
  ('ไฟฟ้ากำลัง',         2),   -- div_id = 8
  ('อิเล็กทรอนิกส์',     2),   -- div_id = 9
  ('การบัญชี',           2),   -- div_id = 10
  ('คอมพิวเตอร์ธุรกิจ',  2);  -- div_id = 11

-- ── ADMISSION PLAN (ปีการศึกษา 2568) ──────────────────────
-- ปวช.
INSERT INTO admission_plan (ap_years, div_id, cur_id, plan_num) VALUES
  ('2568', 1, 1, 40),   -- ช่างยนต์
  ('2568', 2, 1, 30),   -- ช่างไฟฟ้ากำลัง
  ('2568', 3, 1, 30),   -- ช่างอิเล็กทรอนิกส์
  ('2568', 4, 1, 20),   -- ช่างก่อสร้าง
  ('2568', 5, 1, 35),   -- การบัญชี
  ('2568', 6, 1, 35);   -- คอมพิวเตอร์ธุรกิจ

-- ปวส.
INSERT INTO admission_plan (ap_years, div_id, cur_id, plan_num) VALUES
  ('2568', 7,  2, 25),  -- เทคนิคยานยนต์
  ('2568', 8,  2, 20),  -- ไฟฟ้ากำลัง
  ('2568', 9,  2, 20),  -- อิเล็กทรอนิกส์
  ('2568', 10, 2, 30),  -- การบัญชี
  ('2568', 11, 2, 30);  -- คอมพิวเตอร์ธุรกิจ

-- ── EXPENSE DETAIL ─────────────────────────────────────────
-- ปวช. (cur_id = 1)
INSERT INTO expense_detail (exp_name, exp_detail, cur_id, exp_cost, payment_type) VALUES
  ('ค่าลงทะเบียนเรียน',     'ค่าลงทะเบียนเรียนภาคเรียนที่ 1',     1, 1500.00, 'mandatory'),
  ('ค่าบำรุงการศึกษา',      'ค่าบำรุงการศึกษาประจำภาคเรียน',       1,  500.00, 'mandatory'),
  ('ค่าประกันอุบัติเหตุ',   'ประกันอุบัติเหตุนักเรียน',             1,  200.00, 'mandatory'),
  ('ชุดนักเรียนชาย',        'ชุดนักเรียน (เสื้อ+กางเกง) ระบุขนาด', 1,  450.00, 'optional'),
  ('ชุดนักเรียนหญิง',       'ชุดนักเรียน (เสื้อ+กระโปรง) ระบุขนาด',1,  450.00, 'optional'),
  ('ชุดพละศึกษา',           'ชุดพละศึกษา ระบุขนาด',                 1,  250.00, 'optional'),
  ('ค่าอุปกรณ์การเรียน',    'ค่าอุปกรณ์เพิ่มเติมตามความต้องการ',   1,    0.00, 'custom');

-- ปวส. (cur_id = 2)
INSERT INTO expense_detail (exp_name, exp_detail, cur_id, exp_cost, payment_type) VALUES
  ('ค่าลงทะเบียนเรียน',     'ค่าลงทะเบียนเรียนภาคเรียนที่ 1',     2, 1800.00, 'mandatory'),
  ('ค่าบำรุงการศึกษา',      'ค่าบำรุงการศึกษาประจำภาคเรียน',       2,  600.00, 'mandatory'),
  ('ค่าประกันอุบัติเหตุ',   'ประกันอุบัติเหตุนักศึกษา',             2,  200.00, 'mandatory'),
  ('ชุดนักศึกษาชาย',        'ชุดนักศึกษา (เสื้อ+กางเกง) ระบุขนาด',2,  550.00, 'optional'),
  ('ชุดนักศึกษาหญิง',       'ชุดนักศึกษา (เสื้อ+กระโปรง) ระบุขนาด',2, 550.00, 'optional'),
  ('ชุดพละศึกษา',           'ชุดพละศึกษา ระบุขนาด',                 2,  300.00, 'optional'),
  ('ค่าอุปกรณ์การเรียน',    'ค่าอุปกรณ์เพิ่มเติมตามความต้องการ',   2,    0.00, 'custom');

-- ── APPLICANTS (ตัวอย่างผู้สมัคร) ────────────────────────
-- สถานะ pending_payment (รอชำระเงิน)
INSERT INTO applicants (
  id_card_number, prefix, full_name, address, phone, email,
  prev_school, prev_level, prev_year, gpa,
  cur_id, div_id, ap_id, status, id_type
) VALUES
(
  '1429900000001', 'นาย', 'ทดสอบ รอชำระเงิน',
  '1 ถ.เลย-เชียงคาน ต.กุดป่อง อ.เมือง จ.เลย 42000',
  '0812345001', 'test001@mail.com',
  'โรงเรียนเลยพิทยาคม', 'm3', '2567', '3.00',
  1, 1, 1, 'pending_payment', 'thai_id'
),
(
  '1429900000002', 'นางสาว', 'ทดสอบ รอชำระเงิน 2',
  '2 ถ.เลย-เชียงคาน ต.กุดป่อง อ.เมือง จ.เลย 42000',
  '0812345002', 'test002@mail.com',
  'โรงเรียนเลยพิทยาคม', 'm3', '2567', '2.80',
  1, 5, 5, 'pending_payment', 'thai_id'
),
-- สถานะ paid (ชำระเงินแล้ว รอมอบตัว)
(
  '1429900000003', 'นาย', 'ทดสอบ ชำระเงินแล้ว',
  '3 ถ.เลย-เชียงคาน ต.กุดป่อง อ.เมือง จ.เลย 42000',
  '0812345003', 'test003@mail.com',
  'โรงเรียนนาอ้อวิทยา', 'm3', '2567', '3.20',
  1, 2, 2, 'paid', 'thai_id'
),
(
  '1429900000004', 'นางสาว', 'ทดสอบ ชำระเงินแล้ว 2',
  '4 ถ.เลย-เชียงคาน ต.กุดป่อง อ.เมือง จ.เลย 42000',
  '0812345004', 'test004@mail.com',
  'โรงเรียนศรีสองรักษ์วิทยา', 'm3', '2567', '3.50',
  2, 10, 10, 'paid', 'thai_id'
),
-- สถานะ enrolled (มอบตัวแล้ว)
(
  '1429900000005', 'นาย', 'ทดสอบ มอบตัวแล้ว',
  '5 ถ.เลย-เชียงคาน ต.กุดป่อง อ.เมือง จ.เลย 42000',
  '0812345005', 'test005@mail.com',
  'โรงเรียนเชียงคานวิทยาคม', 'm3', '2566', '3.10',
  1, 3, 3, 'enrolled', 'thai_id'
),
(
  '1429900000006', 'นางสาว', 'ทดสอบ มอบตัวแล้ว 2',
  '6 ถ.เลย-เชียงคาน ต.กุดป่อง อ.เมือง จ.เลย 42000',
  '0812345006', 'test006@mail.com',
  'โรงเรียนเลยพิทยาคม', 'm6', '2567', '2.90',
  2, 11, 11, 'enrolled', 'thai_id'
);

-- ── PAYMENTS (สำหรับผู้ที่ชำระเงินแล้ว) ──────────────────
INSERT INTO payments (app_id, total_amount, required_amount, optional_amount, paid_at, due_date, verified_at, verified_by)
SELECT app_id, 2200.00, 2200.00, 0.00,
       now() - interval '2 days',
       now() + interval '1 day',
       now() - interval '1 day',
       'staff1'
FROM applicants WHERE id_card_number = '1429900000003';

INSERT INTO payments (app_id, total_amount, required_amount, optional_amount, paid_at, due_date, verified_at, verified_by)
SELECT app_id, 2600.00, 2600.00, 0.00,
       now() - interval '3 days',
       now() + interval '1 day',
       now() - interval '2 days',
       'staff1'
FROM applicants WHERE id_card_number = '1429900000004';

INSERT INTO payments (app_id, total_amount, required_amount, optional_amount, paid_at, due_date, verified_at, verified_by)
SELECT app_id, 2200.00, 2200.00, 0.00,
       now() - interval '10 days',
       now() - interval '7 days',
       now() - interval '9 days',
       'admin'
FROM applicants WHERE id_card_number = '1429900000005';

INSERT INTO payments (app_id, total_amount, required_amount, optional_amount, paid_at, due_date, verified_at, verified_by)
SELECT app_id, 2600.00, 2600.00, 0.00,
       now() - interval '8 days',
       now() - interval '5 days',
       now() - interval '7 days',
       'admin'
FROM applicants WHERE id_card_number = '1429900000006';

-- รอชำระ (due_date ยังไม่หมด)
INSERT INTO payments (app_id, total_amount, required_amount, optional_amount, due_date)
SELECT app_id, 2200.00, 2200.00, 0.00, now() + interval '3 days'
FROM applicants WHERE id_card_number = '1429900000001';

INSERT INTO payments (app_id, total_amount, required_amount, optional_amount, due_date)
SELECT app_id, 2200.00, 2200.00, 0.00, now() + interval '3 days'
FROM applicants WHERE id_card_number = '1429900000002';

-- ── ENROLLMENTS (สำหรับผู้ที่มอบตัวแล้ว) ─────────────────
INSERT INTO enrollments (app_id, enrolled_at, verified_at, verified_by)
SELECT app_id, now() - interval '5 days', now() - interval '5 days', 'staff1'
FROM applicants WHERE id_card_number = '1429900000005';

INSERT INTO enrollments (app_id, enrolled_at, verified_at, verified_by)
SELECT app_id, now() - interval '4 days', now() - interval '4 days', 'staff2'
FROM applicants WHERE id_card_number = '1429900000006';

-- ============================================================
-- สรุปข้อมูล mock
-- ============================================================
-- Users:
--   superadmin / admin123  (role: admin)
--   admin      / admin123  (role: admin)
--   staff1     / staff123  (role: staff)
--   staff2     / staff123  (role: staff)
--
-- Curriculums: ปวช. (1), ปวส. (2)
-- Divisions: 6 สาขา ปวช. + 5 สาขา ปวส.
-- Admission Plans: 11 แผน ปีการศึกษา 2568
-- Expense Details: 7 รายการ ปวช. + 7 รายการ ปวส.
-- Applicants:
--   test001 — pending_payment (ปวช. ช่างยนต์)
--   test002 — pending_payment (ปวช. การบัญชี)
--   test003 — paid           (ปวช. ช่างไฟฟ้ากำลัง)
--   test004 — paid           (ปวส. การบัญชี)
--   test005 — enrolled       (ปวช. ช่างอิเล็กทรอนิกส์)
--   test006 — enrolled       (ปวส. คอมพิวเตอร์ธุรกิจ)
-- ============================================================
