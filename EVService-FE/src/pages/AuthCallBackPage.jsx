import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Trang này có nhiệm vụ "hứng" token từ URL mà Backend trả về
export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Đọc token từ URL (ví dụ: ?token=eyJ...)
    const token = searchParams.get('token');

    if (token) {
      console.log('Đã nhận được token:', token);
      
      // 2. Lưu token vào localStorage
      // Đây là bước quan trọng để "duy trì đăng nhập"
      localStorage.setItem('', token);

      // 3. TODO: Cập nhật state (ví dụ: AuthContext)
      // (Bỏ qua bước này nếu bạn chưa dùng Context)
      // auth.login(token); 

      // 4. Chuyển hướng người dùng đến trang Dashboard
      // Dùng 'replace: true' để người dùng không thể bấm "Back" quay lại trang này
      navigate('/dashboard', { replace: true });

    } else {
      // 5. Nếu không có token, đây là lỗi. Chuyển về trang đăng nhập.
      console.error('Không tìm thấy token trong URL callback.');
      navigate('/auth', { replace: true });
    }

    // Chỉ chạy 1 lần duy nhất khi component được mount
  }, [searchParams, navigate]);

  // Hiển thị một thông báo loading đơn giản
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Đang xử lý đăng nhập...</h1>
      <p>Vui lòng chờ trong giây lát.</p>
    </div>
  );
}