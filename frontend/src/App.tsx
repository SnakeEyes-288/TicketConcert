import React from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ConcertSelection from './pages/SelectConcertPage';
import SeatSelection from './pages/SelectSeatPage';
import Payment from './pages/Payment';
import Login from './pages/Member/Login';
import Register from './pages/Member/Register';
import TicketInformation from './pages/TicketInformation';
import { UserContextProvider } from './components/UserContext'; // เปลี่ยนเป็น UserContextProvider
import RefundRequest from './pages/Refund/RefundRequest';

const App: React.FC = () => {
  return (
    <UserContextProvider> {/* ครอบทุกเส้นทางด้วย UserContextProvider */}
      <Router>
        <Routes>
          {/* หน้า Login */}
          <Route path="/login" element={<Login />} />

          {/* หน้า Register */}
          <Route path="/register" element={<Register />} />

          {/* เส้นทางคอนเสิร์ตและการเลือกที่นั่ง */}
          <Route path="/concerts" element={<ConcertSelection />} />
          <Route path="/select-seats" element={<SeatSelection />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/TicketInformation" element={<TicketInformation />} />
          <Route path="/refund-request" element={<RefundRequest />} /> {/* เพิ่มเส้นทางนี้ */}

          {/* เปลี่ยนเส้นทางหน้าแรกไปที่ Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* จัดการกับเส้นทางที่ไม่รู้จัก */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserContextProvider>
  );
};

export default App;
