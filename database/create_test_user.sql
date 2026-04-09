-- สร้าง user ตัวอย่างสำหรับทดสอบ
-- รหัสผ่าน: admin123 (hash ด้วย bcrypt)

INSERT INTO users (username, password_hash, role) 
VALUES (
  'admin', 
  '$2b$10$2V5bi11jdGsHUObkX3kH3eq4EYp1ncxQRd7Dg/G9Il9FwSseBAiUi', 
  'admin'
)
ON CONFLICT (username) DO NOTHING;

-- ถ้าต้องการ hash รหัสผ่านใหม่:
-- ใช้ bcrypt ใน Node.js: 
-- const hash = await bcrypt.hash('admin123', 10);
-- ผลลัพธ์จะเป็น: $2b$10$... (60 ตัวอักษร)

-- สร้าง user staff ตัวอย่าง
-- รหัสผ่าน: staff123
INSERT INTO users (username, password_hash, role) 
VALUES (
  'staff', 
  '$2b$10$n94ktD.jdt0PPy2Y5Mniz.d3VkQGH4oo6tSAWdP29AfeCOuVqsqZa', 
  'staff'
)
ON CONFLICT (username) DO NOTHING;

-- สร้าง user ทดสอบ
-- รหัสผ่าน: password
INSERT INTO users (username, password_hash, role) 
VALUES (
  'test', 
  '$2b$10$1mScI7Gmt44dkpPMhc.XO.J3UgwbrxDD38fbjVoYns/Da1OObpuja', 
  'staff'
)
ON CONFLICT (username) DO NOTHING;
