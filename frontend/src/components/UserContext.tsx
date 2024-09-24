import React, { useContext, useState } from 'react';

// สร้าง interface เพื่อกำหนดรูปแบบของข้อมูลที่ Context จัดเก็บ
interface UserContextInterface {
  token: string | null;
  memberID: string | null;
  setToken: (token: string | null) => void;
  setMemberID: (id: string | null) => void;
}

// สร้าง Context
const UserContext = React.createContext<UserContextInterface | undefined>(undefined);

// สร้าง custom hook เพื่อดึงข้อมูลจาก UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// สร้าง UserProvider เพื่อให้สามารถใช้ UserContext ใน component อื่นๆ
interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [memberID, setMemberID] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ token, memberID, setToken, setMemberID }}>
      {children}
    </UserContext.Provider>
  );
};
