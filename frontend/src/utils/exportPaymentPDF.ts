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
}

export async function exportPaymentPDF(data: PaymentPDFData) {
  const fontBase64 = await loadFont()

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
  doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
  doc.addFileToVFS('THSarabunNew-Bold.ttf', fontBase64)
  doc.addFont('THSarabunNew-Bold.ttf', 'THSarabun', 'bold')
  doc.setFont('THSarabun')

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3)
  const dueDateStr = dueDate.toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const pageW = 210
  let y = 20

  // หัวเรื่อง
  doc.setFontSize(22)
  doc.setFont('THSarabun', 'bold')
  doc.text('ใบแจ้งชำระเงินค่าสมัครเรียน', pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(14)
  doc.setFont('THSarabun', 'normal')
  doc.text('วิทยาลัยเทคนิคเลย — ระบบรับสมัครนักเรียนนักศึกษาออนไลน์', pageW / 2, y, { align: 'center' })
  y += 10

  // เส้นคั่น
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
  const info = [
    ['ชื่อ - สกุล', `${data.prefix}${data.fullName}`],
    ['เลขประจำตัวประชาชน', data.idCard],
    ['เบอร์โทรศัพท์', data.phone],
    ['หลักสูตร', data.courseLabel],
    ['สาขาวิชา', data.branchName],
  ]
  info.forEach(([label, value]) => {
    doc.setFont('THSarabun', 'bold')
    doc.text(`${label} :`, 20, y)
    doc.setFont('THSarabun', 'normal')
    doc.text(value, 80, y)
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
  const bankInfo = [
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

  doc.save(`ใบชำระเงิน-${data.idCard}.pdf`)
}