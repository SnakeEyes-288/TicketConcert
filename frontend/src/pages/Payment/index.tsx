import React, { useState } from 'react';
import { Button, Modal, Typography, Form, Input, Select, Card, notification, Upload } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import * as qrcode from 'qrcode';
import { UploadOutlined } from '@ant-design/icons';
import { CreatePayment, CreateTicket } from '../../services/https';
import { PaymentInterface } from '../../interfaces/IPayment';
import { TicketInterface } from '../../interfaces/ITicket';
import { useUser } from '../../components/UserContext';
import promptpay from 'promptpay-qr';
import { UploadFile } from 'antd';
import { RcFile } from 'antd/lib/upload';

const { Title } = Typography;
const { Option } = Select;

// สร้าง RcFile จาก File
const toRcFile = (file: File): RcFile => {
  const rcFile: RcFile = {
    ...file, // คัดลอกคุณสมบัติของ File ทั้งหมด
    uid: `${Date.now()}`, // เพิ่ม uid ที่ไม่ซ้ำกัน
    lastModifiedDate: file.lastModified ? new Date(file.lastModified) : new Date(), // lastModifiedDate จาก File
  };
  return rcFile;
};

const Payment: React.FC = () => {
  const location = useLocation();
  const {
    selectedConcert = '',
    selectedSeats = [],
    selectedTicketType = '',
    ticketQuantity = 1,
    ticketPrice = 0,
    seatTypeID = 0,
  } = location.state || {};

  const { memberID } = useUser();
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('เลือกวิธีการชำระเงิน');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const navigate = useNavigate();

  const calculateAmount = () => {
    const quantity = isNaN(ticketQuantity) ? 1 : ticketQuantity;
    const price = isNaN(ticketPrice) ? 0 : ticketPrice;
    return price * quantity;
  };

  const handlePayment = async () => {
    setLoading(true);
    if (!memberID) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่พบข้อมูลสมาชิก โปรดเข้าสู่ระบบใหม่อีกครั้ง',
      });
      setLoading(false);
      return;
    }

    const qrCode = await getQRCodeValue();
    setQrCodeUrl(qrCode);
    setIsModalVisible(true);
    setLoading(false);
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      
      if (!isJpgOrPng) {
        notification.error({
          message: 'เกิดข้อผิดพลาด',
          description: 'สามารถอัปโหลดเฉพาะไฟล์ JPG/PNG เท่านั้น',
        });
        return Upload.LIST_IGNORE; // ป้องกันไม่ให้ไฟล์ที่ไม่ใช่รูปภาพถูกอัปโหลด
      }
  
      // สร้าง RcFile จาก File
      const rcFile = toRcFile(file);
  
      const newFile: UploadFile<any> = {
        uid: rcFile.uid,
        name: rcFile.name,
        status: 'done',
        url: '', // หรือกำหนดเป็น URL ของไฟล์
        originFileObj: rcFile, // เก็บ RcFile ไว้ใน originFileObj
      };
  
      setFileList([newFile]); // เก็บไฟล์ที่อัปโหลดเข้ามา
      return false; // หยุดการอัปโหลดอัตโนมัติ
    },
    fileList, // แสดงไฟล์ที่ถูกเลือก
    onRemove: () => setFileList([]), // รีเซ็ตเมื่อไฟล์ถูกลบ
  };
  
  const handleUploadSlip = async () => {
    setLoading(true);
  
    if (!fileList.length) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'กรุณาอัปโหลดสลิปการโอนเงิน',
      });
      setLoading(false);
      return;
    }
  
    const file = fileList[0].originFileObj as File; // ใช้ File แท้จาก originFileObj
  
    // ตรวจสอบว่าไฟล์ถูกต้องหรือไม่
    if (!file) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเข้าถึงไฟล์ที่อัปโหลดได้ กรุณาลองใหม่อีกครั้ง',
      });
      setLoading(false);
      return;
    }
  
    let slipImage = '';
  
    try {
      // แปลงไฟล์ให้เป็น Base64
      slipImage = await getBase64(file);
  
      // ตรวจสอบผลลัพธ์ Base64
      console.log("Base64 result:", slipImage);
    } catch (error) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถแปลงไฟล์ให้เป็น Base64 ได้',
      });
      console.error('Base64 conversion error:', error);
      setLoading(false);
      return;
    }
  
    const paymentData: PaymentInterface = {
      PaymentMethod: paymentMethod,
      PaymentDate: new Date().toISOString(),
      Status: 'Pending',
      Quantity: selectedSeats.length,
      Amount: calculateAmount(),
      SlipImage: slipImage, // ส่งค่า Base64 ไปยัง SlipImage
    };

    try {
      console.log('Payment Data:', paymentData);
      const paymentRes = await CreatePayment({ payment: paymentData, tickets: [] });
      console.log('Payment Response:', paymentRes);
      if (paymentRes && paymentRes.data && paymentRes.data.ID) {
        const paymentID = paymentRes.data.ID;
        const ticketDataArray: TicketInterface[] = selectedSeats.map((seat: string) => ({
          Price: ticketPrice,
          PurchaseDate: new Date().toISOString(),
          Seat: { SeatNumber: seat },
          SeatTypeID: seatTypeID,
          //ConcertID: concertID,
          PaymentID: paymentID,
          MemberID: memberID,
        }));

        await Promise.all(ticketDataArray.map(ticketData => CreateTicket(ticketData)));

        notification.success({
          message: 'การชำระเงินสำเร็จ',
          description: 'การชำระเงินของคุณได้รับการประมวลผลเรียบร้อยแล้ว',
        });
      } else {
        notification.error({
          message: 'เกิดข้อผิดพลาด',
          description: 'เกิดข้อผิดพลาดในการสร้างการชำระเงิน',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการสร้างการชำระเงินหรือตั๋ว',
      });
    } finally {
      setLoading(false);
      setIsModalVisible(false);
    }
  };

  const handleOk = () => {
    setIsModalVisible(false);
    navigate('/concerts');
  };

  const getQRCodeValue = async () => {
    const amount = calculateAmount();
    const id = "1459901028579";
    
    if (amount > 0) {
      const payload = promptpay(id, { amount });
      const qrCodeDataUrl = await qrcode.toDataURL(payload);
      return qrCodeDataUrl;
    }
    return '';
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // อ่านไฟล์เป็น Base64
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  

  return (
    <div style={{ margin: '20px' }}>
      <Card>
        <Title level={4}>การชำระเงินสำหรับคอนเสิร์ต: {selectedConcert}</Title>

        <p><strong>ที่นั่งที่เลือก:</strong> {selectedSeats.join(', ')}</p>
        <p><strong>ประเภทบัตร:</strong> {selectedTicketType}</p>
        <p><strong>จำนวนบัตร:</strong> {ticketQuantity}</p>
        <p><strong>ราคาต่อบัตร:</strong> {ticketPrice} บาท</p>
        <p><strong>ยอดรวม:</strong> {calculateAmount()} บาท</p>

        <Form
          form={form}
          layout="vertical"
          onFinish={handlePayment}
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label="ชื่อผู้ติดต่อ"
            name="contactName"
            rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ติดต่อ' }]}
          >
            <Input placeholder="ชื่อผู้ติดต่อ" />
          </Form.Item>
          <Form.Item
            label="อีเมลผู้ติดต่อ"
            name="contactEmail"
            rules={[{ required: true, message: 'กรุณากรอกอีเมลผู้ติดต่อ' }]}
          >
            <Input placeholder="อีเมลผู้ติดต่อ" />
          </Form.Item>
          <Form.Item
            label="วิธีการชำระเงิน"
            name="paymentMethod"
            rules={[{ required: true, message: 'กรุณาเลือกวิธีการชำระเงิน' }]}
          >
            <Select onChange={setPaymentMethod}>
              <Option value="PromptPay">PromptPay</Option>
              <Option value="CreditCard">บัตรเครดิต</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              ชำระเงิน
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        open={isModalVisible}
        title="QR Code สำหรับการชำระเงิน"
        onOk={handleUploadSlip}
        onCancel={handleOk}
        footer={[
          <Button key="back" onClick={handleOk}>
            ยกเลิก
          </Button>,
          <Button key="submit" type="primary" onClick={handleUploadSlip} loading={loading}>
            อัปโหลดสลิป
          </Button>,
        ]}
      >
        {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%' }} />}
        <p>กรุณาสแกน QR Code และอัปโหลดสลิปการโอนเงิน</p>

        <Upload {...uploadProps} maxCount={1}>
          <Button icon={<UploadOutlined />}>เลือกไฟล์สลิป (JPG/PNG)</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default Payment;
