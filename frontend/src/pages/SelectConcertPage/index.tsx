import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Spin, Alert, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment'; // ใช้ moment.js ในการแปลงวันที่
import { ConcertInterface } from '../../interfaces/IConcert';
import { GetConcert } from '../../services/https'; // นำเข้าฟังก์ชัน GetConcert

const { Title, Text } = Typography;

const ConcertSelection: React.FC = () => {
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // ดึงข้อมูลคอนเสิร์ตจาก Backend
  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const concertData = await GetConcert();
        setConcerts(concertData);
      } catch (error) {
        console.error('Error fetching concerts:', error);
        setError('ไม่สามารถดึงข้อมูลคอนเสิร์ตได้');
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  // ฟังก์ชันเพื่อจัดการเมื่อมีการเลือกคอนเสิร์ต
  const handleSelectConcert = (concert: ConcertInterface) => {
    navigate('/select-seats', { state: { selectedConcert: concert } });
  };

  // การโหลดข้อมูล
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ margin: '20px', padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '40px', color: '#1890ff' }}>
        เลือกคอนเสิร์ตที่คุณสนใจ
      </Title>

      {error && <Alert message={error} type="error" style={{ marginBottom: '20px' }} />}

      <Row gutter={[16, 16]}>
        {concerts.length === 0 ? (
          <Col span={24}>
            <Card>
              <Text type="secondary">ไม่มีข้อมูลคอนเสิร์ต</Text>
            </Card>
          </Col>
        ) : (
          concerts.map((concert) => (
            <Col span={8} key={concert.ID}>
              <Card
                hoverable
                style={{ background: '#ffffff', borderRadius: '10px' }}
                cover={
                  <img
                    alt="concert"
                    src={`https://via.placeholder.com/400x200.png?text=${concert.name}`}
                    style={{ borderRadius: '10px 10px 0 0', height: '200px', objectFit: 'cover' }}
                  />
                }
              >
                <Title level={4}>{concert.name}</Title>
                <p>
                  <Text strong>สถานที่:</Text> {concert.Venue}
                </p>
                <p>
                  <Text strong>รอบการแสดง: </Text> {moment(concert.Date).format('DD/MM/YYYY')}
                </p>
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={() => handleSelectConcert(concert)}
                  style={{
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a',
                    fontWeight: 'bold',
                  }}
                >
                  เลือกคอนเสิร์ตนี้
                </Button>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default ConcertSelection;
