import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
export default function DashboardPage() {
  const [username, setUsername] = useState('');
  useEffect(()=> {
    const token = localStorage.getItem('authToken');
    if (token){
      // Giải mã token
        const decodedToken = jwtDecode(token);
        
        // Lấy claim 'username' (tên này phải khớp với claim trong JwtServiceImpl.java)
        if (decodedToken.username) {
          setUsername(decodedToken.username); // Cập nhật state
        }
    }
  })

  const handleLogout = () => {
    // Xóa cả hai token
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // Tải lại trang và điều hướng về /auth
    // Dùng window.location.href để đảm bảo App.jsx đọc lại localStorage
    window.location.href = '/auth'; 
  };
  return (
    <div>
      <h1>Dashboard Page</h1>
      {/* TODO: Build the dashboard layout and components */}
      <p>Welcome! {username}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}