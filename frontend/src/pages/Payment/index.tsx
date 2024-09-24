import React, { useState } from 'react';       
import { Button, Modal, Typography, Form, Input, Select, Card, notification, Upload } from 'antd';
import { useLocation } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { CreatePayment, CreateTicket } from '../../services/https';
import { PaymentInterface } from '../../interfaces/IPayment';
import { TicketInterface } from '../../interfaces/ITicket';
import { useUser } from '../../components/UserContext';
import promptpay from 'promptpay-qr'; // นำเข้า promptpay
import * as qrcode from 'qrcode'; // นำเข้า qrcode
import { UploadFile } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const Payment: React.FC = () => {
  const location = useLocation();
  const { selectedConcert = '', selectedSeats = [], selectedTicketType = '', ticketQuantity = 1, ticketPrice = 0, seatTypeID = 0 } = location.state || {};
  const { memberID } = useUser();
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('เลือกวิธีการชำระเงิน');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const amount = calculateAmount(ticketPrice, ticketQuantity); // ส่งค่า ticketPrice และ ticketQuantity เข้าไป
  
  // ฟังก์ชันสำหรับการจัดการการเปลี่ยนแปลงของไฟล์อัปโหลด
  const onChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  // ฟังก์ชันสำหรับแปลงไฟล์เป็น Base64
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // ฟังก์ชันการอัปโหลดสลิป
  const handleUploadSlip = async () => {
    setLoading(true);
  
    if (!fileList || fileList.length === 0) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'กรุณาอัปโหลดสลิปการโอนเงิน',
      });
      setLoading(false);
      return;
    }
  
    const file = fileList[0]?.originFileObj;

    if (!(file instanceof Blob)) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไฟล์ที่อัปโหลดไม่ถูกต้อง',
      });
      setLoading(false);
      return;
    }
  
    let slipImage = '';

    try {
      slipImage = await getBase64(file); // แปลงไฟล์เป็น Base64
    } catch (error) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถแปลงไฟล์ให้เป็น Base64 ได้',
      });
      setLoading(false);
      return;
    }

    const paymentData: PaymentInterface = {
      PaymentMethod: paymentMethod,
      PaymentDate: new Date().toISOString(),
      Status: 'Pending',
      Quantity: selectedSeats.length,
      Amount: amount,
      SlipImage: slipImage, // เพิ่มสลิปที่ถูกแปลงเป็น Base64
    };

    console.log('Payment Data to Send:', paymentData); // Log the payment data being sent

    try {
      const paymentRes = await CreatePayment({ payment: paymentData, tickets: [] });
      console.log('Payment Response:', paymentRes); // Log the payment response
      if (paymentRes && paymentRes.data && paymentRes.data.ID) {
        const paymentID = paymentRes.data.ID;
        const ticketDataArray: TicketInterface[] = selectedSeats.map((seat: string) => ({
          Price: ticketPrice,
          PurchaseDate: new Date().toISOString(),
          Seat: { SeatNumber: seat },
          SeatTypeID: seatTypeID,
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
      console.error('Error during payment creation:', error); // Log the error to the console
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการสร้างการชำระเงินหรือตั๋ว',
      });
    } finally {
      setLoading(false);
      setIsModalVisible(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'สามารถอัปโหลดเฉพาะไฟล์ JPG/PNG เท่านั้น',
      });
      return Upload.LIST_IGNORE;
    }
    return true; // ให้ทำการอัปโหลดไฟล์
  };

  // ฟังก์ชันจัดการการชำระเงิน
  const handlePayment = async (values: any) => {
    const id = "1459901028579"; // ตัวอย่าง ID
    if (amount > 0) {
      const payload = promptpay(id, { amount });
      const qrCodeDataUrl = await qrcode.toDataURL(payload);
      setQrCodeUrl(qrCodeDataUrl);
      setIsModalVisible(true);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <Card>
        <Title level={4}>การชำระเงินสำหรับคอนเสิร์ต: {selectedConcert}</Title>
        <p><strong>ที่นั่งที่เลือก:</strong> {selectedSeats.join(', ')}</p>
        <p><strong>ประเภทบัตร:</strong> {selectedTicketType}</p>
        <p><strong>จำนวนบัตร:</strong> {ticketQuantity}</p>
        <p><strong>ราคาต่อบัตร:</strong> {ticketPrice} บาท</p>
        <p><strong>ยอดรวม:</strong> {amount} บาท</p>

        <Form form={form} layout="vertical" onFinish={handlePayment} style={{ marginTop: '20px' }}>
          <Form.Item label="ชื่อผู้ติดต่อ" name="contactName" rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ติดต่อ' }]}>
            <Input placeholder="ชื่อผู้ติดต่อ" />
          </Form.Item>
          <Form.Item label="อีเมลผู้ติดต่อ" name="contactEmail" rules={[{ required: true, message: 'กรุณากรอกอีเมลผู้ติดต่อ' }]}>
            <Input placeholder="อีเมลผู้ติดต่อ" />
          </Form.Item>
          <Form.Item label="วิธีการชำระเงิน" name="paymentMethod" rules={[{ required: true, message: 'กรุณาเลือกวิธีการชำระเงิน' }]}>
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
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            ยกเลิก
          </Button>,
          <Button key="submit" type="primary" onClick={handleUploadSlip} loading={loading}>
            อัปโหลดสลิป
          </Button>,
        ]}
      >
        {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%' }} />}
        <p>กรุณาสแกน QR Code และอัปโหลดสลิปการโอนเงิน</p>

        <Upload
          fileList={fileList}
          onChange={onChange}
          beforeUpload={beforeUpload}
          maxCount={1}
          multiple={false}
          listType="picture-card"
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>เลือกไฟล์สลิป (JPG/PNG)</div>
          </div>
        </Upload>

      </Modal>
    </div>
  );
};

// ฟังก์ชันคำนวณจำนวนเงิน
const calculateAmount = (ticketPrice: number, ticketQuantity: number): number => {
  return ticketPrice * ticketQuantity;
};

export default Payment;
