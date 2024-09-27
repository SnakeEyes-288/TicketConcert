import axios from 'axios';
import { MemberInterface } from "../../interfaces/IMember";
import { PaymentInterface } from "../../interfaces/IPayment";
import { SmsInterface } from "../../interfaces/ISms";
import { TicketInterface } from "../../interfaces/ITicket";
import { ConditionInterface } from "../../interfaces/ICondition";

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
    Authorization: `${tokenType} ${token}`, // ใช้ backticks และ template literal ที่ถูกต้อง
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
async function GetMember(memberID: number) { 
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/user/${memberID}`, requestOptions);
  if (res.status === 200) {
    return res.json(); // คืนค่าข้อมูล JSON
  } else {
    return false;
  }
}


// ฟังก์ชันสำหรับสร้างสมาชิกใหม่ (ลงทะเบียน)
async function CreateMember(data: MemberInterface) {
  try {
    // ไม่จำเป็นต้องมี headers authorization สำหรับการลงทะเบียน
    const res = await axios.post(`${apiUrl}/Member`, data); 

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
  if (!data.payment.PaymentMethod || !data.payment.Amount) {
    console.error('Error: Missing PaymentMethod or Amount.');
    return false;
  }

  let requestBody: any;

  if (data.payment.SlipImage) {
    if (!data.payment.SlipImage.startsWith('data:image/')) {
      console.error('Error: SlipImage format is not valid.');
      return false;
    }

    try {
      const blob = await fetch(data.payment.SlipImage).then(res => res.blob());
      const base64String = await convertBlobToBase64(blob);

      requestBody = JSON.stringify({
        payment: { ...data.payment, SlipImage: base64String },
        tickets: data.tickets
      });
    } catch (error) {
      console.error('Error converting slip to Base64:', error);
      return false;
    }
  } else {
    requestBody = JSON.stringify({
      payment: data.payment,
      tickets: data.tickets
    });
  }

  const requestOptions = {
    method: "POST",
    body: requestBody,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // ใช้ backticks
      "Content-Type": "application/json"
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
async function GetTicket( memberID: number ){
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/tickets/member/${memberID}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    });

  return res;
};

// ฟังก์ชันสำหรับส่งอีเมลบัตรคอนเสิร์ต
async function SendTicketEmail(data?: {    
  memberID?: number, // ทำให้ optional เพื่อให้กำหนดค่าเริ่มต้นได้
  To?: string, 
  concertName?: string, 
  qrCode?: string, 
  seats?: string[], 
  amount?: number 
}): Promise<boolean> {
  const token = "your-auth-token"; // ควรใช้การดึง token จริงจากการจัดเก็บ
  //const apiUrl = "http://your-api-url.com"; // ตั้งค่า URL ของ API จริง

  // กำหนดค่าเริ่มต้นหากไม่ได้ส่งข้อมูลมา
  const defaultData = {
    memberID: 1, 
    To: "b6512194@g.sut.ac.th", 
    concertName: "Test Concert", 
    qrCode: "default_qr_code", 
    seats: ["P10-C3", "P9-C3"], 
    amount: 70
  };

  // ถ้า data ไม่มีค่า ให้ใช้ defaultData
  const requestData = data || defaultData;

  try {
    const response = await axios.post(
      `${apiUrl}/sendTicketEmail`,
      requestData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 200) {
      console.log("Email sent successfully");
      return true;
    } else {
      console.error("Error during email sending:", response.statusText);
      return false;
    }
  } catch (error: any) {
    if (error.response) {
      // เซิร์ฟเวอร์ตอบกลับแต่ไม่ใช่ 2xx
      console.error("Server responded with error:", error.response.data);
    } else if (error.request) {
      // ไม่มีการตอบสนองจากเซิร์ฟเวอร์
      console.error("No response received:", error.request);
    } else {
      // เกิดข้อผิดพลาดระหว่างตั้งค่า request
      console.error("Error setting up request:", error.message);
    }
    return false;
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

// ฟังก์ชันสำหรับดึงข้อมูลที่นั่งจากแต่ละคอนเสิร์ต
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

// ฟังก์ชันสำหรับดึงข้อมูลการชำระเงินจากสมาชิก
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

async function GetCondition() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/Condition`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    });

  return res;
}

async function CreateConditionRefun( conditionRefunData : ConditionInterface) {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conditionRefunData),
  };  

  let res = await fetch(`${apiUrl}/CreateCondition`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    });

  return res;
}

async function submitRefundRequest(values: any, ticket: any){
  try {
    const response = await fetch("/api/refund-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...values, ticket }), // ส่งข้อมูลตั๋วไปด้วย
    });

    // ตรวจสอบสถานะ response
    if (response.ok) {
      return { success: true };
    } else {
      throw new Error("Request failed");
    }
  } catch (error) {
    // ตรวจสอบว่า error เป็น instance ของ Error หรือไม่
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: errorMessage };
  }

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
  GetPaymentByMemberId,
  SendTicketEmail,
  GetCondition,
  CreateConditionRefun,
  submitRefundRequest
};


/*export const submitRefundRequest = async (values: any, ticket: any) => {
    try {
      const response = await fetch("/api/refund-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, ticket }), // ส่งข้อมูลตั๋วไปด้วย
      });
  
      // ตรวจสอบสถานะ response
      if (response.ok) {
        return { success: true };
      } else {
        throw new Error("Request failed");
      }
    } catch (error) {
      // ตรวจสอบว่า error เป็น instance ของ Error หรือไม่
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, message: errorMessage };
    }
  };
*/