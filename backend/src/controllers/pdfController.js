const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const pdfController = {
  // Generate application PDF
  generateApplicationPDF: async (req, res) => {
    try {
      const { studentId } = req.body;

      if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
      }

      // Get student data (you would fetch from database)
      const studentData = {
        firstName: 'John',
        lastName: 'Doe',
        idCardNumber: '1234567890123',
        birthDate: '2000-01-01',
        gender: 'male',
        address: '123 Main St, City',
        phone: '0801234567',
        email: 'john.doe@email.com',
        educationLevel: 'ปวส',
        department: 'คอมพิวเตอร์ธุรกิจ',
        course: 'เทคโนโลยีสารสนเทศ'
      };

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      const filename = `application-${studentId}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/documents', filename);

      // Pipe PDF to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Add content to PDF
      doc.fontSize(20).text('ใบสมัครนักศึกษา', { align: 'center' });
      doc.moveDown();

      doc.fontSize(14);
      doc.text(`ชื่อ-สกุล: ${studentData.firstName} ${studentData.lastName}`);
      doc.text(`เลขบัตรประชาชน: ${studentData.idCardNumber}`);
      doc.text(`วันเกิด: ${studentData.birthDate}`);
      doc.text(`เพศ: ${studentData.gender === 'male' ? 'ชาย' : 'หญิง'}`);
      doc.text(`ที่อยู่: ${studentData.address}`);
      doc.text(`โทรศัพท์: ${studentData.phone}`);
      doc.text(`อีเมล: ${studentData.email}`);
      doc.text(`ระดับการศึกษา: ${studentData.educationLevel}`);
      doc.text(`สาขาวิชา: ${studentData.department}`);
      doc.text(`หลักสูตร: ${studentData.course}`);

      doc.end();

      stream.on('finish', () => {
        res.json({
          message: 'Application PDF generated successfully',
          filename,
          url: `/uploads/documents/${filename}`
        });
      });

    } catch (error) {
      console.error('Generate application PDF error:', error);
      res.status(500).json({ error: 'Failed to generate application PDF' });
    }
  },

  // Generate payment PDF
  generatePaymentPDF: async (req, res) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      // Get order data (you would fetch from database)
      const orderData = {
        orderId: 'ORD-001',
        studentName: 'John Doe',
        idCardNumber: '1234567890123',
        items: [
          { name: 'เสื้อยืดนักศึกษา', quantity: 2, price: 150 },
          { name: 'ปากกา', quantity: 5, price: 10 },
          { name: 'สมุด', quantity: 3, price: 15 }
        ],
        totalAmount: 375,
        orderDate: new Date().toISOString().split('T')[0]
      };

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      const filename = `payment-${orderId}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/documents', filename);

      // Pipe PDF to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Add content to PDF
      doc.fontSize(20).text('ใบแจ้งชำระเงิน', { align: 'center' });
      doc.moveDown();

      doc.fontSize(14);
      doc.text(`เลขที่ใบสั่งซื้อ: ${orderData.orderId}`);
      doc.text(`ชื่อนักศึกษา: ${orderData.studentName}`);
      doc.text(`เลขบัตรประชาชน: ${orderData.idCardNumber}`);
      doc.text(`วันที่: ${orderData.orderDate}`);
      doc.moveDown();

      doc.fontSize(16).text('รายการสินค้า:');
      doc.fontSize(14);

      orderData.items.forEach((item, index) => {
        const total = item.quantity * item.price;
        doc.text(`${index + 1}. ${item.name} x${item.quantity} = ${total} บาท`);
      });

      doc.moveDown();
      doc.fontSize(16).text(`ยอดรวมทั้งสิ้น: ${orderData.totalAmount} บาท`);

      doc.end();

      stream.on('finish', () => {
        res.json({
          message: 'Payment PDF generated successfully',
          filename,
          url: `/uploads/documents/${filename}`
        });
      });

    } catch (error) {
      console.error('Generate payment PDF error:', error);
      res.status(500).json({ error: 'Failed to generate payment PDF' });
    }
  },

  // Download PDF
  downloadPDF: async (req, res) => {
    try {
      const { type, id } = req.params;

      if (!type || !id) {
        return res.status(400).json({ error: 'Type and ID are required' });
      }

      // Construct filename based on type
      let filename;
      if (type === 'application') {
        filename = `application-${id}.pdf`;
      } else if (type === 'payment') {
        filename = `payment-${id}.pdf`;
      } else {
        return res.status(400).json({ error: 'Invalid PDF type' });
      }

      const filePath = path.join(__dirname, '../../uploads/documents', filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'PDF not found' });
      }

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Send file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Download PDF error:', error);
      res.status(500).json({ error: 'Failed to download PDF' });
    }
  }
};

module.exports = pdfController;
