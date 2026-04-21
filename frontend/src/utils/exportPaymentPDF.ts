import jsPDF from 'jspdf'

async function loadFont(): Promise<string> {
  const res = await fetch('/fonts/THSarabunNew.ttf')
  const buffer = await res.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
}

export interface PaymentPDFData {
  prefix: string
  fullName: string
  idCard: string
  phone: string
  courseLabel: string
  branchName: string
  totalPrice: number
  dueDate?: string // optional — ถ้าไม่ส่งมาจะ generate +3 วันเอง
  expenses?: any[] // รายการค่าใช้จ่ายสำหรับสร้างใบรายการสั่งซื้อ
}

export async function exportPaymentPDF(data: PaymentPDFData) {
  const fontBase64 = await loadFont()

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
  doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
  doc.addFileToVFS('THSarabunNew-Bold.ttf', fontBase64)
  doc.addFont('THSarabunNew-Bold.ttf', 'THSarabun', 'bold')
  doc.setFont('THSarabun')

  // ใช้ dueDate ที่ส่งมา หรือ generate +3 วัน
  let dueDateStr = data.dueDate || ''
  if (!dueDateStr) {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3)
    dueDateStr = dueDate.toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const pageW = 210
  let y = 2

  // เพิ่มโลโก้
  try {
    const logoRes = await fetch('/src/assets/loeitech-logo.png')
    const logoBuffer = await logoRes.arrayBuffer()
    const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))
    doc.addImage(logoBase64, 'PNG', pageW / 2 - 20, y, 40, 40)
    y += 45
  } catch (error) {
    console.error('Failed to load logo:', error)
    // ถ้าโหลดโลโก้ไม่ได้ ให้ข้ามและใช้ตำแหน่งเดิม
  }

  // หัวเรื่อง
  doc.setFontSize(22)
  doc.setFont('THSarabun', 'bold')
  doc.text('ใบแจ้งชำระเงินค่าสมัครเข้าศึกษาต่อ', pageW / 2, y, { align: 'center' })
  y += 8

  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.8)
  doc.line(15, y, pageW - 15, y)
  y += 10

  // ข้อมูลผู้สมัคร
  doc.setFontSize(14)
  doc.setFont('THSarabun', 'bold')
  doc.text('ข้อมูลผู้สมัคร', 15, y)
  y += 8

  doc.setFontSize(13)
  const info: [string, string][] = [
    ['ชื่อ - สกุล', `${data.prefix || ''} ${data.fullName || ''}`.trim()],
    ['เลขประจำตัวประชาชน', data.idCard || '-'],
    ['เบอร์โทรศัพท์', data.phone || '-'],
    ['หลักสูตร', data.courseLabel || '-'],
    ['สาขาวิชา', data.branchName || '-'],
  ]
  info.forEach(([label, value]) => {
    doc.setFont('THSarabun', 'bold')
    doc.text(`${label} :`, 20, y)
    doc.setFont('THSarabun', 'normal')
    doc.text(String(value), 80, y)
    y += 7
  })

  y += 4
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(15, y, pageW - 15, y)
  y += 10

  // ข้อมูลบัญชีธนาคาร
  doc.setFontSize(14)
  doc.setFont('THSarabun', 'bold')
  doc.text('ข้อมูลการชำระเงิน', 15, y)
  y += 8

  doc.setFontSize(13)
  const bankInfo: [string, string][] = [
    ['ธนาคาร', 'กรุงไทย สาขาเลย'],
    ['เลขบัญชี', '403-0-87831-8'],
    ['ชื่อบัญชี', 'ร้านค้าสวัสดิการวิทยาลัยเทคนิคเลย'],
  ]
  bankInfo.forEach(([label, value]) => {
    doc.setFont('THSarabun', 'bold')
    doc.text(`${label} :`, 20, y)
    doc.setFont('THSarabun', 'normal')
    doc.text(value, 80, y)
    y += 7
  })

  // ยอดชำระ
  if (data.totalPrice > 0) {
    doc.setFont('THSarabun', 'bold')
    doc.text('ยอดที่ต้องชำระ :', 20, y)
    doc.setTextColor(5, 150, 105)
    doc.text(`${data.totalPrice.toLocaleString()} บาท`, 80, y)
    doc.setTextColor(0, 0, 0)
    y += 7
  }

  y += 5

  // กรอบ deadline
  doc.setFillColor(255, 247, 237)
  doc.setDrawColor(251, 146, 60)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, y, pageW - 30, 14, 3, 3, 'FD')
  doc.setFontSize(13)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(194, 65, 12)
  doc.text(`โปรดชำระเงินและอัพโหลดสลิปการโอนเงินก่อนวันที่  ${dueDateStr}`, pageW / 2, y + 9, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 22

  // กรอบคำเตือน
  doc.setFillColor(254, 242, 242)
  doc.setDrawColor(239, 68, 68)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, y, pageW - 30, 22, 3, 3, 'FD')
  doc.setFontSize(13)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(185, 28, 28)
  doc.text('⚠  คำเตือน', 20, y + 7)
  doc.setFont('THSarabun', 'normal')
  doc.setFontSize(12)
  doc.text('การสมัครเรียนผ่านระบบออนไลน์ หากไม่ดำเนินการชำระเงิน และยืนยันการมอบตัวผ่านระบบ', 20, y + 14)
  doc.text('ภายในกำหนด จะถูกตัดสิทธิ์อัตโนมัติ', 20, y + 20)
  doc.setTextColor(0, 0, 0)
  y += 30

  // footer
  doc.setFontSize(10)
  doc.setFont('THSarabun', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, pageW / 2, y + 10, { align: 'center' })

  // สร้างหน้าใหม่สำหรับใบรายการสั่งซื้อ
  doc.addPage()
  await generateOrderPage(doc, data, fontBase64)

  doc.save(`ใบชำระเงิน-${data.idCard || 'unknown'}.pdf`)
}

async function generateOrderPage(doc: jsPDF, data: PaymentPDFData, fontBase64: string) {
  // เพิ่มฟอนต์สำหรับหน้าใหม่
  doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
  doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
  doc.addFileToVFS('THSarabunNew-Bold.ttf', fontBase64)
  doc.addFont('THSarabunNew-Bold.ttf', 'THSarabun', 'bold')
  doc.setFont('THSarabun')

  const pageW = 210
  let y = 2

  // เพิ่มโลโก้
  try {
    const logoRes = await fetch('/src/assets/loeitech-logo.png')
    const logoBuffer = await logoRes.arrayBuffer()
    const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))
    doc.addImage(logoBase64, 'PNG', pageW / 2 - 20, y, 40, 40)
    y += 45
  } catch (error) {
    console.error('Failed to load logo:', error)
  }

  // หัวเรื่องใบรายการสั่งซื้อ
  doc.setFontSize(22)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(0, 0, 0) // ตั้งสีตัวหนังสือเป็นดำ
  doc.text('ใบรายการสั่งซื้อ', pageW / 2, y, { align: 'center' })
  y += 8

  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.8)
  doc.line(15, y, pageW - 15, y)
  y += 10

  // ข้อมูลผู้สมัคร
  doc.setFontSize(14)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(0, 0, 0) // ตั้งสีตัวหนังสือเป็นดำ
  doc.text('ข้อมูลผู้สมัคร', 15, y)
  y += 8

  doc.setFontSize(13)
  const info: [string, string][] = [
    ['ชื่อ - สกุล', `${data.prefix || ''} ${data.fullName || ''}`.trim()],
    ['เลขประจำตัวประชาชน', data.idCard || '-'],
    ['เบอร์โทรศัพท์', data.phone || '-'],
    ['หลักสูตร', data.courseLabel || '-'],
    ['สาขาวิชา', data.branchName || '-'],
  ]
  info.forEach(([label, value]) => {
    doc.setFont('THSarabun', 'bold')
    doc.text(`${label} :`, 20, y)
    doc.setFont('THSarabun', 'normal')
    doc.text(String(value), 80, y)
    y += 7
  })

  y += 4
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(15, y, pageW - 15, y)
  y += 10

  // รายการสั่งซื้อ
  if (data.expenses && data.expenses.length > 0) {
    doc.setFontSize(14)
    doc.setFont('THSarabun', 'bold')
    doc.setTextColor(0, 0, 0) // ตั้งสีตัวหนังสือเป็นดำ
    doc.text('รายการสั่งซื้อ', 15, y)
    y += 8

    // สร้างตารางรายการสั่งซื้อ
    const tableStartY = y
    const rowHeight = 8
    const colWidths = [10, 80, 30, 30, 40] // ลำดับ, รายการ, จำนวน, ราคา, รวม
    
    // หัวตาราง
    doc.setFillColor(240, 240, 240)
    doc.setDrawColor(180, 180, 180)
    doc.rect(15, y, pageW - 30, rowHeight, 'FD')
    
    doc.setFontSize(11)
    doc.setFont('THSarabun', 'bold')
    doc.text('ลำดับ', 18, y + 5)
    doc.text('รายการ', 30, y + 5)
    doc.text('จำนวน', 115, y + 5)
    doc.text('ราคา', 145, y + 5)
    doc.text('รวม', 170, y + 5)
    
    y += rowHeight
    
    // ข้อมูลในตาราง
    doc.setFont('THSarabun', 'normal')
    data.expenses.forEach((expense, index) => {
      const total = expense.unit_price * expense.quantity
      
      // สลับสีแถว
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250)
        doc.rect(15, y, pageW - 30, rowHeight, 'F')
      }
      
      doc.setDrawColor(220, 220, 220)
      doc.rect(15, y, pageW - 30, rowHeight)
      
      // จำกัดความยาวข้อความ
      const itemName = expense.exp_name && expense.exp_name.length > 25 ? expense.exp_name.substring(0, 25) + '...' : (expense.exp_name || `รายการที่ ${index + 1}`)
      const sizeInfo = expense.size ? ` (${expense.size})` : ''
      const displayName = itemName + sizeInfo
      
      doc.setFontSize(10)
      doc.text(String(index + 1), 20, y + 5)
      doc.text(displayName, 30, y + 5)
      doc.text(String(expense.quantity), 125, y + 5, { align: 'center' })
      doc.text(expense.unit_price.toLocaleString(), 155, y + 5, { align: 'right' })
      doc.text(total.toLocaleString(), 185, y + 5, { align: 'right' })
      
      y += rowHeight
    })
    
    y += 5
    
    // ยอดรวมทั้งหมด
    doc.setDrawColor(16, 185, 130)
    doc.setLineWidth(0.8)
    doc.line(15, y, pageW - 15, y)
    y += 5
    
    doc.setFontSize(14)
    doc.setFont('THSarabun', 'bold')
    doc.text('ยอดรวมทั้งหมด:', 130, y)
    doc.setTextColor(5, 150, 105)
    doc.text(`${data.totalPrice.toLocaleString()} บาท`, 185, y, { align: 'right' })
    doc.setTextColor(0, 0, 0)
    y += 15
  }

  // หมายเหตุ
  doc.setFontSize(12)
  doc.setFont('THSarabun', 'normal')
  doc.text('หมายเหตุ: ใบรายการสั่งซื้อนี้เป็นหลักฐานการสั่งซื้อสินค้า/บริการ', 15, y)
  y += 6
  doc.text('กรุณาตรวจสอบรายการก่อนชำระเงิน', 15, y)
  y += 10

  // footer
  doc.setFontSize(10)
  doc.setFont('THSarabun', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, pageW / 2, y + 10, { align: 'center' })
}