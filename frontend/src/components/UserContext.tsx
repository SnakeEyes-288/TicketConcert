import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextInterface {
  token: string | null;
  memberID: string | null;
  setToken: (token: string | null) => void;
  setMemberID: (memberID: string | null) => void;
  username?: string; // เพิ่มถ้าคุณต้องการ
  email?: string;    // เพิ่มถ้าคุณต้องการ
  imageUrl?: string; // เพิ่ม imageUrl
}

const UserContext = createContext<UserContextInterface | undefined>(undefined);

const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [memberID, setMemberID] = useState<string | null>(null);

  // สมมุติว่า username และ email ได้มาจากที่ใดที่หนึ่ง
  const username = "exampleUsername"; // แทนที่ด้วยข้อมูลจริง
  const email = "example@example.com"; // แทนที่ด้วยข้อมูลจริง
  const imageUrl = "https://via.placeholder.com/150"; // กำหนด URL ของรูปภาพ

  return (
    <UserContext.Provider value={{ token, memberID, setToken, setMemberID, username, email,imageUrl }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook สำหรับใช้ Context
const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};

export { UserContextProvider, useUser }; // ส่งออก UserContextProvider และ useUser
