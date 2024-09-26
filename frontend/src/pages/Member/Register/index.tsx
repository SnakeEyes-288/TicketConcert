import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateMember } from "../../../services/https";
import { MemberInterface } from "../../../interfaces/IMember";
import { Form, Input, DatePicker, Button, Typography, Alert, Spin } from 'antd';
import './register.css'; // ใช้ไฟล์ CSS ที่ปรับสีและขนาดแล้ว

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
            phone_number: values.phonenumber.trim(),
        };

        setLoading(true);
        const res = await CreateMember(memberData);
        setLoading(false);

        if (res && res.message !== "Registration successful!") {
            setError(res.message || "Registration failed. Please try again.");
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <Title level={2} className="register-title">Register</Title>
                {error && <Alert message={error} type="error" showIcon className="error-message" />}
                <Form onFinish={handleSubmit} layout="vertical">
                    <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                        <Input placeholder="Enter your username" />
                    </Form.Item>
                    <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
                        <Input placeholder="Enter your first name" />
                    </Form.Item>
                    <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                        <Input placeholder="Enter your last name" />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ type: 'email', required: true }]}>
                        <Input placeholder="Enter your email" />
                    </Form.Item>
                    <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}>
                        <Input.Password placeholder="Enter your password" />
                    </Form.Item>
                    <Form.Item label="Birthday" name="birthday" rules={[{ required: true }]}>
                        <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Phone Number" name="phonenumber" rules={[{ required: true }]}>
                        <Input placeholder="Enter your phone number" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            {loading ? <Spin /> : 'Register'}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Register;
