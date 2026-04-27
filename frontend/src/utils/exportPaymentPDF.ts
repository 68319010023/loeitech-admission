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
  dueDate?: string
  expenses?: any[]
}

export async function exportPaymentPDF(data: PaymentPDFData) {
  const fontBase64 = await loadFont()

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
  doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
  doc.addFileToVFS('THSarabunNew-Bold.ttf', fontBase64)
  doc.addFont('THSarabunNew-Bold.ttf', 'THSarabun', 'bold')

  let dueDateStr = data.dueDate || ''
  if (!dueDateStr) {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    dueDateStr = d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const W = 210
  const H = 297
  const ML = 15   // margin left
  const MR = 15   // margin right
  const CW = W - ML - MR  // content width = 180mm
  let y = 12

  // ─── helpers ───────────────────────────────────────────────
  const text = (s: string, x: number, cy: number, opts?: any) => doc.text(s, x, cy, opts)
  const bold  = () => doc.setFont('THSarabun', 'bold')
  const normal = () => doc.setFont('THSarabun', 'normal')
  const sz = (n: number) => doc.setFontSize(n)
  const black = () => doc.setTextColor(0, 0, 0)
  const white = () => doc.setTextColor(255, 255, 255)
  const setDraw = (r: number, g = r, b = r) => doc.setDrawColor(r, g, b)
  const setFill = (r: number, g = r, b = r) => doc.setFillColor(r, g, b)
  const lw = (n: number) => doc.setLineWidth(n)

  // ─── 1. HEADER ─────────────────────────────────────────────
  // Logo
  let logoLoaded = false
  try {
    const logoRes = await fetch('/src/assets/loeitech-logo.png')
    const buf = await logoRes.arrayBuffer()
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
    doc.addImage(b64, 'PNG', ML, y, 22, 22)
    logoLoaded = true
  } catch {}

  // ชื่อสถาบัน
  const hx = ML + (logoLoaded ? 26 : 0)
  sz(17); bold()
  text('วิทยาลัยเทคนิคเลย', hx, y + 7)
  sz(12); normal()
  text('สังกัดสำนักงานคณะกรรมการการอาชีวศึกษา', hx, y + 13)
  text('ถ.มลิวรรณ ต.กุดป่อง อ.เมือง จ.เลย 42000  โทร. 042-811-543', hx, y + 19)
  y += 26

  // เส้นคู่ (บน)
  setDraw(0); lw(1.5); doc.line(ML, y, W - MR, y)
  lw(0.4);  doc.line(ML, y + 2.5, W - MR, y + 2.5)
  y += 7

  // ชื่อเอกสาร
  sz(20); bold()
  text('ใบแจ้งชำระเงินค่าสมัครเข้าศึกษาต่อ', W / 2, y + 6, { align: 'center' })
  y += 10

  // เส้นคู่ (ล่าง)
  lw(0.4); doc.line(ML, y, W - MR, y)
  lw(1.5); doc.line(ML, y + 2.5, W - MR, y + 2.5)
  y += 8

  // ─── 2. INFO BOXES (2 column) ───────────────────────────────
  const boxH = 50
  const colW = CW / 2 - 2  // ~88mm each
  const col2X = ML + colW + 4

  // กรอบซ้าย
  setDraw(0); lw(0.5)
  doc.rect(ML, y, colW, boxH)
  // header ซ้าย
  setFill(40); doc.rect(ML, y, colW, 8, 'F')
  white(); sz(13); bold(); text('ข้อมูลผู้สมัคร', ML + 3, y + 5.5); black()

  // กรอบขวา
  doc.rect(col2X, y, colW, boxH)
  // header ขวา
  setFill(40); doc.rect(col2X, y, colW, 8, 'F')
  white(); text('ข้อมูลการชำระเงิน', col2X + 3, y + 5.5); black()

  let yL = y + 11   // y สำหรับ column ซ้าย
  let yR = y + 11   // y สำหรับ column ขวา
  sz(12)

  // ข้อมูลซ้าย
  const leftRows: [string, string][] = [
    ['ชื่อ - สกุล', `${data.prefix || ''} ${data.fullName || ''}`.trim()],
    ['เลขประจำตัวประชาชน', data.idCard || '-'],
    ['เบอร์โทรศัพท์', data.phone || '-'],
    ['หลักสูตร', data.courseLabel || '-'],
    ['สาขาวิชา', data.branchName || '-'],
  ]
  leftRows.forEach(([lbl, val]) => {
    bold(); text(`${lbl} :`, ML + 3, yL)
    normal(); text(val, ML + 44, yL)
    yL += 7.2
  })

  // ข้อมูลขวา
  const rightRows: [string, string][] = [
    ['ธนาคาร', 'กรุงไทย สาขาเลย'],
    ['เลขบัญชี', '403-0-87831-8'],
    ['ชื่อบัญชี', 'ร้านค้าสวัสดิการ'],
    ['', 'วิทยาลัยเทคนิคเลย'],
    ['ยอดที่ต้องชำระ', `${data.totalPrice.toLocaleString()} บาท`],
  ]
  rightRows.forEach(([lbl, val]) => {
    if (lbl) { bold(); text(`${lbl} :`, col2X + 3, yR) }
    normal(); text(val, col2X + 32, yR)
    yR += 7.2
  })

  y += boxH + 5

  // ─── 3. EXPENSE TABLE ───────────────────────────────────────
  if (data.expenses && data.expenses.length > 0) {
    const rowH = 7.5
    // column widths (total = CW = 180)
    const cols = [10, 68, 20, 20, 30, 32]
    const colLabels = ['ลำดับ', 'รายการ', 'ขนาด', 'จำนวน', 'ราคา/หน่วย', 'รวม (บาท)']
    const colAligns: ('center'|'left'|'right')[] = ['center','left','center','center','right','right']

    // section header
    setFill(40); doc.rect(ML, y, CW, 8, 'F')
    white(); sz(13); bold(); text('รายการค่าใช้จ่าย', ML + 3, y + 5.5); black()
    y += 8

    // column header
    setFill(210); lw(0.5)
    doc.rect(ML, y, CW, rowH, 'FD')
    sz(11); bold()
    let cx = ML
    colLabels.forEach((lbl, i) => {
      const midX = cx + cols[i] / 2
      const rightX = cx + cols[i] - 2
      if (colAligns[i] === 'center') text(lbl, midX, y + 5, { align: 'center' })
      else if (colAligns[i] === 'right') text(lbl, rightX, y + 5, { align: 'right' })
      else text(lbl, cx + 2, y + 5)
      cx += cols[i]
    })
    y += rowH

    // data rows
    normal(); sz(11)
    data.expenses.forEach((exp, i) => {
      if (i % 2 === 0) { setFill(250); doc.rect(ML, y, CW, rowH, 'F') }
      setDraw(180); doc.rect(ML, y, CW, rowH)

      const total = (exp.unit_price || 0) * (exp.quantity || 0)
      const name = (exp.exp_name || `รายการ ${i + 1}`).substring(0, 32)
      const rowVals = [
        String(i + 1),
        name,
        exp.size || '-',
        String(exp.quantity || 0),
        (exp.unit_price || 0).toLocaleString(),
        total.toLocaleString(),
      ]
      let cx2 = ML
      rowVals.forEach((val, j) => {
        const midX = cx2 + cols[j] / 2
        const rightX = cx2 + cols[j] - 2
        if (colAligns[j] === 'center') text(val, midX, y + 5, { align: 'center' })
        else if (colAligns[j] === 'right') text(val, rightX, y + 5, { align: 'right' })
        else text(val, cx2 + 2, y + 5)
        cx2 += cols[j]
      })
      y += rowH
    })

    // total row
    setFill(40); setDraw(0); doc.rect(ML, y, CW, rowH, 'FD')
    white(); sz(12); bold()
    text('รวมทั้งสิ้น', ML + 3, y + 5)
    text(`${data.totalPrice.toLocaleString()} บาท`, W - MR - 2, y + 5, { align: 'right' })
    black()
    y += rowH + 5
  }

  // ─── 4. DEADLINE BOX ─────────────────────────────────────────
  setDraw(0); lw(0.6)
  doc.rect(ML, y, CW, 12)
  sz(13); bold()
  text(`กำหนดชำระเงิน  :  ภายในวันที่  ${dueDateStr}`, W / 2, y + 8, { align: 'center' })
  y += 17

  // ─── 5. WARNING BOX ──────────────────────────────────────────
  doc.rect(ML, y, CW, 16)
  sz(12); bold()
  text('คำเตือน : ', ML + 3, y + 6)
  normal()
  text('การสมัครเรียนผ่านระบบออนไลน์ หากไม่ดำเนินการชำระเงินและยืนยันการมอบตัวผ่านระบบ', ML + 24, y + 6)
  text('ภายในกำหนด จะถูกตัดสิทธิ์อัตโนมัติ', ML + 3, y + 12)
  y += 21

  // ─── 6. SIGNATURE AREA ───────────────────────────────────────
  const sigY = H - 42
  const sigW = 55
  // กล่องผู้สมัคร (ซ้าย)
  lw(0.4)
  doc.line(ML, sigY + 14, ML + sigW, sigY + 14)
  sz(11); normal(); text('ลงชื่อ................................................', ML, sigY + 14)
  text('(ผู้สมัคร)', ML + sigW / 2, sigY + 19, { align: 'center' })
  text('วันที่ ........./........./..........', ML, sigY + 25)
  // กล่องผู้รับ (กลาง-ขวา)
  const sig2X = W / 2 + 15
  doc.line(sig2X, sigY + 14, sig2X + sigW, sigY + 14)
  text('ลงชื่อ................................................', sig2X, sigY + 14)
  text('(เจ้าหน้าที่รับเรื่อง)', sig2X + sigW / 2, sigY + 19, { align: 'center' })
  text('วันที่ ........./........./..........', sig2X, sigY + 25)

  // ─── 7. FOOTER ───────────────────────────────────────────────
  lw(0.3); setDraw(150)
  doc.line(ML, H - 10, W - MR, H - 10)
  sz(9); normal(); doc.setTextColor(100)
  text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, W / 2, H - 6, { align: 'center' })

  doc.save(`ใบชำระเงิน-${data.idCard || 'unknown'}.pdf`)
}
