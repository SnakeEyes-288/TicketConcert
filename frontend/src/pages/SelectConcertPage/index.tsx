import React, { useState, useEffect } from 'react'; 
import { Button, Card, Row, Col, Spin, Alert, Typography, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { ConcertInterface } from '../../interfaces/IConcert';
import { GetConcert } from '../../services/https';
import { useUser } from '../../components/UserContext';
import '../SelectConcertPage/index.css';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ConcertSelection: React.FC = () => {
  const { username, imageUrl, memberID } = useUser(); // ดึงข้อมูลจาก UserContext
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handleSelectConcert = (concert: ConcertInterface) => {
    navigate('/select-seats', { state: { selectedConcert: concert, memberID } });
  };

  const handleViewPaymentHistory = () => {
    navigate('/TicketInformation', { state: { memberID } });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="concert-selection-container">
      {/* User Information */}
      <div className="profile-container">
        <Avatar 
          size={50} 
          src={imageUrl} 
          icon={!imageUrl && <UserOutlined />} 
        />
        <div className="profile-info">
          <Typography.Text className="profile-username">
            {username || "No Username"}
          </Typography.Text>
        </div>
      </div>

      <Title level={2} className="concert-title">
        เลือกคอนเสิร์ตที่คุณสนใจ
      </Title>

      <div className="payment-history-btn">
        <Button className="right-button" onClick={handleViewPaymentHistory}>
          ดูประวัติการชำระเงิน
        </Button>
      </div>

      {error && <Alert message={error} type="error" style={{ marginBottom: '20px' }} />}

      <Row gutter={[16, 16]} className="concert-list">
        {concerts.length === 0 ? (
          <Col span={24}>
            <Card>
              <Text type="secondary">ไม่มีข้อมูลคอนเสิร์ต</Text>
            </Card>
          </Col>
        ) : (
          concerts.map((concert) => (
            <Col xs={24} sm={12} md={8} lg={6} key={concert.ID}>
              <Card
                hoverable
                className="concert-card"
                cover={
                  <img
                    alt="concert"
                    src={`https://via.placeholder.com/400x200.png?text=${concert.name}`}
                    className="concert-image"
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
                  className="right-button"
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
