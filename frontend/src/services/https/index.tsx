import axios from 'axios';
import { MemberInterface } from "../../interfaces/IMember";
import { PaymentInterface } from "../../interfaces/IPayment";
import { SmsInterface } from "../../interfaces/ISms";
import { TicketInterface } from "../../interfaces/ITicket";

const apiUrl = "http://localhost:8000";

// ฟังก์ชันสำหรับดึงค่า token และ token_type จาก localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  // ตรวจสอบค่า token และ tokenType
  if (!token || !tokenType) {
    throw new Error("Token or token type is missing.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // ใช้ backticks และ template literal
  };
};

// ฟังก์ชันลงชื่อเข้าใช้ (Sign In)
async function SignIn(data: MemberInterface) {
  try {
    const res = await axios.post(`${apiUrl}/signin`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error: unknown) {
    console.error("Error during sign-in:", (error as Error).message);
    return (error as any)?.response;
  }
}

// ฟังก์ชันสำหรับดึงข้อมูลสมาชิก
async function GetMember() {
  try {
    const res = await axios.get(`${apiUrl}/Member`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error: unknown) {
    console.error("Error fetching member data:", (error as Error).message);
    return (error as any)?.response;
  }
}

// ฟังก์ชันสำหรับสร้างสมาชิกใหม่ (ลงทะเบียน)
async function CreateMember(data: MemberInterface) {
  try {
    const res = await axios.post(`${apiUrl}/Member`, data, {
      headers: getAuthHeaders(),
    });

    if (res.status === 201) {
      console.log("Registration successful:", res.data);
      return res.data;
    } else {
      console.error("Error during registration:", res.data);
      return false;
    }
  } catch (error: unknown) {
    console.error("Request error:", (error as Error).message);
    return false;
  }
}

async function CreatePayment(data: { payment: PaymentInterface; tickets: TicketInterface[] }) {
  const formData = new FormData();

  // ตรวจสอบว่าค่าที่ส่งมามีการกำหนดหรือไม่ก่อนใช้ FormData
  if (data.payment.PaymentMethod) {
    formData.append("PaymentMethod", data.payment.PaymentMethod);
  }

  if (data.payment.PaymentDate) {
    formData.append("PaymentDate", data.payment.PaymentDate);
  }

  formData.append("Amount", String(data.payment.Amount ?? 0));

  // ตรวจสอบ SlipImage ก่อนแนบไฟล์ ถ้าไม่มีจะไม่ส่งค่าใดๆ
  if (data.payment.SlipImage) {
    formData.append("SlipImage", data.payment.SlipImage);
  }

  // เพิ่มข้อมูลรายการ ticket ในรูปแบบ JSON (เพราะ FormData ไม่รองรับ array โดยตรง)
  formData.append("Tickets", JSON.stringify(data.tickets));

  const requestOptions = {
    method: "POST",
    headers: {
      ...getAuthHeaders(), // เพิ่ม headers การตรวจสอบตัวตน
    },
    body: formData, // ใช้ FormData แทน JSON
  };

  try {
    const response = await fetch(`${apiUrl}/payment`, requestOptions);

    // ตรวจสอบการตอบกลับจากเซิร์ฟเวอร์
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json(); // แปลงการตอบกลับเป็น JSON
    return result;
  } catch (error) {
    console.error("CreatePayment Error:", error);

    // ตรวจสอบว่าข้อผิดพลาดเกิดจากการเชื่อมต่อเครือข่ายหรือไม่
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      console.error('Network error occurred');
    }

    return false; // ส่งกลับ false เมื่อเกิดข้อผิดพลาด
  }
}


// ฟังก์ชันสำหรับสร้างข้อความ SMS
async function CreateSms(data: SmsInterface) {
  try {
    const res = await axios.post(`${apiUrl}/Sms`, data, {
      headers: getAuthHeaders(),
    });
    return res.status === 201 ? res.data : false;
  } catch (error: unknown) {
    console.error("Error creating SMS:", (error as Error).message);
    return (error as any)?.response;
  }
}

// ฟังก์ชันสำหรับสร้างบัตรคอนเสิร์ต
async function CreateTicket(ticketData: TicketInterface) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ticketData),
  };

  let res = await fetch(`${apiUrl}/ticket`, requestOptions);
  
  if (!res.ok) {
    const errorDetails = await res.json();
    console.error('Error creating ticket:', errorDetails);
    return false;
  }

  return await res.json();
}

// ฟังก์ชันสำหรับดึงข้อมูลบัตรคอนเสิร์ต
async function GetTicket() {
  try {
    const res = await axios.get(`${apiUrl}/Ticket`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error: unknown) {
    console.error("Error fetching ticket data:", (error as Error).message);
    return (error as any)?.response;
  }
}

// ฟังก์ชันสำหรับดึงข้อมูลประเภทที่นั่งคอนเสิร์ต
async function GetSeatType() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/seatTypes`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    });

  return res;
}

// ฟังก์ชันสำหรับดึงข้อมูลคอนเสิร์ต
async function GetConcert() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/concerts`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    });

  return res;
}

// ฟังก์ชันสำหรับดึงข้อมูลที่นั่งจากแต่ล่ะคอนเสิร์ต
async function GetSeatsByConsertId(id: Number | undefined) {
  const requestOptions = {
    method: "GET"
  };

  let res = await fetch(`${apiUrl}/seats/${id}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    });

  return res;
}




export {
  GetMember,
  CreateMember,
  CreatePayment,
  CreateSms,
  GetTicket,
  CreateTicket,
  GetSeatType,
  SignIn,
  GetConcert,
  GetSeatsByConsertId,
};
