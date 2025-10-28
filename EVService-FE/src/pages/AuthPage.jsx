import React, { useState } from 'react';
import AuthCard from '../features/auth/components/AuthCard'; //
import LogoHeader from '../features/auth/components/LogoHeader'; //
import LoginFormInfo from '../features/auth/components/LoginFormInfo'; //
import OtpStep from '../features/auth/components/OtpStep'; //
import RegisterFormInfo from '../features/auth/components/RegisterFormInfo'; //
import RegisterSuccessStep from '../features/auth/components/RegisterSuccessStep'; //
import styles from './AuthPage.module.css'; //
// Import formStyles để dùng textCenter
import formStyles from '../features/auth/components/formStyles.module.css'; //

export default function AuthPage() {
    // --- State ---
    const [tab, setTab] = useState('login');
    // Login
    const [loginStep, setLoginStep] = useState(1);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    // Register
    const [regStep, setRegStep] = useState(1);
    const [fullName, setFullName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    // --- Hàm xử lý ---
    const handleLoginSuccess = (userName) => {
        console.log('Login successful for:', userName);
        alert(`Chào mừng ${userName}! Đăng nhập thành công.`);
        // Thực tế: gọi hàm từ App.jsx để cập nhật state global
    };

    const handleSocialLogin = (provider) => {
        console.log(`Attempting social login with ${provider}`);
        setTimeout(() => handleLoginSuccess(`${provider} User`), 300);
    };

    const switchToLogin = () => {
        setTab('login');
        setLoginStep(1);
        setRegStep(1);
    };

    const switchToRegister = () => {
        setTab('register');
        setLoginStep(1);
        setRegStep(1);
    };

    const handleLoginInfoSubmit = () => {
        if (!loginEmail || !loginPassword) {
             alert('Vui lòng nhập đầy đủ Email và Mật khẩu!');
             return;
         }
        console.log('Login form submitted, moving to step 2');
        setLoginStep(2); // Chuyển sang bước OTP
    };

    const handleLoginOtpConfirm = () => {
        console.log('Login OTP confirmed');
        const userName = loginEmail.split('@')[0] || 'User';
        handleLoginSuccess(userName);
    };

    const handleRegisterInfoNext = () => {
         if (!fullName || !regEmail || !regPassword || !regConfirm) return alert('Vui lòng điền đầy đủ thông tin!');
         if (regPassword !== regConfirm) return alert('Mật khẩu không khớp!');
         if (regPassword.length < 6) return alert('Mật khẩu phải có ít nhất 6 ký tự!');
         if (!acceptTerms) return alert('Vui lòng đồng ý với điều khoản dịch vụ!');
         console.log('Register form submitted, moving to step 2');
         setRegStep(2);
     };

    const handleRegisterOtpConfirm = () => {
        console.log('Register OTP confirmed');
        setRegStep(3);
    };

    const handleRegisterSuccessDone = () => {
        console.log('Register successful, logging in user...');
        handleLoginSuccess(fullName || 'New User');
    };

    // Logic showTabs giữ nguyên
    const showTabs = (tab === 'login' && loginStep === 1) || (tab === 'register' && regStep === 1);

    return (
        <AuthCard>
            <LogoHeader />

            {/* Chỉ hiển thị nút tab khi showTabs là true */}
            {showTabs && (
                <div className={styles.tabButtons}>
                    {/* <<< NÚT TAB ĐÃ ĐƯỢC THÊM LẠI >>> */}
                    <button
                        className={`${styles.tabBtn} ${tab === 'login' ? styles.tabBtnActive : styles.tabBtnInactive}`}
                        onClick={switchToLogin}
                        disabled={tab === 'login'}
                    >
                        Đăng nhập
                    </button>
                    <button
                        className={`${styles.tabBtn} ${tab === 'register' ? styles.tabBtnActive : styles.tabBtnInactive}`}
                        onClick={switchToRegister}
                        disabled={tab === 'register'}
                    >
                        Đăng ký
                    </button>
                    {/* <<< KẾT THÚC NÚT TAB >>> */}
                </div>
            )}

            {/* Nội dung thay đổi theo tab và bước */}
            {tab === 'login' ? (
                <>
                    {loginStep === 1 && (
                        <LoginFormInfo
                            email={loginEmail}
                            password={loginPassword}
                            onChangeEmail={setLoginEmail}
                            onChangePassword={setLoginPassword}
                            onSubmit={handleLoginInfoSubmit} // Đảm bảo gọi đúng hàm
                            onSocial={handleSocialLogin}
                            switchToRegister={switchToRegister}
                        />
                    )}
                    {loginStep === 2 && (
                        <OtpStep
                            email={loginEmail}
                            onBack={() => setLoginStep(1)}
                            onConfirm={handleLoginOtpConfirm}
                            confirmButtonText="ĐĂNG NHẬP"
                        />
                    )}
                </>
            ) : (
                <>
                    {regStep === 1 && (
                        <RegisterFormInfo
                            fullName={fullName}
                            email={regEmail}
                            password={regPassword}
                            confirm={regConfirm}
                            accept={acceptTerms}
                            setFullName={setFullName}
                            setEmail={setRegEmail}
                            setPassword={setRegPassword}
                            setConfirm={setConfirm}
                            setAccept={setAcceptTerms}
                            onNext={handleRegisterInfoNext} // Đảm bảo gọi đúng hàm
                            onSocial={handleSocialLogin}
                            switchToLogin={switchToLogin}
                        />
                    )}
                    {regStep === 2 && (
                        <OtpStep
                            email={regEmail}
                            onBack={() => setRegStep(1)}
                            onConfirm={handleRegisterOtpConfirm}
                            confirmButtonText="XÁC NHẬN"
                        />
                    )}
                    {regStep === 3 && (
                        <RegisterSuccessStep
                            onDone={handleRegisterSuccessDone} // Đảm bảo gọi đúng hàm
                        />
                    )}
                    {/* Link "Đăng nhập" chỉ hiện ở bước 1 */}
                    {regStep === 1 && (
                         <p className={formStyles.textCenter} style={{ marginTop: '1rem' }}>
                            Đã có tài khoản?{' '}
                            <a href="#" className="link" onClick={(e) => { e.preventDefault(); switchToLogin(); }}>
                                Đăng nhập
                            </a>
                        </p>
                    )}
                </>
            )}
        </AuthCard>
    );
}