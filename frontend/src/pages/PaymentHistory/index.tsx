// src/pages/PaymentHistory/index.tsx
import React from 'react';
import { List } from 'antd';

// Define the type for your data items
type PaymentItem = {
  concert: string;
  seat: string;
  ticketType: string;
  quantity: number;
  amount: number;
};

// Example data
const paymentHistoryData: PaymentItem[] = [
  {
    concert: 'Concert A',
    seat: 'A1',
    ticketType: 'VIP',
    quantity: 2,
    amount: 5000,
  },
  // Add more items as needed
];

const PaymentHistory: React.FC = () => {
  return (
    <div>
      <List
        dataSource={paymentHistoryData}
        renderItem={(item: PaymentItem) => (
          <List.Item>
            <div>คอนเสิร์ต: {item.concert}</div>
            <div>ที่นั่ง: {item.seat}</div>
            <div>ประเภทบัตร: {item.ticketType}</div>
            <div>จำนวนบัตร: {item.quantity} ใบ</div>
            <div>จำนวนเงิน: {item.amount} บาท</div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default PaymentHistory;
