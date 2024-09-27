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
  const { email } = location.state || {}; // รับค่า email ที่ส่งมาจากหน้า Login
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('เลือกวิธีการชำระเงิน');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const conditionText = (
    <>
      <h2>เงื่อนไขการซื้อบัตรคอนเสิร์ต</h2>
      <p>กรุณาอ่านและยอมรับเงื่อนไขต่อไปนี้ก่อนดำเนินการซื้อบัตร:</p>
      <p>
        <strong>จำนวนบัตร:</strong> ข้าพเจ้าตกลงว่าจะซื้อบัตรไม่เกินจำนวนที่กำหนดต่อการซื้อในหนึ่งครั้ง (เช่น 4 ใบต่อคน) และเข้าใจว่าไม่สามารถซื้อบัตรเพิ่มเติมได้หากเกินจำนวนที่กำหนด
        <br />
        <strong>การคืนเงินและการยกเลิก:</strong> ข้าพเจ้าเข้าใจว่าการซื้อบัตรนี้ไม่สามารถขอคืนเงินหรือแลกเปลี่ยนได้ ยกเว้นในกรณีที่ผู้จัดงานมีการยกเลิกหรือเลื่อนงานเท่านั้น ซึ่งจะมีเงื่อนไขในการคืนเงินตามที่ผู้จัดกำหนด
        <br />
        <strong>การเลือกที่นั่ง:</strong> ข้าพเจ้าเข้าใจว่าการเลือกที่นั่งจะเป็นไปตามระบบที่กำหนด และหากที่นั่งที่เลือกไม่มีให้บริการ ระบบจะทำการเลือกที่นั่งอื่นในระดับราคาเดียวกันให้โดยอัตโนมัติ
        <br />
        <strong>การชำระเงิน:</strong> ข้าพเจ้าตกลงที่จะชำระเงินตามช่องทางที่กำหนด และหากการชำระเงินไม่สำเร็จภายในเวลาที่กำหนด ระบบจะทำการยกเลิกการสั่งซื้อโดยอัตโนมัติ
        <br />
        <strong>การยืนยันตัวตน:</strong> ข้าพเจ้ายอมรับว่าข้อมูลที่ใช้ในการซื้อบัตรเป็นข้อมูลที่ถูกต้องและสามารถตรวจสอบได้ หากมีการตรวจพบว่าข้อมูลไม่ถูกต้อง ทางผู้จัดงานมีสิทธิ์ในการยกเลิกบัตรหรือปฏิเสธการเข้าใช้บริการ
        <br />
        <strong>การใช้บัตร:</strong> ข้าพเจ้าตกลงที่จะใช้บัตรคอนเสิร์ตตามวันที่ เวลา และสถานที่ที่กำหนดเท่านั้น และจะไม่ใช้บัตรเพื่อการซื้อขายต่อในลักษณะที่ผิดกฎหมาย
        <br />
        <strong>การเข้าชมงาน:</strong> ข้าพเจ้าเข้าใจว่าการเข้าชมงานคอนเสิร์ตจะต้องปฏิบัติตามกฎระเบียบของสถานที่จัดงาน และยอมรับความเสี่ยงใดๆ ที่อาจเกิดขึ้นในระหว่างการเข้าร่วมงาน
      </p>
    </>
  );
    
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

    const getConditionText = () => {
      return `เงื่อนไขการซื้อบัตรคอนเสิร์ตกรุณาอ่านและยอมรับเงื่อนไขต่อไปนี้ก่อนดำเนินการซื้อบัตร:
    จำนวนบัตร: ข้าพเจ้าตกลงว่าจะซื้อบัตรไม่เกินจำนวนที่กำหนดต่อการซื้อในหนึ่งครั้ง (เช่น 4 ใบต่อคน) และเข้าใจว่าไม่สามารถซื้อบัตรเพิ่มเติมได้หากเกินจำนวนที่กำหนด
    การคืนเงินและการยกเลิก: ข้าพเจ้าเข้าใจว่าการซื้อบัตรนี้ไม่สามารถขอคืนเงินหรือแลกเปลี่ยนได้ ยกเว้นในกรณีที่ผู้จัดงานมีการยกเลิกหรือเลื่อนงานเท่านั้น ซึ่งจะมีเงื่อนไขในการคืนเงินตามที่ผู้จัดกำหนด
    การเลือกที่นั่ง: ข้าพเจ้าเข้าใจว่าการเลือกที่นั่งจะเป็นไปตามระบบที่กำหนด และหากที่นั่งที่เลือกไม่มีให้บริการ ระบบจะทำการเลือกที่นั่งอื่นในระดับราคาเดียวกันให้โดยอัตโนมัติ
    การชำระเงิน: ข้าพเจ้าตกลงที่จะชำระเงินตามช่องทางที่กำหนด และหากการชำระเงินไม่สำเร็จภายในเวลาที่กำหนด ระบบจะทำการยกเลิกการสั่งซื้อโดยอัตโนมัติ
    การยืนยันตัวตน: ข้าพเจ้ายอมรับว่าข้อมูลที่ใช้ในการซื้อบัตรเป็นข้อมูลที่ถูกต้องและสามารถตรวจสอบได้ หากมีการตรวจพบว่าข้อมูลไม่ถูกต้อง ทางผู้จัดงานมีสิทธิ์ในการยกเลิกบัตรหรือปฏิเสธการเข้าใช้บริการ
    การใช้บัตร: ข้าพเจ้าตกลงที่จะใช้บัตรคอนเสิร์ตตามวันที่ เวลา และสถานที่ที่กำหนดเท่านั้น และจะไม่ใช้บัตรเพื่อการซื้อขายต่อในลักษณะที่ผิดกฎหมาย
    การเข้าชมงาน: ข้าพเจ้าเข้าใจว่าการเข้าชมงานคอนเสิร์ตจะต้องปฏิบัติตามกฎระเบียบของสถานที่จัดงาน และยอมรับความเสี่ยงใดๆ ที่อาจเกิดขึ้นในระหว่างการเข้าร่วมงาน`;
    };
    
    // การเรียกใช้งานฟังก์ชัน
    const conditionText2 = getConditionText();
    

    const conditionRefunData = {
      AcceptedTerms: isConditionAccepted,
      Description: conditionText2,
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
          To: email,
          concertName: selectedConcert,
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
    } else if (amount > 0 && paymentMethod === "โอนชำระผ่านธนาคาร") {
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

        {paymentMethod === 'โอนชำระผ่านธนาคาร' && (
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
        <Text>{conditionText}</Text>
      </Modal>
    </div>
  );
};

const calculateAmount = (ticketPrice: number, ticketQuantity: number) => {
  return ticketPrice * ticketQuantity;
};

export default Payment;
