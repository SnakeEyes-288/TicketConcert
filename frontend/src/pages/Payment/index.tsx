import React, { useState, useEffect } from 'react';  
import { Button, Modal, Typography, Form, Input, Select, Card, notification, Upload, Checkbox } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { CreatePayment, CreateTicket, CreateConditionRefun, GetCondition } from '../../services/https';
import { useUser } from '../../components/UserContext';
import promptpay from 'promptpay-qr';
import * as qrcode from 'qrcode';
import { UploadFile } from 'antd';
import { TicketInterface } from '../../interfaces/ITicket';

const { Title } = Typography;
const { Option } = Select;

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedConcert = '', selectedSeats = [], selectedSeatType = '', ticketQuantity = 1, ticketPrice = 0, seatTypeID = 0 } = location.state || {};
  const { memberID } = useUser();
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('เลือกวิธีการชำระเงิน');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [conditionText, setConditionText] = useState(''); // เก็บข้อความเงื่อนไข
  const [isConditionAccepted, setIsConditionAccepted] = useState(false); // เก็บสถานะการยอมรับเงื่อนไข
  const [isConditionModalVisible, setIsConditionModalVisible] = useState(false); // สถานะการแสดง Modal เงื่อนไข

  const amount = calculateAmount(ticketPrice, ticketQuantity);
  //const conditionText = ''

  useEffect(() => {
    const fetchCondition = async () => {
      const res = await GetCondition(); // ดึงข้อความเงื่อนไขจาก API
      if (res) {
        setConditionText(res.description); // บันทึกข้อความเงื่อนไขที่ได้รับ
      }
    };

    fetchCondition();
  }, []);

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
      slipImage = await getBase64(file);
    } catch (error) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถแปลงไฟล์ให้เป็น Base64 ได้',
      });
      setLoading(false);
      return;
    }

    // ข้อมูลสำหรับการสร้าง ConditionRefun
    const conditionRefunData = {
      AcceptedTerms: isConditionAccepted, // สถานะการยอมรับเงื่อนไข
      Description: conditionText, // ข้อความเงื่อนไขที่ผู้ใช้เห็น
    };

    try {
      // ส่งข้อมูลไปสร้าง ConditionRefun
      const conditionRes = await CreateConditionRefun(conditionRefunData);
      const conditionRefunID = conditionRes?.data?.ID; // เก็บ ID ของ ConditionRefun ที่สร้าง

      const paymentData = {
        PaymentMethod: paymentMethod,
        PaymentDate: new Date().toISOString(),
        Status: 'Paid',
        Quantity: selectedSeats.length,
        Amount: amount,
        SlipImage: slipImage,
        ConditionRefunID: conditionRefunID, // เชื่อมโยงกับ ConditionRefun
      };

      const paymentRes = await CreatePayment({ payment: paymentData, tickets: [] });

      if (paymentRes && paymentRes.data && paymentRes.data.ID) {
        const paymentID = paymentRes.data.ID;
        const ticketDataArray: TicketInterface[] = selectedSeats.map((seat: string) => ({
          Price: ticketPrice,
          PurchaseDate: new Date().toISOString(),
          Seat: { SeatNumber: seat },
          SeatTypeID: seatTypeID,
          PaymentID: paymentID,
          MemberID: typeof memberID === 'number' ? memberID : Number(memberID),
        }));

        await Promise.all(ticketDataArray.map((ticketData: TicketInterface) => CreateTicket(ticketData)));

        notification.success({
          message: 'การชำระเงินสำเร็จ',
          description: 'การชำระเงินของคุณได้รับการประมวลผลเรียบร้อยแล้ว',
        });

        navigate('/concerts');
      } else {
        notification.error({
          message: 'เกิดข้อผิดพลาด',
          description: 'เกิดข้อผิดพลาดในการสร้างการชำระเงิน',
        });
      }
    } catch (error) {
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
            <Checkbox checked={isConditionAccepted} onChange={(e) => setIsConditionAccepted(e.target.checked)}>
              ฉันยอมรับเงื่อนไขการคืนเงิน
            </Checkbox>
            <Button type="link" onClick={() => setIsConditionModalVisible(true)}>
              อ่านเงื่อนไขการคืนเงิน
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              ชำระเงิน
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal title="PromptPay QR Code" visible={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
        <p>สแกน QR Code เพื่อชำระเงิน:</p>
        {qrCodeUrl && <img src={qrCodeUrl} alt="PromptPay QR Code" />}
        <Upload onChange={onChange} fileList={fileList} beforeUpload={beforeUpload}>
          <Button icon={<PlusOutlined />}>อัปโหลดสลิป</Button>
        </Upload>
        <Button type="primary" onClick={handleUploadSlip} loading={loading}>
          ยืนยันการชำระเงิน
        </Button>
      </Modal>

      <Modal title="เงื่อนไขการคืนเงิน" visible={isConditionModalVisible} onCancel={() => setIsConditionModalVisible(false)} footer={null}>
        <p>{conditionText}</p>
        <Button onClick={() => setIsConditionModalVisible(false)}>
          ปิด
        </Button>
      </Modal>
    </div>
  );
};

function calculateAmount(price: number, quantity: number) {
  return price * quantity;
}

export default Payment;
