import React, { useState } from 'react';
import { List, Select, Radio, Button, Avatar, Typography, Modal, Input, Upload, message } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import QRCode from 'qrcode.react';

const { Title } = Typography;
const { Option } = Select;

type ConcertType = 'VIP' | 'Regular';
type PaymentMethodType = 'promptpay' | 'creditcard' | 'credit';

const Payment: React.FC = () => {
  const [selectedConcert, setSelectedConcert] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<ConcertType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const concerts: string[] = [
    'คอนเสิร์ต A',
    'คอนเสิร์ต B',
    'คอนเสิร์ต C',
    'คอนเสิร์ต D',
  ];

  const handleSelectConcert = (concert: string) => {
    setSelectedConcert(concert);
  };

  const handlePayment = () => {
    if (selectedConcert && selectedSeat && selectedTicketType && paymentMethod) {
      setIsModalVisible(true);
    } else {
      alert('โปรดตรวจสอบให้แน่ใจว่าคุณได้เลือกตัวเลือกทั้งหมดแล้ว');
    }
  };

  const handleOk = () => {
    console.log('การชำระเงินได้รับการยืนยัน:', {
      concert: selectedConcert,
      seat: selectedSeat,
      ticketType: selectedTicketType,
      paymentMethod: paymentMethod,
    });
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const calculateAmount = () => {
    let basePrice = 1000;
    let ticketTypePrice = selectedTicketType === 'VIP' ? 500 : 200;
    return basePrice + ticketTypePrice;
  };

  const getPromptPayQRCodeValue = () => {
    return '00020101021259370016A0000006770101110000000505802TH6304F40F';
  };

  const handleUploadChange = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} ไฟล์อัพโหลดเรียบร้อย`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} การอัพโหลดล้มเหลว`);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      width: '100vw',  // เพิ่ม width ให้เป็น 100vw เพื่อครอบคลุมทั้งความกว้างของหน้าจอ
      backgroundImage: 'url(/images/pngtree-3d-blue-lighting-stage-concert-arena-shiny-spotlight-vector-background-image_320463.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      margin: 0,  // ลบ margin ที่อาจเกิดขึ้น
      padding: 0,  // ลบ padding ที่อาจเกิดขึ้น
    }}>
      <div style={{ width: '50%', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '20px', borderRadius: '8px' }}>
        <List
          header={<div style={{ textAlign: 'center' }}>รายการคอนเสิร์ต</div>}
          bordered
          dataSource={concerts}
          renderItem={item => (
            <List.Item
              onClick={() => handleSelectConcert(item)}
              style={{
                backgroundColor: selectedConcert === item ? '#e6f7ff' : '#fff',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {item}
            </List.Item>
          )}
        />
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <Select 
            defaultValue="กรุณาระบุโซนที่นั่ง" 
            style={{ width: '45%', marginRight: '10px' }} 
            onChange={value => setSelectedSeat(value)}
          >
            <Option value="B1">B1</Option>
            <Option value="B2">B2</Option>
            <Option value="B3">B3</Option>
            <Option value="B4">B4</Option>
            <Option value="B5">B5</Option>
            <Option value="B6">B6</Option>
            <Option value="B7">B7</Option>
            <Option value="B8">B8</Option>
            <Option value="B9">B9</Option>
            <Option value="B10">B10</Option>
          </Select>

          <Select 
            defaultValue="กรุณาเลือกประเภทของบัตร" 
            style={{ width: '45%' }} 
            onChange={value => setSelectedTicketType(value as ConcertType)}
          >
            <Option value="VIP">VIP</Option>
            <Option value="Regular">Regular</Option>
          </Select>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Title level={5}>วิธีการชำระเงิน</Title>
          <Radio.Group onChange={e => setPaymentMethod(e.target.value as PaymentMethodType)}>
            <Radio value="promptpay">PromptPay QR Code</Radio>
            <Radio value="creditcard">บัตรเครดิต/WeCard</Radio>
            <Radio value="credit">โอนเงิน (รอการอัพโหลดสลิป)</Radio>
          </Radio.Group>
        </div>

        <Button type="primary" style={{ marginTop: '20px', width: '100%' }} onClick={handlePayment}>
          ยืนยันการชำระเงิน
        </Button>
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar size={48} icon={<UserOutlined style={{ color: 'white' }} />} />
        <span style={{ marginTop: '10px', fontSize: '16px', fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
          Wichitchai Pengpara
        </span>
        <Button 
          style={{ marginTop: '20px', width: '100%' }}
          onClick={() => alert('ออกจากระบบ')}
        >
          ออกจากระบบ
        </Button>
      </div>

      <Modal
        title="ยืนยันการชำระเงิน"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
      >
        <p>คอนเสิร์ต: {selectedConcert}</p>
        <p>ที่นั่ง: {selectedSeat}</p>
        <p>ประเภทบัตร: {selectedTicketType}</p>
        <p>จำนวนเงินที่ต้องชำระ: {calculateAmount()} บาท</p>

        {paymentMethod === 'promptpay' && (
          <div>
            <p>กรุณาสแกน QR Code ด้านล่างสำหรับการชำระเงิน PromptPay:</p>
            <QRCode value={getPromptPayQRCodeValue()} size={256} /> {/* ขนาด QR Code */}
          </div>
        )}

        {paymentMethod === 'creditcard' && (
          <div>
            <p>กรุณากรอกหมายเลขบัตรเครดิต/WeCard ของคุณ:</p>
            <Input placeholder="หมายเลขบัตรเครดิต" />
          </div>
        )}

        {paymentMethod === 'credit' && (
          <div>
            <p>กรุณาอัพโหลดสลิปการโอนเงิน:</p>
            <Upload 
              name="file"
              action="/upload.do" // URL สำหรับการอัพโหลด
              onChange={handleUploadChange}
            >
              <Button icon={<UploadOutlined />}>คลิกเพื่ออัพโหลด</Button>
            </Upload>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payment;
