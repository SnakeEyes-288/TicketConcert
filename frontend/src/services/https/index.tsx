import axios from 'axios';
import { MemberInterface } from "../../interfaces/IMember";
import { PaymentInterface } from "../../interfaces/IPayment";
import { SmsInterface } from "../../interfaces/ISms";
import { TicketInterface } from "../../interfaces/ITicket";
import { ConditionInterface } from "../../interfaces/ICondition";
import { RefundapprovalInterface } from "../../interfaces/IRefundapproval";
import { RefundrequestInterface } from "../../interfaces/IRefundrequest" ;

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

// ฟังก์ชันสำหรับดึงข้อมูลบัตรคอนเสิร์ตจากสมาชิกคนนั้นๆ
async function GetTicket( id: number ){
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/tickets/${id}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    });

  return res;
};

// ฟังก์ชันสำหรับดึงข้อมูลบัตรคอนเสิร์ตจากสมาชิกคนนั้นๆ
/*async function GetTicketByPaymentID( id: number ){
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/tickets/payment/${id}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    });

  return res;
};*/

// ฟังก์ชันสำหรับส่งอีเมลบัตรคอนเสิร์ต
/*async function SendTicketEmail(data?: {    
  paymentID?: number, // ทำให้ optional เพื่อให้กำหนดค่าเริ่มต้นได้
  To?: string, 
  concertName?: string, 
  seats?: string[], 
  amount?: number 
}): Promise<boolean> {
  const token = "your-auth-token"; // ควรใช้การดึง token จริงจากการจัดเก็บ
  //const apiUrl = "http://your-api-url.com"; // ตั้งค่า URL ของ API จริง
  const requestData = data ;

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
}*/

async function SendTicketEmail(ticketIDs: number[]): Promise<boolean[]> {
  const token = "your-auth-token"; // ควรใช้การดึง token จริงจากการจัดเก็บ
  const results: boolean[] = []; // สร้างอาร์เรย์เพื่อเก็บผลลัพธ์

  for (const ticketID of ticketIDs) {
    try {
      const ticketResponse = await GetTicketByID(ticketID);
      const ticketData = ticketResponse.data;

      // ตรวจสอบว่าค่า ticketData เป็นอาร์เรย์หรือไม่ ถ้าไม่ใช่ให้แปลงเป็นอาร์เรย์
      if (!Array.isArray(ticketData)) {
        console.error(`ticketData is not iterable for ticket ID ${ticketID}`);
        results.push(false);
        continue; // ข้ามไปที่ ticketID ถัดไป
      }

      for (const ticket of ticketData) {
        // ตรวจสอบว่า ticket และ ticket.Seat มีข้อมูล และตรวจสอบว่าอีเมลถูกส่งไปแล้วหรือไม่
        if (!ticket || !ticket.Seat) {
          console.error(`Seat data is missing for ticket ID ${ticketID}`);
          results.push(false);
          continue;
        }

        if (ticket.EmailSent) {
          console.log(`Email already sent for ticket ID ${ticketID}`);
          results.push(true); // ข้ามการส่งอีเมลซ้ำ
          continue;
        }

        const requestData = {
          Subject: ticket.Seat.Concert?.Name,
          PaymentID: ticket.PaymentID,
          To: ticket.Member?.Email,
          Venue: ticket.Seat.Concert?.Venue,
          Seat: ticket.Seat.SeatNumber,
          Amount: ticket.Price,
          SeatType: ticket.Seat.SeatType?.Name,
        };

        const response = await axios.post(
          `${apiUrl}/sendTicketEmail`,
          requestData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          console.log(`Email sent successfully for ticket ID ${ticketID}`);

          // อัปเดตสถานะ EmailSent ภายในตัวแปร ticket เองทันที โดยไม่ต้องสร้างฟังก์ชันเพิ่ม
          ticket.EmailSent = true; 

          results.push(true);
        } else {
          console.error(`Error during email sending for ticket ID ${ticketID}:`, response.statusText);
          results.push(false);
        }
      }
    } catch (error: any) {
      console.error(`Error processing ticket ID ${ticketID}:`, error);
      results.push(false);
    }
  }

  return results; // ส่งคืนอาร์เรย์ผลลัพธ์
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


async function submitRefundRequest(refundData: RefundrequestInterface): Promise<RefundapprovalInterface> {
  const token = localStorage.getItem("token");// ดึง token ของผู้ใช้จาก localStorage
  
  if (!token) {
    return { success: false, message: "User is not authenticated" };// ตรวจสอบว่ามี token หรือไม่ ถ้าไม่มี ให้คืนค่าพร้อม error message
  }

  const requestOptions = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,// ใส่ token ลงใน header สำหรับการยืนยันตัวตน
      "Content-Type": "application/json",// กำหนดประเภทของเนื้อหาที่จะส่งเป็น JSON
    },
    body: JSON.stringify(refundData),// แปลงข้อมูล refundData เป็น JSON และใส่ลงใน body ของ request
  };

  try {// ตรวจสอบว่าการตอบกลับของ API มีสถานะเป็น "ok" หรือไม่ (สถานะ 200-299)
    const res = await fetch(`${apiUrl}/refundrequest`, requestOptions);// ส่ง HTTP request ไปยัง API URL สำหรับการขอคืนเงิน

    if (res.ok) { 
        const data = await res.json();
        // ต้องคืนค่าตามโครงสร้าง RefundapprovalInterface ที่คุณกำหนด
        return { success: true, message: "คำขอคืนเงินสำเร็จ", ...data }; // คืนค่าผลลัพธ์ที่สำเร็จพร้อมกับข้อมูลที่ได้รับจาก API
    } else {
        const errorData = await res.json();// แปลงข้อมูล error ที่ได้รับจาก API
        return { success: false, message: errorData.message || "เกิดข้อผิดพลาด" };// คืนค่าข้อผิดพลาดพร้อมข้อความจาก API (ถ้ามี)
    }
} catch (error: unknown) {
    console.error("Error during refund request:", error);// แสดง error ใน console สำหรับการดีบัก
    if (error instanceof Error) {
        return { success: false, message: error.message };// ถ้า error เป็นประเภท Error ให้คืนค่าข้อความจาก error นั้น
    }
    return { success: false, message: "เกิดข้อผิดพลาดที่ไม่รู้จัก" };// ถ้าไม่ใช่ error ปกติ คืนค่าข้อความ error ทั่วไป
}
}

async function GetTicketByID(ticketID: number) {
  const requestOptions = {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
      },
  };

  //const apiUrl = "http://your-api-url.com"; // ตั้งค่า URL ของ API จริง

  // ดึงข้อมูลตั๋วพร้อมข้อมูลที่เชื่อมโยง
  const res = await fetch(`${apiUrl}/tickets/${ticketID}`, requestOptions)
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