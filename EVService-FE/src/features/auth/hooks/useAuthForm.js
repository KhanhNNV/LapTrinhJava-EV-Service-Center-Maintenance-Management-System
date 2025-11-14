import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../api/authService";
import { API_URL } from "../../../services/api";

export const useAuthForm = () => {
  const navigate = useNavigate();
  // --- State ---
  const [tab, setTab] = useState("login");
  // Login
  const [loginStep, setLoginStep] = useState(1);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState({});
  // Register
  const [regStep, setRegStep] = useState(1);
  const [regUsername, setRegUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regPhoneNumber, setRegPhoneNumber] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //State cho validation và điều khoản
  const [regErrors, setRegErrors] = useState({});
  const [termsViewed, setTermsViewed] = useState(false);

  // STATE CHO QUÊN MẬT KHẨU
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0: không hiển thị, 1: nhập email, 2: thành công

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

  //~ Hàm sửa lý khi login success
  const handleLoginSuccess = (token) => {
    if (!token || !token.accessToken) {
      console.error("Login success called without token");
      return;
    }
    // Lưu accesstoken và refreshtoken vào localstrorage
    localStorage.setItem("authToken", token.accessToken);
    localStorage.setItem("refreshToken", token.refreshToken);
    window.location.href = "/dashboard";
  };

  //~ Hàm cung cấp đường dẫn cho login social
  const handleSocialLogin = (provider) => {
    if (provider === "Google") {
      window.location.href = `${API_URL}/oauth2/authorization/google`;
    }
    if (provider === "GitHub") {
      window.location.href = `${API_URL}/oauth2/authorization/github`;
    }
    if (provider === "Facebook") {
      window.location.href = `${API_URL}/oauth2/authorization/facebook`;
    }
  };

  const switchToLogin = () => {
    setTab("login");
    setLoginStep(1);
    setRegStep(1);
    setRegErrors({}); //~ Xóa lỗi khi chuyển tab Login
    setLoginErrors({}); //~ Ngược lại
  };

  const switchToRegister = () => {
    setTab("register");
    setLoginStep(1);
    setRegStep(1);
    setRegErrors({}); //~ Xóa lỗi khi chuyển tab Login
    setLoginErrors({}); //~ Ngược lại
  };

  // Chuyển sang trang quên mật khẩu
  const switchToForgotPassword = () => {
    setTab("forgot");
    setForgotPasswordStep(1);
    // Copy email từ login form nếu có
    if (loginEmail) {
      setForgotPasswordEmail(loginEmail);
    }
    setLoginErrors({});
  };
  // THÊM HÀM: Validate email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // THÊM HÀM: Xử lý quên mật khẩu
  const handleForgotPasswordSubmit = async () => {
    setLoginErrors({});
    
    // Validate email
    if (!forgotPasswordEmail) {
      setLoginErrors({ email: 'Vui lòng nhập email' });
      return;
    }

    if (!isValidEmail(forgotPasswordEmail)) {
      setLoginErrors({ email: 'Email không hợp lệ' });
      return;
    }

    setIsLoading(true);
    try {
      console.log('📧 Gửi yêu cầu quên mật khẩu cho:', forgotPasswordEmail);
      
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi gửi yêu cầu');
      }

      // Chuyển sang bước thành công
      setForgotPasswordStep(2);
      console.log('✅ Yêu cầu quên mật khẩu thành công');
      
    } catch (error) {
      console.error('❌ Lỗi quên mật khẩu:', error);
      setLoginErrors({ general: error.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };
  // THÊM HÀM: Hoàn tất quên mật khẩu
  const handleForgotPasswordDone = () => {
    setForgotPasswordStep(0);
    switchToLogin();
  };

  const handleLoginInfoSubmit = async () => {
    setLoginErrors({}); //~ Xóa các lỗi cũ khi submit

    if (!loginEmail || !loginPassword) {
      setLoginErrors({
        //~ Set lỗi cụ thể
        email: !loginEmail ? "Vui lòng nhập Tên đăng nhập/Email" : undefined,
        password: !loginPassword ? "Vui lòng nhập Mật khẩu" : undefined,
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await authService.login(loginEmail, loginPassword);
      const tokenData = response.data;
      if (tokenData && tokenData.accessToken) {
        //~ Gọi từ thằng auth/hooks/useAuthForm.js
        handleLoginSuccess(tokenData); // Trả về cả object data
      } else {
        setLoginErrors({ general: "Lỗi không nhận được token." });
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      if (
        error.response &&
        (error.response.status === 401 ||
          error.response.status === 403 ||
          error.response.status === 404)
      ) {
        // alert('Đăng nhập thất bại: Sai Tên đăng nhập hoặc Mật khẩu.');
        setLoginErrors({ general: "Sai Tên đăng nhập hoặc Mật khẩu." });
      } else {
        // alert('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
        setLoginErrors({ general: "Đã xảy ra lỗi kết nối. Vui lòng thử lại." });
      }
    }
  };

  const validateRegistration = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex cho email

    // ~ Kiểm tra các trường bắt buộc (theo yêu cầu của bạn)
    if (!regUsername) newErrors.username = "Hãy điền Tên đăng nhập";
    if (!regPassword) newErrors.password = "Hãy điền Mật khẩu";
    if (!regConfirm) newErrors.confirm = "Hãy điền xác nhận Mật khẩu";
    if (!regEmail) {
      newErrors.email = "Hãy điền Email";
    } else if (!emailRegex.test(regEmail)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!regPhoneNumber) {
      newErrors.phoneNumber = "Hãy điền Số điện thoại";
    } else if (regPhoneNumber.length < 10 || regPhoneNumber.length > 12) {
      newErrors.phoneNumber = "Số điện thoại này không chính xác";
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
    if (
      regPassword &&
      (!hasUppercase ||
        !hasLowercase ||
        !hasNumber ||
        !hasSpecial ||
        !hasLength)
    ) {
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
    setIsLoading(true);
    try {
      const registerData = {
        username: regUsername,
        fullName: fullName,
        email: regEmail,
        password: regPassword,
        phoneNumber: regPhoneNumber,
        address: regAddress,
      };

      await authService.register(registerData);
      setIsLoading(false);
      console.log("Mã OTP được gửi qua email của bạn");
      setRegStep(3); // Chuyển sang trang "RegisterSuccessStep"
      setRegErrors({});
    } catch (error) {
      setIsLoading(false);
      console.error("Register failed:", error);
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || error.response.data;
        if (errorMessage.includes("Username đã tồn tại")) {
          setRegErrors((prev) => ({
            ...prev,
            username: "Tên đăng nhập này đã tồn tại",
          }));
        } else if (errorMessage.includes(" tồn tại")) {
          setRegErrors((prev) => ({ ...prev, email: "Email này đã tồn tại" }));
        } else {
          alert(`Đăng ký thất bại: ${errorMessage}`);
        }
      } else {
        alert("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
      }
    }
  };

  const handleRegisterSuccessDone = () => {
    console.log("Đăng kí thành công, Vui lòng đăng nhập lại");
    switchToLogin();
  };

  return {
    tab,
    loginStep,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginErrors,
    regStep,
    regUsername,
    setRegUsername,
    fullName,
    setFullName,
    regEmail,
    setRegEmail,
    regPassword,
    setRegPassword,
    regConfirm,
    setRegConfirm,
    regPhoneNumber,
    setRegPhoneNumber,
    regAddress,
    setRegAddress,
    acceptTerms,
    setAcceptTerms,
    regErrors,
    termsViewed,
    setTermsViewed,
    handleLoginFieldFocus,
    handleRegFieldFocus,
    handleSocialLogin,
    switchToLogin,
    switchToRegister,
    switchToForgotPassword,
    handleLoginInfoSubmit,
    handleRegisterInfoNext,
    handleRegisterSuccessDone,
    isLoading,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    forgotPasswordStep,
    setForgotPasswordStep,
    handleForgotPasswordSubmit,
    handleForgotPasswordDone
    
  };
};
