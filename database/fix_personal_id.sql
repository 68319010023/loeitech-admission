-- 1. ลบ trigger ตรวจสอบเลขบัตรประชาชนออก
DROP TRIGGER IF EXISTS validate_applicant_id_card ON public.applicants;

-- 2. ขยาย id_card_number ให้รองรับรหัสที่ยาวกว่า 13 หลัก
ALTER TABLE public.applicants
  ALTER COLUMN id_card_number TYPE varchar(20);

-- 3. เพิ่มคอลัมน์ id_type บอกประเภทเอกสารแสดงตน
ALTER TABLE public.applicants
  ADD COLUMN IF NOT EXISTS id_type varchar(20) NOT NULL DEFAULT 'thai_id';
-- ค่าที่รองรับ:
--   'thai_id'    → บัตรประจำตัวประชาชนไทย 13 หลัก
--   'alien_id'   → บัตรประจำตัวคนต่างด้าว (Alien ID Card)
--   'passport'   → หนังสือเดินทาง
--   'g_code'     → G-Code (รหัสประจำตัวบุคคลไม่มีสัญชาติไทย)
--   'other'      → เอกสารราชการอื่น ๆ

-- 4. เพิ่ม comment อธิบาย
COMMENT ON COLUMN public.applicants.id_card_number IS
  'หมายเลขประจำตัว ตามประเภทเอกสาร (id_type) เช่น เลขบัตรปชช. 13 หลัก / เลขต่างด้าว / passport / G-code';
COMMENT ON COLUMN public.applicants.id_type IS
  'ประเภทเอกสารแสดงตน: thai_id, alien_id, passport, g_code, other';