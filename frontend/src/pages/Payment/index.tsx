import React, { useState } from 'react'; 
import { Button, Modal, Typography, Form, Input, Select, Card, notification, Upload, Checkbox } from 'antd';
import { useLocation /*useNavigate*/ } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { CreatePayment, CreateTicket, CreateConditionRefun, SendTicketEmail } from '../../services/https';
import { useUser } from '../../components/UserContext';
import promptpay from 'promptpay-qr';
import * as qrcode from 'qrcode';
import { UploadFile } from 'antd';
import { TicketInterface } from '../../interfaces/ITicket';

const { Title } = Typography;
const { Option } = Select;

const Payment: React.FC = () => {
  const location = useLocation();
  //const navigate = useNavigate();
  const { selectedConcert = '', selectedSeats = [], selectedSeatType = '', ticketQuantity = 1, ticketPrice = 0, seatTypeID = 0 } = location.state || {};
  const { memberID } = useUser();
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('เลือกวิธีการชำระเงิน');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [conditionText] = useState('การคืนบัตรต้องคืนภายใน 7 วันหลังจากซื้อ');
  const [isConditionAccepted, setIsConditionAccepted] = useState(false);
  const [isConditionModalVisible, setIsConditionModalVisible] = useState(false);

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
      slipImage = await getBase64(file);
    } catch (error) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถแปลงไฟล์ให้เป็น Base64 ได้',
      });
      setLoading(false);
      return;
    }

    const conditionRefunData = {
      AcceptedTerms: isConditionAccepted,
      Description: conditionText,
    };

    try {
      const conditionRes = await CreateConditionRefun(conditionRefunData);
      const conditionRefunID = conditionRes?.data?.ID;

      const paymentData = {
        PaymentMethod: paymentMethod,
        PaymentDate: new Date().toISOString(),
        Status: 'Paid',
        Quantity: selectedSeats.length,
        Amount: amount,
        SlipImage: slipImage,
        ConditionRefunID: conditionRefunID,
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

        // สร้าง QR Code สำหรับการส่งอีเมล
        const qrCodeDataUrl = await qrcode.toDataURL(promptpay("1459901028579", { amount }));
        setQrCodeUrl(qrCodeDataUrl);
        
        const emailSent = await SendTicketEmail({
          memberID: typeof memberID === 'number' ? memberID : Number(memberID),
          To : form.getFieldValue('contactEmail'),
          concertName: "Test",
          qrCode: qrCodeDataUrl,
          seats: selectedSeats,
          amount: amount,
        }); 
        
        if (emailSent) {
          notification.success({
            message: 'การชำระเงินสำเร็จ',
            description: 'ส่งข้อมูลตั๋วไปยังอีเมลของคุณเรียบร้อยแล้ว',
          });
        } else {
          notification.error({
            message: 'เกิดข้อผิดพลาดในการส่งอีเมล',
            description: 'ไม่สามารถส่งข้อมูลตั๋วไปยังอีเมลได้',
          });
        }
        
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
              ดูเงื่อนไขการคืนเงิน
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={!isConditionAccepted || loading}>
              ดำเนินการชำระเงิน
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal visible={isModalVisible} footer={null} onCancel={() => setIsModalVisible(false)}>
        <Title level={4}>สแกน QR Code เพื่อชำระเงิน</Title>
        <img src={qrCodeUrl} alt="QR Code" />
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
              <div style={{ marginTop: 8 }}>อัปโหลดสลิปการชำระเงิน</div>
            </div>
          )}
        </Upload>
        <Button type="primary" onClick={handleUploadSlip} disabled={fileList.length === 0 || !isConditionAccepted || loading}>
          ยืนยันการชำระเงิน
        </Button>
      </Modal>

      <Modal
        visible={isConditionModalVisible}
        onCancel={() => setIsConditionModalVisible(false)}
        footer={<Button onClick={() => setIsConditionModalVisible(false)}>ปิด</Button>}
      >
        <Title level={4}>เงื่อนไขการคืนเงิน</Title>
        <p>{conditionText}</p>
      </Modal>
    </div>
  );
};

const calculateAmount = (price: number, quantity: number) => price * quantity;

export default Payment;
