import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import AuthCard from '../features/auth/components/AuthCard';
import LogoHeader from '../features/auth/components/LogoHeader';
import LoginFormInfo from '../features/auth/components/LoginFormInfo';
import OtpStep from '../features/auth/components/OtpStep';
import RegisterFormInfo from '../features/auth/components/RegisterFormInfo';
import RegisterSuccessStep from '../features/auth/components/RegisterSuccessStep';
import styles from './AuthPage.module.css';
// Import formStyles để dùng textCenter
import formStyles from '../features/auth/components/formStyles.module.css';

const API_URL = 'http://localhost:8081';
export default function AuthPage() {
    const navigate = useNavigate();
    // --- State ---
    const [tab, setTab] = useState('login');
    // Login
    const [loginStep, setLoginStep] = useState(1);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginErrors, setLoginErrors] = useState({});
    // Register
    const [regStep, setRegStep] = useState(1);
    const [regUsername, setRegUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [regPhoneNumber, setRegPhoneNumber] = useState('');
    const [regAddress, setRegAddress] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);


    //State cho validation và điều khoản
    const [regErrors, setRegErrors] = useState({});
    const [termsViewed, setTermsViewed] = useState(false);
    // --- Hàm xử lý ---

    //~ Hàm xử lý xóa lỗi khi focus
    const handleLoginFieldFocus = (fieldName) => {
        // Khi focus, xóa lỗi của ô đó VÀ lỗi chung (general)
        setLoginErrors((prev) => ({
            ...prev,
            [fieldName]: undefined,
            general: undefined,
        }));
    };
    //~ Hàm xử lý khi click vào ô (xóa lỗi)
    const handleRegFieldFocus = (fieldName) => {
        // Khi focus, chỉ xóa lỗi của ô đó
        setRegErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    };
    //~ Hàm xử lý khi rời ô (hiện lại lỗi nếu còn)
    const handleFieldBlur = (fieldName) => {
        // Tạm thời chỉ re-validate các trường đơn giản
        // (Tránh validate password strength khi đang gõ confirm)
        if (fieldName !== 'password' && fieldName !== 'confirm') {
            validateRegistration();
        }
        // Khi rời ô confirm, kiểm tra lại
        if (fieldName === 'confirm') {
            if (regPassword && regConfirm && regPassword !== regConfirm) {
                setRegErrors(prev => ({ ...prev, confirm: "Mật khẩu không khớp" }));
            }
        }
    };

    const handleLoginSuccess = (token) => {
        if (!token) {
            console.error('Login success called without token');
            return;
        }
        console.log('Login successful, saving token...');
        localStorage.setItem('authToken', token);
        navigate('/dashboard', { replace: true });
    };

    const handleSocialLogin = (provider) => {
        if (provider === 'Google') {
            window.location.href = `${API_URL}/oauth2/authorization/google`;
        }
    };

    const switchToLogin = () => {
        setTab('login');
        setLoginStep(1);
        setRegStep(1);
        setRegErrors({});//~ Xóa lỗi khi chuyển tab Login
        setLoginErrors({});//~ Ngược lại
    };

    const switchToRegister = () => {
        setTab('register');
        setLoginStep(1);
        setRegStep(1);
        setRegErrors({});//~ Xóa lỗi khi chuyển tab Login
        setLoginErrors({});//~ Ngược lại
    };

    const handleLoginInfoSubmit = async () => {
        setLoginErrors({}); //~ Xóa các lỗi cũ khi submit

        if (!loginEmail || !loginPassword) {
            setLoginErrors({ //~ Set lỗi cụ thể
                email: !loginEmail ? 'Vui lòng nhập Tên đăng nhập/Email' : undefined,
                password: !loginPassword ? 'Vui lòng nhập Mật khẩu' : undefined,
            });
            return;
        }
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                username: loginEmail,
                password: loginPassword
            });
            const { accessToken } = response.data;
            if (accessToken) {
                handleLoginSuccess(accessToken);
            } else {
                setLoginErrors({ general: 'Lỗi không nhận được token.' });
            }
        } catch (error) {
            if (
                error.response &&
                (error.response.status === 401 ||
                    error.response.status === 403 ||
                    error.response.status === 404)
            ) {
                // alert('Đăng nhập thất bại: Sai Tên đăng nhập hoặc Mật khẩu.'); 
                setLoginErrors({ general: 'Sai Tên đăng nhập hoặc Mật khẩu.' });
            } else {
                // alert('Đã xảy ra lỗi kết nối. Vui lòng thử lại.'); 
                setLoginErrors({ general: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.' });
            }
        }
    };

    const validateRegistration = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;// Regex cho email

        // ~ Kiểm tra các trường bắt buộc (theo yêu cầu của bạn)
        if (!regUsername) newErrors.username = "Hãy điền Tên đăng nhập";
        if (!regPassword) newErrors.password = "Hãy điền Mật khẩu";
        if (!regConfirm) newErrors.confirm = "Hãy điền xác nhận Mật khẩu";
        if (!regEmail) {
            newErrors.email = 'Hãy điền Email';
        } else if (!emailRegex.test(regEmail)) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (!regPhoneNumber) {
            newErrors.phoneNumber = 'Hãy điền Số điện thoại';
        } else if (regPhoneNumber.length < 10 || regPhoneNumber.length > 12) {
            newErrors.phoneNumber = 'Số điện thoại này không chính xác';
        }
        if (regPassword && regConfirm && regPassword !== regConfirm) {
            newErrors.confirm = "Mật khẩu không khớp";
        }

        // ~ Kiểm tra điều khoản (phải được tick)
        if (!acceptTerms) {
            //~ (Yêu cầu của bạn) Chỉ báo lỗi nếu họ đã xem
            if (termsViewed) {
                newErrors.acceptTerms = "Bạn phải ĐỒNG Ý với điều khoản";
            } else {
                newErrors.acceptTerms = "Vui lòng xem và đồng ý điều khoản";
            }
        }
        //~ Kiểm tra độ mạnh mật khẩu (dựa trên logic `passwordStrength` của bạn)
        const hasUppercase = /[A-Z]/.test(regPassword);
        const hasLowercase = /[a-z]/.test(regPassword);
        const hasNumber = /[0-9]/.test(regPassword);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(regPassword);
        const hasLength = regPassword.length >= 8;

        //~ Chỉ kiểm tra độ mạnh nếu mật khẩu không rỗng
        if (regPassword && (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial || !hasLength)) {
            //~ Lỗi này sẽ hiển thị qua UI (dấu ✗), nhưng ta vẫn thêm lỗi chính
            newErrors.password = "Mật khẩu chưa đáp ứng đủ các yêu cầu";
        }

        setRegErrors(newErrors);
        //~ Trả về true nếu không có lỗi
        return Object.keys(newErrors).length === 0;
    };
    const handleRegisterInfoNext = async () => {
        if (!validateRegistration()) {
            console.log("Validation failed", regErrors);
            return;
        }
        try {
            const registerData = {
                username: regUsername,
                fullName: fullName,
                email: regEmail,
                password: regPassword,
                phoneNumber: regPhoneNumber,
                address: regAddress
            };

            await axios.post(`${API_URL}/auth/register`, registerData);
            console.log('Mã OTP được gửi qua email của bạn');
            setRegStep(2);
            setRegErrors({});

        } catch (error) {
            console.error('Register failed:', error);
            if (error.response && error.response.data) {
                const errorMessage = error.response.data.message || error.response.data;
                if (errorMessage.includes("Username đã tồn tại")) {
                    setRegErrors(prev => ({ ...prev, username: "Tên đăng nhập này đã tồn tại" }));
                } else if (errorMessage.includes("Email đã tồn tại")) {
                    setRegErrors(prev => ({ ...prev, email: "Email này đã tồn tại" }));
                } else {
                    alert(`Đăng ký thất bại: ${errorMessage}`);
                }
            } else {
                alert('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
            }
        }
    };

    const handleRegisterOtpConfirm = () => {
        console.log('Đăng kí OTP thành công');
        setRegStep(3);
    };

    const handleRegisterSuccessDone = () => {
        console.log('Đăng kí thành công, Vui lòng đăng nhập lại');
        switchToLogin();
    };

    // Logic showTabs giữ nguyên
    const showTabs = (tab === 'login' && loginStep === 1) || (tab === 'register' && regStep === 1);

    return (
        <AuthCard>
            <LogoHeader />

            {/* Chỉ hiển thị nút tab khi showTabs là true */}
            {showTabs && (
                <div className={styles.tabButtons}>
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
                </div>
            )}

            {/* Nội dung thay đổi theo tab và bước */}
            {tab === 'login' ? (
                <LoginFormInfo
                    email={loginEmail}
                    password={loginPassword}
                    onChangeEmail={setLoginEmail}
                    onChangePassword={setLoginPassword}
                    onSubmit={handleLoginInfoSubmit}
                    onSocial={handleSocialLogin}
                    switchToRegister={switchToRegister}
                    errors={loginErrors}
                    onFieldFocus={handleLoginFieldFocus}
                />
            ) : (
                <>
                    {regStep === 1 && (
                        <RegisterFormInfo
                            errors={regErrors}
                            termsViewed={termsViewed}
                            onTermsClick={() => setTermsViewed(true)}

                            username={regUsername}
                            setUsername={setRegUsername}

                            phoneNumber={regPhoneNumber}
                            setPhone={setRegPhoneNumber}

                            address={regAddress}
                            setAddress={setRegAddress}

                            fullName={fullName}
                            setFullName={setFullName}

                            email={regEmail}
                            setEmail={setRegEmail}

                            password={regPassword}
                            setPassword={setRegPassword}

                            confirm={regConfirm}
                            setConfirm={setRegConfirm}

                            accept={acceptTerms}
                            setAccept={setAcceptTerms}

                            onNext={handleRegisterInfoNext}
                            onSocial={handleSocialLogin}

                            onFieldFocus={handleRegFieldFocus}
                        />
                    )}
                    {regStep === 2 && (
                        <OtpStep
                            email={regEmail}
                            onBack={() => { setRegStep(1); setRegErrors({}); }} // Xóa lỗi khi back
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
                        <p className={formStyles.textCenter} style={{ marginTop: '0.5rem' }}>
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