import React, { useState } from 'react'; 
import { Button, Modal, Typography, Form, Input, Select, Card, notification, Upload } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { CreatePayment, CreateTicket, SendTicketEmail } from '../../services/https'; // Import SendTicketEmail
import { PaymentInterface } from '../../interfaces/IPayment';
import { TicketInterface } from '../../interfaces/ITicket';
import { useUser } from '../../components/UserContext';
import promptpay from 'promptpay-qr';
import * as qrcode from 'qrcode';
import { UploadFile } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedConcert = '', selectedSeats = [], selectedSeatType = '', ticketQuantity = 1, ticketPrice = 0, seatTypeID = 0 } = location.state || {};
  const { memberID } = useUser(); // ใช้ MemberID จาก context
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('เลือกวิธีการชำระเงิน');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const amount = calculateAmount(ticketPrice, ticketQuantity);
  
  const onChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

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
      Status: 'Paid',  // อัปเดตสถานะเป็น 'Paid' ถ้ามีการอัปโหลดสลิป
      Quantity: selectedSeats.length,
      Amount: amount,
      SlipImage: slipImage,
    };
  
    try {
      const paymentRes = await CreatePayment({ payment: paymentData, tickets: [] });
  
      if (paymentRes && paymentRes.data && paymentRes.data.ID) {
        const paymentID = paymentRes.data.ID;
        const ticketDataArray: TicketInterface[] = selectedSeats.map((seat: string) => ({

          Price: ticketPrice,
          PurchaseDate: new Date().toISOString(),
          Seat: { SeatNumber: seat },
          SeatTypeID: seatTypeID,
          PaymentID: paymentID,
          MemberID: typeof memberID === 'number' ? memberID : Number(memberID), // แปลงเป็น number
        }));

        // สร้างตั๋ว
        await Promise.all(ticketDataArray.map(ticketData => CreateTicket(ticketData)));
  
        // สร้าง QR Code เพื่อใช้ส่งในอีเมล
        const payload = promptpay("1459901028579", { amount });
        const qrCodeDataUrl = await qrcode.toDataURL(payload);

        // เรียกฟังก์ชันส่งอีเมลพร้อมข้อมูล
        if (memberID !== null && memberID !== undefined) {
          await SendTicketEmail({
            memberID: Number(memberID), // แก้ไขให้แน่ใจว่าเป็น number
            email: form.getFieldValue('contactEmail'),
            concertName: selectedConcert,
            qrCode: qrCodeDataUrl,
            seats: selectedSeats,
            amount: amount,
          });
        } else {
          notification.error({
            message: 'เกิดข้อผิดพลาด',
            description: 'ไม่พบข้อมูลสมาชิก',
          });
        }
  
        notification.success({
          message: 'การชำระเงินสำเร็จ',
          description: 'การชำระเงินของคุณได้รับการประมวลผลเรียบร้อยแล้ว และตั๋วถูกส่งไปยังอีเมล',
        });

        // นำทางไปยังหน้า concerts หลังจากการอัปโหลดสำเร็จ
        navigate('/concerts');
      } else {
        notification.error({
          message: 'เกิดข้อผิดพลาด',
          description: 'เกิดข้อผิดพลาดในการสร้างการชำระเงิน',
        });
      }
    } catch (error) {
      console.error('Error during payment creation:', error);
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
    return true;
  };

  const handlePayment = async (values: any) => {
    const id = "1459901028579";
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
        <p><strong>ประเภทที่นั่ง:</strong> {selectedSeatType}</p>
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
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={onChange}
          beforeUpload={beforeUpload}
          maxCount={1}
        >
          {fileList.length < 1 && (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>อัปโหลด</div>
            </div>
          )}
        </Upload>
      </Modal>
    </div>
  );
};

const calculateAmount = (price: number, quantity: number) => price * quantity;

export default Payment;
