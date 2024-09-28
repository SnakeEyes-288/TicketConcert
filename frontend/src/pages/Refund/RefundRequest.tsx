import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Modal } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import "./RefundRequest.css";
import Profile from "./Profile/Profile";
import { submitRefundRequest } from "../../services/https";
import { RefundapprovalInterface } from "../../interfaces/IRefundapproval";
import { RefundrequestInterface } from "../../interfaces/IRefundrequest";
import { MemberInterface } from "../../interfaces/IMember";
import { useUser } from '../../components/UserContext'; // ดึงข้อมูลจาก UserContext

const RefundRequest: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const { email, username, phone } = useUser();
  
  // State for storing the logged-in user's information
  const [loggedInUser, setLoggedInUser] = useState<MemberInterface | null>(null);

  // รับข้อมูลตั๋วจาก state
  const ticket = location.state?.ticket;

  // Fetch the logged-in user info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    console.log(userData); // ตรวจสอบข้อมูล userData
    console.log("Logged In User:", { username, email, phone }); // ตรวจสอบค่าที่ดึงมา
    if (userData) {
      const user: MemberInterface = JSON.parse(userData);
      setLoggedInUser(user);
    } else {
      messageApi.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้ กรุณาเข้าสู่ระบบใหม่");
      navigate("/login");
    }
  }, [email, messageApi, navigate, phone, username]);
  
  const handleSubmit = async (values: any) => {
    if (!loggedInUser) {
        messageApi.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
        return;
    }

    console.log("Logged In User:", loggedInUser);
    console.log("Values Submitted:", values);
  
    // สร้างข้อมูลสำหรับส่งคำขอ
    const refundData: RefundrequestInterface = {
        Refund_reason: values.reason,
        PaymentID: ticket?.PaymentID,
    };
  
    // ส่งคำขอคืนเงิน
    const result: RefundapprovalInterface = await submitRefundRequest(refundData);
  
    if (result.success) {
        Modal.success({
            title: "สำเร็จ",
            content: "ส่งคำขอสำเร็จ",
        });
        navigate("/concerts");
    } else {
        messageApi.error("เกิดข้อผิดพลาดในการส่งคำขอ: " + result.message);
    }
  };

  // กลับไปหน้าหลัก
  const handleBack = () => {
    navigate("/concerts");
  };

  return (
    <>
      {contextHolder}
      <div className="refund-request-container">
        <Profile
          username={loggedInUser?.Username || ""}
          email={loggedInUser?.Email || ""}
          imageUrl={""}
        />
        <Form form={form} onFinish={handleSubmit} className="request-card-form">
          <h1>ขอคืนบัตร</h1>
          <Form.Item
            label={<span style={{ color: "white", fontSize: "20px" }}>ชื่อผู้ใช้งาน</span>}
            name="username"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้งาน" }]}>
            <Input placeholder="กรอกชื่อผู้ใช้งาน" defaultValue={loggedInUser?.Username} />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "white", fontSize: "20px" }}>เบอร์โทร</span>}
            name="phone"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: "กรุณากรอกเบอร์โทร" }]}>
            <Input placeholder="กรอกเบอร์โทร" defaultValue={loggedInUser?.PhoneNumber} />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "white", fontSize: "20px" }}>อีเมล</span>}
            name="email"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: "กรุณากรอกอีเมล" }]}>
            <Input placeholder="กรอกอีเมล" defaultValue={loggedInUser?.Email} />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "white", fontSize: "20px" }}>เหตุผล</span>}
            name="reason"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            rules={[{ required: true, message: "กรุณากรอกเหตุผล" }]}>
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
