import React, { useState, useEffect } from 'react';
import { Button, Typography, Row, Col, Card } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title } = Typography;

const SeatSelection: React.FC = () => {
  const location = useLocation();
  const { selectedConcert } = location.state || {};  // รับข้อมูลคอนเสิร์ตจาก state ที่ส่งมา

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<string | null>(null);
  const navigate = useNavigate();

  // ข้อมูลที่นั่งตัวอย่าง (กรณีที่ไม่ได้มีข้อมูลจาก backend)
  const seatsData = [
    { id: 'A1', type: 'VIP', price: 3000 },
    { id: 'A2', type: 'VIP', price: 3000 },
    { id: 'B1', type: 'Standard', price: 2000 },
    { id: 'B2', type: 'Standard', price: 2000 },
    { id: 'C1', type: 'Economy', price: 1000 },
    { id: 'C2', type: 'Economy', price: 1000 },
  ].filter((seat) => selectedConcert?.seatTypes?.includes(seat.type));  // กรองตามประเภทบัตร

  useEffect(() => {
    // ตรวจสอบข้อมูลที่รับมา
    console.log('Selected Concert:', selectedConcert);
  }, [selectedConcert]);

  const handleSeatClick = (seatId: string, seatType: string) => {
    if (selectedTicketType && selectedTicketType !== seatType) {
      alert('คุณสามารถเลือกที่นั่งได้เฉพาะประเภทบัตรเดียวกันเท่านั้น');
      return;
    }

    setSelectedTicketType(seatType); // กำหนดประเภทบัตรตามที่นั่งที่เลือก
    setSelectedSeats((prevSelectedSeats) =>
      prevSelectedSeats.includes(seatId)
        ? prevSelectedSeats.filter((seat) => seat !== seatId)
        : [...prevSelectedSeats, seatId]
    );
  };

  const handleProceed = () => {
    const selectedSeatDetails = seatsData.filter((seat) =>
      selectedSeats.includes(seat.id)
    );

    if (selectedSeatDetails.length === 0) {
      alert('โปรดเลือกที่นั่งอย่างน้อยหนึ่งที่');
      return;
    }

    const totalAmount = selectedSeatDetails.reduce(
      (acc, seat) => acc + seat.price,
      0
    );

    navigate('/payment', {
      state: {
        selectedSeats,
        selectedConcert: selectedConcert?.name,
        selectedTicketType,
        ticketQuantity: selectedSeats.length,
        ticketPrice: totalAmount / selectedSeats.length, // ราคาตามประเภทบัตรที่เลือก
      },
    });
  };

  return (
    <div style={{ margin: '20px' }}>
      <Title level={4}>เลือกที่นั่งสำหรับคอนเสิร์ต: {selectedConcert?.name}</Title>

      {seatsData.length > 0 ? (
        <Row gutter={[16, 16]}>
          {seatsData.map((seat) => (
            <Col span={6} key={seat.id}>
              <Card
                style={{
                  backgroundColor: selectedSeats.includes(seat.id) ? '#ffecb3' : '#fff',
                  border: selectedSeats.includes(seat.id)
                    ? '2px solid #fadb14'
                    : '1px solid #d9d9d9',
                }}
                onClick={() => handleSeatClick(seat.id, seat.type)}
              >
                <p><strong>ที่นั่ง:</strong> {seat.id}</p>
                <p><strong>ประเภทบัตร:</strong> {seat.type}</p>
                <p><strong>ราคา:</strong> {seat.price} บาท</p>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p>ไม่มีที่นั่งให้เลือกสำหรับคอนเสิร์ตนี้</p>  )}{/* เพิ่มข้อความเมื่อไม่มีที่นั่ง */}
      

      <Button
        type="primary"
        style={{ marginTop: '20px' }}
        onClick={handleProceed}
        disabled={selectedSeats.length === 0}
      >
        ดำเนินการชำระเงิน
      </Button>
    </div>
  );
};

export default SeatSelection;
