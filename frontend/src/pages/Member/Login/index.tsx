import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const loginData = { email, password };

        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
        };

        // เชื่อมต่อไปที่ Backend API
        const res = await fetch('http://localhost:8000/login', requestOptions);

        if (res.status === 200) {
            const data = await res.json();
            console.log("Login successful", data);
            localStorage.setItem('token', data.token); // เก็บ token ไว้ใน localStorage หรือ state ของระบบ
            navigate("/concerts"); // นำทางไปยังหน้าถัดไป
        } else {
            setError("Login failed. Please check your email and password.");
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Login</button>
            </form>

            <p>
                Don't have an account? <Link to="/register">Sign up here</Link>.
            </p>
        </div>
    );
};

export default Login;
