import React, { useState } from 'react'; 
import { Button, Modal, Typography, Form, Input, Select, Card, notification, Upload, Checkbox, Row, Col } from 'antd';
import { useLocation } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { CreatePayment, CreateTicket, CreateConditionRefun, SendTicketEmail } from '../../services/https';
import { useUser } from '../../components/UserContext';
import promptpay from 'promptpay-qr';
import * as qrcode from 'qrcode';
import { UploadFile } from 'antd';
import { TicketInterface } from '../../interfaces/ITicket';
import './Payment.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Payment: React.FC = () => {
  const location = useLocation();
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

        const qrCodeDataUrl = await qrcode.toDataURL(promptpay("1459901028579", { amount }));
        setQrCodeUrl(qrCodeDataUrl);

        const emailSent = await SendTicketEmail({
          memberID: typeof memberID === 'number' ? memberID : Number(memberID),
          To: form.getFieldValue('contactEmail'),
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
    if (amount > 0 && paymentMethod === "PromptPay") {
      const payload = promptpay(id, { amount });
      const qrCodeDataUrl = await qrcode.toDataURL(payload);
      setQrCodeUrl(qrCodeDataUrl);
      setIsModalVisible(true);
    } else if (amount > 0 && paymentMethod === "BankTransfer") {
      setIsModalVisible(true);
    }
  };

  return (
    <div className="centered-container">
      <Card className="payment-card">
        <Title level={4}>การชำระเงินสำหรับคอนเสิร์ต: {selectedConcert}</Title>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>ที่นั่งที่เลือก:</Text> {selectedSeats.join(', ')}
          </Col>
          <Col span={12}>
            <Text strong>ประเภทที่นั่ง:</Text> {selectedSeatType}
          </Col>
          <Col span={12}>
            <Text strong>จำนวนบัตร:</Text> {ticketQuantity}
          </Col>
          <Col span={12}>
            <Text strong>ราคาต่อบัตร:</Text> {ticketPrice} บาท
          </Col>
          <Col span={12}>
            <Text strong>ยอดรวม:</Text> {amount} บาท
          </Col>
        </Row>

        <Form form={form} layout="vertical" onFinish={handlePayment} style={{ marginTop: '20px' }}>
          <Form.Item label="ชื่อผู้ติดต่อ" name="contactName" rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ติดต่อ' }]}>
            <Input placeholder="ชื่อผู้ติดต่อ" />
          </Form.Item>
          <Form.Item label="อีเมลผู้ติดต่อ" name="contactEmail" rules={[{ required: true, message: 'กรุณากรอกอีเมลผู้ติดต่อ' }]}>
            <Input type="email" placeholder="อีเมลผู้ติดต่อ" />
          </Form.Item>
          <Form.Item label="วิธีการชำระเงิน" name="paymentMethod" rules={[{ required: true, message: 'กรุณาเลือกวิธีการชำระเงิน' }]}>
            <Select placeholder="เลือกวิธีการชำระเงิน" onChange={(value) => setPaymentMethod(value)}>
              <Option value="PromptPay">PromptPay</Option>
              <Option value="โอนชำระผ่านธนาคาร">โอนชำระผ่านธนาคาร</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Checkbox checked={isConditionAccepted} onChange={(e) => setIsConditionAccepted(e.target.checked)}>
              ฉันยอมรับเงื่อนไขการคืนเงิน
            </Checkbox>
            <Button type="link" onClick={() => setIsConditionModalVisible(true)}>อ่านเงื่อนไข</Button>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              ดำเนินการชำระเงิน
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {paymentMethod === 'PromptPay' && (
          <div style={{ textAlign: 'center' }}>
            <Title level={4}>ชำระเงินด้วย PromptPay</Title>
            {qrCodeUrl && <img src={qrCodeUrl} alt="PromptPay QR Code" />}
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={onChange}
              beforeUpload={beforeUpload}
              accept=".jpg,.jpeg,.png"
            >
              {fileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>อัปโหลดสลิป</div>
                </div>
              )}
            </Upload>
            <Button type="primary" onClick={handleUploadSlip} loading={loading} block>
              ยืนยันการชำระเงิน
            </Button>
          </div>
        )}

        {paymentMethod === 'BankTransfer' && (
          <div style={{ textAlign: 'center' }}>
            <Title level={4}>ชำระเงินด้วยการโอนผ่านธนาคาร</Title>
            <Text> รายละเอียดบัญชีธนาคาร</Text><br />
            <Text> ชื่อบัญชี : นายวิชิตชัย เพ็งพารา</Text><br />
            <Text> หมายเลขบัญชี : 429-0-64278-0</Text><br />
            <Text> ธนาคาร : กรุงไทย</Text>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={onChange}
              beforeUpload={beforeUpload}
              accept=".jpg,.jpeg,.png"
            >
              {fileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>อัปโหลดสลิป</div>
                </div>
              )}
            </Upload>
            <Button type="primary" onClick={handleUploadSlip} loading={loading} block>
              ยืนยันการชำระเงิน
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        visible={isConditionModalVisible}
        onCancel={() => setIsConditionModalVisible(false)}
        footer={null}
      >
        <Title level={4}>เงื่อนไขการคืนเงิน</Title>
        <Text>{conditionText}</Text>
      </Modal>
    </div>
  );
};

const calculateAmount = (ticketPrice: number, ticketQuantity: number) => {
  return ticketPrice * ticketQuantity;
};

export default Payment;
