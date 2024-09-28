import React, { useEffect, useState } from "react"; // นำเข้า React และ hooks สำหรับการจัดการ state และ lifecycle
import { Form, Input, Button, message, Modal } from "antd"; // นำเข้า component จาก Ant Design
import { useNavigate, useLocation } from "react-router-dom"; // นำเข้า hooks สำหรับการนำทางและจัดการตำแหน่ง URL
import "./RefundRequest.css"; // นำเข้าสไตล์ CSS สำหรับ RefundRequest
import Profile from "./Profile/Profile"; // นำเข้า component สำหรับแสดงโปรไฟล์ของผู้ใช้
import { GetPaymentByMemberId, submitRefundRequest } from "../../services/https"; // นำเข้าฟังก์ชันสำหรับดึงข้อมูลการชำระเงินและส่งคำขอคืนเงิน
import { RefundapprovalInterface } from "../../interfaces/IRefundapproval"; // นำเข้าชนิดข้อมูลสำหรับการอนุมัติคืนเงิน
import { RefundrequestInterface } from "../../interfaces/IRefundrequest"; // นำเข้าชนิดข้อมูลสำหรับคำขอคืนเงิน
import { MemberInterface } from "../../interfaces/IMember"; // นำเข้าชนิดข้อมูลสำหรับสมาชิก
import { useUser } from '../../components/UserContext'; // ดึงข้อมูลจาก UserContext

const RefundRequest: React.FC = () => { // สร้างฟังก์ชันคอมโพเนนต์ RefundRequest
  const [form] = Form.useForm(); // สร้าง instance ของ form จาก Ant Design
  const navigate = useNavigate(); // ฟังก์ชันสำหรับนำทาง
  const location = useLocation(); // ฟังก์ชันสำหรับเข้าถึงข้อมูลของตำแหน่ง URL ปัจจุบัน
  const [messageApi, contextHolder] = message.useMessage(); // สร้าง API สำหรับแสดงข้อความ
  const { email, username, phone } = useUser(); // ดึงข้อมูล email, username, และ phone จาก UserContext
  
  // State for storing the logged-in user's information
  const [loggedInUser, setLoggedInUser] = useState<MemberInterface | null>(null); // State สำหรับเก็บข้อมูลผู้ใช้ที่เข้าสู่ระบบ
  const [payments, setPayments] = useState<any[]>([]); // State สำหรับเก็บข้อมูลการชำระเงิน

  // รับข้อมูลตั๋วจาก state
  const ticket = location.state?.ticket; // ดึงข้อมูลตั๋วจากสถานะของ location

  // Fetch the logged-in user info from localStorage
  useEffect(() => { // ใช้ useEffect เพื่อดึงข้อมูลเมื่อคอมโพเนนต์โหลดขึ้น
    const userData = localStorage.getItem("user"); // ดึงข้อมูลผู้ใช้จาก localStorage
    console.log("Raw userData from localStorage:", userData); // ตรวจสอบข้อมูล userData
    if (userData) { // ถ้าข้อมูลผู้ใช้มีอยู่
      const user: MemberInterface = JSON.parse(userData);// แปลงข้อมูล JSON เป็น object
      setLoggedInUser(user); // ตั้งค่า loggedInUser เป็นข้อมูลผู้ใช้
      if (user.ID) { // ถ้าผู้ใช้มี ID
        fetchPayments(user.ID); // เรียกฟังก์ชัน fetchPayments เพื่อนำข้อมูลการชำระเงิน
      } else {
        messageApi.error("ไม่พบ ID ผู้ใช้ กรุณาเข้าสู่ระบบใหม่"); // แสดงข้อความผิดพลาด
      }
      console.log("Logged In User after setting state:", user); // แสดงข้อมูลผู้ใช้ที่เข้าสู่ระบบ
    } else {
      messageApi.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้ กรุณาเข้าสู่ระบบใหม่"); // แสดงข้อความผิดพลาด
      navigate("/login");
    }
  }, [messageApi, navigate]); // ขึ้นอยู่กับ messageApi และ navigate

  const fetchPayments = async (memberID: number) => { // ฟังก์ชันดึงข้อมูลการชำระเงิน
    try {
      const paymentData = await GetPaymentByMemberId(memberID);// เรียกข้อมูลการชำระเงินโดยใช้ memberID
      setPayments(paymentData); // ตั้งค่าการชำระเงินใน state
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน");// แสดงข้อความผิดพลาด
    }
  };

  // Handle form submission
  const handleSubmit = async (values: any) => { // ฟังก์ชันจัดการการส่งแบบฟอร์ม
    if (!loggedInUser) {// ถ้าผู้ใช้ไม่ได้เข้าสู่ระบบ
      messageApi.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้"); // แสดงข้อความผิดพลาด
      return;
    }

    console.log("Logged In User:", loggedInUser);// แสดงข้อมูลผู้ใช้ที่เข้าสู่ระบบ
    console.log("Values Submitted:", values);// แสดงค่าที่ส่งในแบบฟอร์ม
    
    if (!ticket) { // ถ้าไม่มีข้อมูลตั๋ว
      messageApi.error("ไม่มีข้อมูลตั๋ว กรุณาลองใหม่อีกครั้ง"); // แสดงข้อความผิดพลาด
      return;
    }

    // สร้างข้อมูลสำหรับส่งคำขอ
    const refundData: RefundrequestInterface = {
      Refund_reason: values.reason, // ตั้งค่าเหตุผลการคืนเงินจากค่าที่ส่งเข้ามา (ค่า `reason` จาก `values` ที่ผู้ใช้กรอก)
      PaymentID: ticket?.PaymentID, // ตั้งค่า PaymentID จากตั๋ว (ใช้ optional chaining เพื่อป้องกันการเกิดข้อผิดพลาดหาก `ticket` เป็น null หรือ undefined)
  };
  
  
    // ส่งคำขอคืนเงิน
    try {
      const result: RefundapprovalInterface = await submitRefundRequest(refundData);// เรียกฟังก์ชันส่งคำขอคืนเงิน
  
      if (result.success) {// ถ้าสำเร็จ
        Modal.success({// แสดง modal ที่แสดงความสำเร็จ
          title: "สำเร็จ",
          content: "ส่งคำขอสำเร็จ",
        });
        navigate("/concerts");
      } else {
        messageApi.error("เกิดข้อผิดพลาดในการส่งคำขอ: " + result.message);// แสดงข้อความผิดพลาด
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการส่งคำขอ");// แสดงข้อความผิดพลาด
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
          username={loggedInUser?.Username || ""} // แสดงชื่อผู้ใช้งาน
          email={loggedInUser?.Email || ""} // แสดงอีเมล
          imageUrl={""}
        />
        <Form form={form} onFinish={handleSubmit} className="request-card-form"> {/* แบบฟอร์มสำหรับการขอคืนเงิน */}
          <h1>ขอคืนบัตร</h1>
          <Form.Item
            label={<span style={{ color: "white", fontSize: "20px" }}>ชื่อผู้ใช้งาน</span>}
            name="username" // ชื่อของฟิลด์
            labelCol={{ span: 24 }} // กำหนดขนาดของป้ายชื่อ
            wrapperCol={{ span: 24 }}// กำหนดขนาดของ wrapper
            initialValue={loggedInUser?.Username}// ค่าเริ่มต้น
            rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้งาน" }]}>{/* กฎสำหรับการตรวจสอบ */}
            <Input placeholder="กรอกชื่อผู้ใช้งาน" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "white", fontSize: "20px" }}>เบอร์โทร</span>}
            name="phone"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            initialValue={loggedInUser?.PhoneNumber}
            rules={[{ required: true, message: "กรุณากรอกเบอร์โทร" }]}>
            <Input placeholder="กรอกเบอร์โทร" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "white", fontSize: "20px" }}>อีเมล</span>}
            name="email"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            initialValue={loggedInUser?.Email}
            rules={[{ required: true, message: "กรุณากรอกอีเมล" }]}>
            <Input placeholder="กรอกอีเมล" />
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
