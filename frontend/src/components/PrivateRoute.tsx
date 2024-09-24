// src/components/PrivateRoute.tsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from './UserContext'; // ใช้ useUser ที่ export จาก UserContext.tsx

export const PrivateRoute: React.FC = () => {
  const { token } = useUser(); // ใช้ token เพื่อตรวจสอบการล็อกอิน

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};
