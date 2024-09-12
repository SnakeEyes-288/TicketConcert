import React, { useState } from 'react';
import { Button, Modal, Typography, Input } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'qrcode.react';

const { Title } = Typography;

const Payment: React.FC = () => {
  const location = useLocation();
  const { selectedConcert, selectedSeats, selectedTicketType, ticketQuantity, ticketPrice } = location.state || {};
  
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const calculateAmount = () => {
    return (ticketPrice || 0) * (ticketQuantity || 1);
  };

  const handlePayment = () => {
    if (!contactName || !contactEmail) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    alert('การชำระเงินสำเร็จ');
    navigate('/');
  };

  const getQRCodeValue = () => {
    return `promptpay://qr-code-value-for-${calculateAmount()}`;
  };
  

  return (
    <div style={{ margin: '20px' }}>
      <Title level={4}>การชำระเงินสำหรับคอนเสิร์ต: {selectedConcert}</Title>

      <p><strong>ที่นั่งที่เลือก:</strong> {selectedSeats.join(', ')}</p>
      <p><strong>ประเภทบัตร:</strong> {selectedTicketType}</p>
      <p><strong>จำนวนบัตร:</strong> {ticketQuantity}</p>
      <p><strong>ราคาต่อบัตร:</strong> {ticketPrice} บาท</p>
      <p><strong>ยอดรวม:</strong> {calculateAmount()} บาท</p>

      <div style={{ marginTop: '20px' }}>
        <Input
          placeholder="ชื่อผู้ติดต่อ"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <Input
          placeholder="อีเมลผู้ติดต่อ"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
      </div>

      <Button type="primary" style={{ marginTop: '20px' }} onClick={handlePayment}>
        ชำระเงิน
      </Button>

      <Modal
        title="QR Code สำหรับชำระเงิน"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <QRCode value={getQRCodeValue()} size={256} />
      </Modal>
    </div>
  );
};

export default Payment;
