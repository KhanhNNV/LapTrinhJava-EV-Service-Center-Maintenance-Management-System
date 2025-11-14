import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from '../services/api';

// Component hiển thị loading spinner
function LoadingSpinner() {
  const styles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif',
    flexDirection: 'column'
  };
  
  const spinnerStyle = {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(255, 255, 255, 0.3)',
    borderTop: '5px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  };

  return (
    <div style={styles}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle}></div>
      <h2 style={{color: 'white', fontSize: '24px'}}>Đang xử lý...</h2>
      <p style={{color: 'rgba(255,255,255,0.8)'}}>Vui lòng chờ trong giây lát</p>
    </div>
  );
}

export default function AuthCallBackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Lấy tất cả các loại token có thể có từ URL
    const emailToken = params.get('token');           // Token chung (dự phòng)
    const authToken = params.get('authToken');        // Cho Đăng nhập Social
    const refreshToken = params.get('refreshToken');  // Cho Đăng nhập Social
    const oauthError = params.get('error');           // Nếu Đăng nhập Social báo lỗi
    const tokenDK = params.get('tokenDK');            // Token đăng ký từ email
    const tokenQMK = params.get('tokenQMK');          // Token quên mật khẩu từ email

    console.log('🔍 Params nhận được:', { 
      emailToken, 
      authToken, 
      refreshToken, 
      oauthError, 
      tokenDK, 
      tokenQMK 
    });

    if (oauthError) {
      setError("Đăng nhập bằng mạng xã hội thất bại: " + oauthError);
      setIsProcessing(false);
      return;
    }

    if (authToken && refreshToken) {
      // --- KỊCH BẢN 1: XỬ LÝ ĐĂNG NHẬP SOCIAL ---
      handleLoginSuccess({ 
        accessToken: authToken, 
        refreshToken: refreshToken 
      }, "Đăng nhập thành công!");
    } else if (tokenDK) {
      // --- KỊCH BẢN 2: XỬ LÝ TOKEN ĐĂNG KÝ ---
      handleEmailToken(tokenDK, "register");
    } else if (tokenQMK) {
      // --- KỊCH BẢN 3: XỬ LÝ TOKEN QUÊN MẬT KHẨU ---
      handleEmailToken(tokenQMK, "password_reset");
    } else {
      // --- KỊCH BẢN 4: LỖI KHÔNG XÁC ĐỊNH ---
      setError("Không tìm thấy thông tin xác thực trong URL.");
      setIsProcessing(false);
    }

  }, [location, navigate]);

  // Hàm xử lý token đặc thù (đăng ký hoặc quên mật khẩu)
  const handleEmailToken = async (emailToken, tokenType) => {
    try {
      console.log(`📧 Đang xử lý ${tokenType} token...`);
      
      let endpoint = '';
      let successMessage = '';
      
      if (tokenType === "register") {
        endpoint = `${API_URL}/auth/verify-registration?token=${emailToken}`;
        successMessage = "Đăng ký thành công! Chào mừng bạn đến với EV Service Center.";
      } else if (tokenType === "password_reset") {
        endpoint = `${API_URL}/auth/verify-password-reset?token=${emailToken}`;
        successMessage = "Đăng nhập thành công! Vui lòng đổi mật khẩu mới trong phần cài đặt.";
      }
      
      const response = await fetch(endpoint, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`📥 ${tokenType} Response Status:`, response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${tokenType} thành công:`, data);
        
        if (data.accessToken && data.refreshToken) {
          handleLoginSuccess(data, successMessage);
          return;
        }
      }

      // Nếu request fail, lấy thông báo lỗi
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Link xác thực ${tokenType} không hợp lệ hoặc đã hết hạn.`);

    } catch (err) {
      console.error(`❌ Lỗi xử lý ${tokenType} token:`, err);
      setError(err.message || "Có lỗi xảy ra khi xử lý yêu cầu.");
      setIsProcessing(false);
    }
  };


  // Hàm helper để xử lý đăng nhập thành công
  const handleLoginSuccess = (tokenData, message) => {
    console.log('🎉 Đăng nhập thành công, lưu token...');
    
    localStorage.setItem("authToken", tokenData.accessToken);
    localStorage.setItem("refreshToken", tokenData.refreshToken);
    
    console.log('💾 Token đã được lưu');
    
    // Hiển thị thông báo thành công
    alert(message);
    
    // Chuyển hướng đến trang Dashboard
    navigate("/dashboard", { 
      replace: true,
      state: { message: message } 
    });
    
    // Reload để cập nhật state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Nếu có lỗi, hiển thị lỗi
  if (error) {
    return (
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: '#fee',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px'
          }}>❌</div>
          <h2 style={{color: '#c53030', marginBottom: '15px'}}>Lỗi xác thực</h2>
          <p style={{color: '#4a5568', marginBottom: '30px', lineHeight: '1.6'}}>{error}</p>
          <button 
            onClick={() => navigate('/auth', { replace: true })}
            style={{
              padding: '12px 30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Về trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Nếu đang xử lý, hiển thị loading
  if (isProcessing) {
    return <LoadingSpinner />;
  }

  return null;
}