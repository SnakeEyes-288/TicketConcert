import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ConcertSelection from './pages/SelectConcertPage';
import SeatSelection from './pages/SelectSeatPage';
import Payment from './pages/Payment';
import PaymentHistory from './pages/PaymentHistory';
import Login from './pages/Member/Login';
import Register from './pages/Member/Register';
import { UserProvider } from './components/UserContext'; // นำเข้า UserProvider
import { PrivateRoute } from './components/PrivateRoute'; // ใช้ named import แทน default import


const App: React.FC = () => {
  return (
    <UserProvider> {/* ครอบทุกเส้นทางด้วย UserProvider */}
      <Router>
        <Routes>
          {/* หน้า Login */}
          <Route path="/login" element={<Login />} />

          {/* หน้า Register */}
          <Route path="/register" element={<Register />} />

          {/* Private Route ต้องล็อกอินก่อนถึงจะเข้าได้ */}
          <Route element={<PrivateRoute />}>
            <Route path="/concerts" element={<ConcertSelection />} />
            <Route path="/select-seats" element={<SeatSelection />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
          </Route>

          {/* เปลี่ยนเส้นทางหน้าแรกไปที่ Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* จัดการกับเส้นทางที่ไม่รู้จัก */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
