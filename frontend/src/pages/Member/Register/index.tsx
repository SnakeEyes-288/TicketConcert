import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateMember } from "../../../services/https";

const Register: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();  // ใช้เพื่อ redirect หลังจาก register สำเร็จ

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const memberData = {
            First_name: firstName,
            Last_name: lastName,
            Email: email,
            Password: password,
        };

        const res = await CreateMember(memberData);

        if (res) {
            console.log("Register success", res);
            // หลังจาก register สำเร็จ ให้ผู้ใช้กลับไปที่หน้า login
            navigate("/login");
        } else {
            setError("Registration failed. Please try again.");
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>First Name:</label>
                    <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Last Name:</label>
                    <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
