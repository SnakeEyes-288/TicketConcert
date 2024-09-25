import React, { useState, useEffect } from 'react';   
import { List, Spin, Alert } from 'antd';
import { useUser } from '../../components/UserContext'; // ดึงข้อมูลจาก UserContext
import { GetTicket } from '../../services/https'; // นำเข้าฟังก์ชัน GetTicket
import { PaymentInterface } from '../../interfaces/IPayment';
import { SeatandTypeInterface } from '../../interfaces/ISeatandType'

// ประกาศ Interface ของ Ticket
interface TicketInterface {
  Price: number;
  PurchaseDate: string;
  Seat?: SeatandTypeInterface; // เปลี่ยนเป็น SeatandTypeInterface
  Payment?: PaymentInterface; // ทำให้เป็น optional
}

const TicketHistory: React.FC = () => {
  const { memberID } = useUser(); // ดึง MemberID จาก UserContext
  const [ticketData, setTicketData] = useState<TicketInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTicketData = async () => {
      if (memberID) {
        try {
          const data = await GetTicket(parseInt(memberID)); // แปลง memberID จาก string เป็น number
          if (data && data.data) {
            setTicketData(data.data); // ตั้งค่าจาก data.data
          } else {
            setError('ไม่พบข้อมูลตั๋ว');
          }

        } catch (error) {
          console.error('Error fetching ticket data:', error);
          setError('ไม่สามารถดึงข้อมูลตั๋วได้');
        } finally {
          setLoading(false);
        }
      }
    };
  
    fetchTicketData();
  }, [memberID]);
  

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" style={{ textAlign: 'center', marginTop: '100px' }} />;
  }

  return (
    <div>
      <List
        dataSource={Array.isArray(ticketData) ? ticketData : []} // ตรวจสอบให้แน่ใจว่าเป็น array
        renderItem={(item: TicketInterface) => (
          <List.Item>
            <div>หมายเลขที่นั่ง: {item.Seat?.seat_number || 'ไม่ระบุ'}</div>
            <div>ราคาตั๋ว: {item.Price} บาท</div>
            <div>วันที่ซื้อ: {item.PurchaseDate ? new Date(item.PurchaseDate).toLocaleString() : 'ไม่ระบุ'}</div>
            <div>สถานะการชำระเงิน: {item.Payment?.Status || 'ไม่ระบุ'}</div>
            <div>วิธีการชำระเงิน: {item.Payment?.PaymentMethod || 'ไม่ระบุ'}</div>
            <div>จำนวนตั๋ว: {item.Payment?.Quantity || 0} ใบ</div>
            <div>ยอดเงินรวม: {item.Payment?.Amount || 0} บาท</div>
            <div>
              ประเภทที่นั่ง: 
              {item.Seat?.seatType ? (
                <>
                  {item.Seat.seatType.Name || 'ไม่ระบุ'} - {item.Seat.seatType.Description || 'ไม่ระบุ'}
                </>
              ) : (
                'ไม่ระบุ'
              )}
            </div>
            {item.Payment?.SlipImage && <img src={item.Payment.SlipImage} alt="Slip" style={{ width: '100px' }} />}
          </List.Item>
        )}
      />
    </div>
  );  
};

export default TicketHistory; // ส่งออก Component ที่แก้ไขแล้ว
