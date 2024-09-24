import React from "react";
import { Form, Input, Button, message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
//import "./Profile";  // ตัวอย่างการใช้ case ที่ถูกต้อง // นำเข้าคอมโพเนนต์ Profile
import "./RefundRequest.css";
import Profile from "./Profile/Profile";

const RefundRequest: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Example of logged-in user data for validation
  const loggedInUser = {
    username: "JohnDoe",
    phone: "0123456789",
    email: "john.doe@example.com",
  };

  // Simulate sending data to a server
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitRefundRequest = async (values: any) => {
    try {
      const response = await fetch("/api/refund-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      // Check response status
      if (response.status === 200) {
        Modal.success({
          title: "สำเร็จ",
          content: "ส่งคำขอสำเร็จ",
        });
      } else {
        throw new Error("Request failed");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการส่งคำขอ");
    }
  };

  // Handler for form submission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (values: any) => {
    if (
      values.username !== loggedInUser.username ||
      values.phone !== loggedInUser.phone ||
      values.email !== loggedInUser.email
    ) {
      messageApi.error("ข้อมูลไม่ถูกต้อง");
      return;
    }
    submitRefundRequest(values);
  };

  const handleBack = () => {
    navigate("/"); // Navigate to the homepage
  };

  return (
    <>
      {contextHolder}
      <div className="refund-request-container">
        <Profile username={loggedInUser.username} email={loggedInUser.email} imageUrl={""} /> {/* เรียกใช้คอมโพเนนต์ Profile */}
        <Form form={form} onFinish={handleSubmit} className="request-card-form">
          <h1>ขอคืนบัตร</h1>
          <Form.Item
            label={<span style={{ color: "white", fontSize: "20px" }}>ชื่อผู้ใช้งาน</span>}
            name="username"
            labelCol={{ span: 24 }} // Full width for label
            wrapperCol={{ span: 24 }} // Full width for input
            rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้งาน" }]}
          >
            <Input placeholder="กรอกชื่อผู้ใช้งาน" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "white", fontSize: "20px" }}>เบอร์โทร</span>}
            name="phone"
            labelCol={{ span: 24 }} // Full width for label
            wrapperCol={{ span: 24 }} // Full width for input
            rules={[{ required: true, message: "กรุณากรอกเบอร์โทร" }]}
          >
            <Input placeholder="กรอกเบอร์โทร" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "white", fontSize: "20px" }}>อีเมล</span>}
            name="email"
            labelCol={{ span: 24 }} // Full width for label
            wrapperCol={{ span: 24 }} // Full width for input
            rules={[{ required: true, message: "กรุณากรอกอีเมล" }]}
          >
            <Input placeholder="กรอกอีเมล" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "white", fontSize: "20px" }}>เหตุผล</span>}
            name="reason"
            labelCol={{ span: 24 }} // Full width for label
            wrapperCol={{ span: 24 }} // Full width for input
            rules={[{ required: true, message: "กรุณากรอกเหตุผล" }]}
          >
            <Input.TextArea placeholder="เหตุผล" rows={4} />
          </Form.Item>
          <div className="form-buttons-left">
            <Button type="default" onClick={handleBack} className="left-button">
              กลับไปหน้าหลัก
            </Button>
          </div>
          <div className="form-buttons-right">
            <Button type="primary" htmlType="submit" className="right-button">
              ส่งคำขอ
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default RefundRequest;
