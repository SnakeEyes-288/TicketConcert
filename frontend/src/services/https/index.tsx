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

// ฟังก์ชันสำหรับสร้างการชำระเงิน
async function CreatePayment(data: { payment: PaymentInterface; tickets: TicketInterface[] }) { 
  // ตรวจสอบว่าข้อมูล PaymentMethod และ Amount ถูกต้อง
  if (!data.payment.PaymentMethod || !data.payment.Amount) {
    console.error('Error: Missing PaymentMethod or Amount.');
    return false;
  }

  let requestBody: any;

  // ตรวจสอบว่าใช้ไฟล์ slip หรือไม่
  if (data.payment.SlipImage) {
    if (!data.payment.SlipImage.startsWith('data:image/')) {
      console.error('Error: SlipImage format is not valid.');
      return false;
    }

    try {
      // แปลงสลิปเป็น Base64
      const blob = await fetch(data.payment.SlipImage).then(res => res.blob());
      const base64String = await convertBlobToBase64(blob);

      // สร้าง JSON request body
      requestBody = JSON.stringify({
        payment: { ...data.payment, SlipImage: base64String }, // เพิ่ม Base64 ลงใน payment
        tickets: data.tickets
      });
    } catch (error) {
      console.error('Error converting slip to Base64:', error);
      return false;
    }
  } else {
    // กรณีที่ไม่มีไฟล์ slip, ส่งเป็น JSON
    requestBody = JSON.stringify({
      payment: data.payment,
      tickets: data.tickets
    });
  }

  const requestOptions = {
    method: "POST",
    body: requestBody,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // token ที่ต้องตรวจสอบ
      "Content-Type": "application/json" // ระบุ Content-Type เป็น application/json
    },
  };

  try {
    const response = await fetch(`${apiUrl}/payment`, requestOptions);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('CreatePayment Error:', error);
    return false;
  }
}

// ฟังก์ชันสำหรับแปลง Blob เป็น Base64
const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};



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

// ฟังก์ชันสำหรับดึงข้อมูลที่นั่งจากแต่ล่ะคอนเสิร์ต
async function GetPaymentByMemberId(id: Number | undefined) {
  const requestOptions = {
    method: "GET"
  };

  let res = await fetch(`${apiUrl}/payment/${id}`, requestOptions)
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
  GetPaymentByMemberId
};
