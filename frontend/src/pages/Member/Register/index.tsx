import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateMember } from "../../../services/https";
import { MemberInterface } from "../../../interfaces/IMember";
import { Form, Input, DatePicker, Button, Typography, Alert, Spin } from 'antd';


const { Title } = Typography;

const Register: React.FC = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values: any) => {
        const memberData: MemberInterface = {
          username: values.username.trim(),
          password: values.password,
          email: values.email.trim(),
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          birthDay: values.birthday ? values.birthday.format('YYYY-MM-DD') : '',
        };
      
        setLoading(true);
        const res = await CreateMember(memberData);
        setLoading(false);
      
        // ตรวจสอบผลลัพธ์ของการลงทะเบียน
        if (res && res.message !== "Registration successful!") {
          setError(res.message || "Registration failed. Please try again.");
        } else {
          navigate("/login");
        }
      };
      

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
            <Title level={2}>Register</Title>
            {error && <Alert message={error} type="error" showIcon />}
            <Form onFinish={handleSubmit} layout="vertical">
                <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Email" name="email" rules={[{ type: 'email', required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item label="Birthday" name="birthday" rules={[{ required: true }]}>
                    <DatePicker format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        {loading ? <Spin /> : 'Register'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Register;
