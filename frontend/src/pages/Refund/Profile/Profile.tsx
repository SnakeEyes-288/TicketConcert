import React from "react";
import { Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./Profile.css";

interface ProfileProps {
  username: string;
  email: string;
  imageUrl?: string; // optional, can be passed or use default icon
}

const Profile: React.FC<ProfileProps> = ({ username, imageUrl }) => {
  return (
    <div className="profile-container">
      <Avatar 
        size={50} 
        src={imageUrl} 
        icon={!imageUrl && <UserOutlined />} // Use default icon if no image provided
      />
      <div className="profile-info">
        <Typography.Text className="profile-username">{username}</Typography.Text>
      </div>
    </div>
  );
};

export default Profile;
