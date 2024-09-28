import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'; 
import { GetMember } from '../services/https'; // อย่าลืม import ฟังก์ชันนี้

interface UserContextInterface {
  token: string | null;
  memberID: string | null;
  setToken: (token: string | null) => void;
  setMemberID: (memberID: string | null) => void;
  username?: string; 
  email?: string;    
  imageUrl?: string; 
  phone?: string;
}

const UserContext = createContext<UserContextInterface | undefined>(undefined);

const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [memberID, setMemberID] = useState<string | null>(null);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [phone, setIPhone] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (memberID) { // ตรวจสอบว่า memberID มีค่า
        try {
          const memberData = await GetMember(Number(memberID)); // ส่ง memberID ไปยังฟังก์ชัน
          if (memberData) {
            setUsername(memberData.Username); // ใช้ Username จาก API
            setEmail(memberData.Email); // ใช้ Email จาก API
            setImageUrl(memberData.imageUrl); // หากมีภาพโปรไฟล์ สามารถใช้ได้ที่นี่
            setIPhone(memberData.phone);
          }
        } catch (error) {
          console.error("Error fetching member data:", error);
        }
      }
    };
    
    fetchMemberData();
  }, [memberID]); // เพิ่ม memberID เป็น dependency เพื่อให้ฟังก์ชันทำงานใหม่เมื่อ memberID เปลี่ยน

  return (
    <UserContext.Provider value={{ token, memberID, setToken, setMemberID, username, email, imageUrl, phone }}>
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

export { UserContextProvider, useUser };
