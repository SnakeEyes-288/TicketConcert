import React from 'react';
import { Button, Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';

const concerts = [
  { id: 1, name: 'Concert A', venue: 'Stadium A', date: '2024-09-15', seatTypes: ['VIP', 'Standard', 'Economy'] },
  { id: 2, name: 'Concert B', venue: 'Arena B', date: '2024-10-20', seatTypes: ['VIP', 'Standard'] },
  { id: 3, name: 'Concert C', venue: 'Hall C', date: '2024-11-10', seatTypes: ['Economy', 'Standard'] },
];

const ConcertSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectConcert = (concert: any) => {
    if (!concert) {
      console.error('ไม่มีข้อมูลคอนเสิร์ตที่จะส่ง');
      return;
    }
    console.log('Concert selected:', concert); // ตรวจสอบการเลือกคอนเสิร์ต
    navigate('/select-seats', { state: { selectedConcert: concert } });
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>เลือกคอนเสิร์ต</h2>
      <Row gutter={[16, 16]}>
        {concerts.map((concert) => (
          <Col span={8} key={concert.id}>
            <Card title={concert.name} bordered={false}>
              <p><strong>สถานที่:</strong> {concert.venue}</p>
              <p><strong>วันที่:</strong> {concert.date}</p>
              <p><strong>ประเภทบัตร:</strong> {concert.seatTypes.join(', ')}</p>
              <Button type="primary" onClick={() => handleSelectConcert(concert)}>
                เลือกคอนเสิร์ตนี้
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ConcertSelection;
