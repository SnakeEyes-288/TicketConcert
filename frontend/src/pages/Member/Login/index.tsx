//index.tsx                                                                                                                                            import React, { useState } from 'react';  
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useUser } from '../../../components/UserContext'; // ดึงข้อมูลจาก UserContext
//import '../../Member/Login/index.css'; // นำเข้าไฟล์ index.css
import './concert-login.css';
import { useState } from 'react';
import React from 'react';
//import 'antd/dist/antd.css';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken, setMemberID } = useUser(); // ใช้ setToken และ setMemberID จาก context
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
        
        // พิมพ์ข้อมูลที่ได้รับกลับมาจาก API ลงใน console
        console.log('API Response:', data);
  
        // บันทึก Token และ MemberID ลงใน UserContext และ localStorage
        setToken(data.token);
        localStorage.setItem("token", data.token); // เก็บ Token ใน localStorage
        setMemberID(data.id);
  
        // บันทึกข้อมูลผู้ใช้ลงใน localStorage
        localStorage.setItem("user", JSON.stringify({
          username: data.username,
          email: data.email,
          phone: data.phoneNumber, // ใช้ให้ตรงตามข้อมูลที่กลับมา
        }));
  
        // เปลี่ยนเส้นทางไปยังหน้าอื่น
        navigate("/concerts", { state: { email } });
      } else {
        const errorData = await res.json();
        console.error('Login failed:', errorData);
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
    <div className="login-container">
      <div className="login-form">
        <h1 className="login-title">Login</h1>
        {error && <div className="error-message">{error}</div>}
        <Form name="login" onFinish={handleSubmit} layout="vertical">
          <div className="input-group">
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please input your email!' }]}>
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
          </div>
          <div className="input-group">
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input your password!' }]}>
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
          </div>
          <Button type="primary" htmlType="submit" className="login-button" loading={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>
        <div className="signup-link">
          Don't have an account? <Link to="/register">Sign up here</Link>.
        </div>
      </div>
    </div>
  );
}
export default SignIn;