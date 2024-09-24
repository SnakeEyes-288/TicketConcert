import React from 'react';
import ReactDOM from 'react-dom/client'; // ใช้ API ใหม่
import App from './App';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!); // สร้าง root element
root.render(<App />);
