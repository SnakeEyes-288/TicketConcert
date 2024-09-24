import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Row, Col, Card, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useUser } from '../../../components/UserContext';  // ดึงข้อมูลจาก UserContext

const { Title, Text } = Typography;

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken, setMemberID } = useUser();  // ใช้ setToken และ setMemberID จาก context
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    const loginData = { email, password };
  
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    };
  
    try {
      const res = await fetch('http://localhost:8000/login', requestOptions);
  
      if (res.ok) {
        const data = await res.json();
        console.log("Login response data:", data); // แสดงข้อมูลที่ตอบกลับ
  
        setToken(data.token); // ตั้งค่า token
        setMemberID(data.id); // ใช้ id เป็น MemberID
        console.log("Member ID:", data.id); // แสดงค่าที่เก็บไว้เป็น MemberID
  
        navigate("/concerts");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Login failed. Please check your email and password.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error("Error logging in:", err);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Col xs={24} sm={16} md={12} lg={8}>
        <Card bordered={false} style={{ padding: '20px' }}>
          <Title level={3} style={{ textAlign: 'center' }}>Login</Title>
          
          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />
          )}

          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                type="email" 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }} 
                placeholder="Enter your email" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }} 
                placeholder="Enter your password" 
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text>Don't have an account? <Link to="/register">Sign up here</Link>.</Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default SignIn;
