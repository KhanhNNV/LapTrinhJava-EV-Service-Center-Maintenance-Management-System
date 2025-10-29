import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
// import NotFoundPage from './pages/NotFoundPage'; // Sẽ tạo sau

function App() {
  // Giả sử bạn có state hoặc context để kiểm tra đăng nhập
  const isAuthenticated = false; // Tạm thời để false

  return (
    <Router>
      <Routes>
        {/* Route cho trang đăng nhập/đăng ký */}
        <Route
          path="/auth"
          element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" replace />}
        />

        {/* Route cho trang dashboard (yêu cầu đăng nhập) */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/auth" replace />}
        />

        {/* Route mặc định: nếu đã đăng nhập thì vào dashboard, chưa thì vào auth */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />}
        />

        {/* TODO: Thêm Route cho trang 404 */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;