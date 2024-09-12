import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ConcertSelection from './pages/SelectConcertPage';
import SeatSelection from './pages/SelectSeatPage';
import Payment from './pages/Payment';
import PaymentHistory from './pages/PaymentHistory';
import Login from './pages/Member/Login';
import Register from './pages/Member/Register';

// ฟังก์ชันสำหรับตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
const isAuthenticated = () => {
  return !!localStorage.getItem('token');  // หรือวิธีการตรวจสอบอื่นๆ
};

// Route ที่ต้องล็อกอินก่อนถึงจะเข้าถึงได้
const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* หน้า Login */}
        <Route path="/login" element={<Login />} />

        {/* หน้า Register */}
        <Route path="/register" element={<Register />} />

        {/* Private Route ต้องล็อกอินก่อนถึงจะเข้าได้ */}
        <Route path="/" element={<PrivateRoute element={<ConcertSelection />} />} />
        <Route path="/concerts" element={<PrivateRoute element={<ConcertSelection />} />} />
        <Route path="/select-seats" element={<PrivateRoute element={<SeatSelection />} />} />
        <Route path="/payment" element={<PrivateRoute element={<Payment />} />} />
        <Route path="/payment-history" element={<PrivateRoute element={<PaymentHistory />} />} /> 
      </Routes>
    </Router>
  );
};

export default App;
