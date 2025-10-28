import React, { useState, useRef, useEffect } from 'react';
import styles from './OtpStep.module.css';

//~ Component nhận props email, onBack, onConfirm từ AuthPage
export default function LoginOtpStep({ email, onBack, onConfirm }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef([]); // Ref để quản lý focus giữa các input

  //~ Focus vào input đầu tiên khi component được mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  //~ Xử lý khi thay đổi giá trị input OTP
  const handleChange = (index, value) => {
    // Chỉ cho phép nhập số hoặc xóa
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    //~ Tự động chuyển focus sang ô tiếp theo nếu nhập số
    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  //~ Xử lý khi nhấn Backspace hoặc Delete
  const handleKeyDown = (index, event) => {
    if ((event.key === 'Backspace' || event.key === 'Delete') && !otp[index] && index > 0) {
      // Nếu ô hiện tại trống và nhấn Backspace/Delete, focus ô trước đó
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    } else if (event.key === 'Enter') {
      handleConfirm(); // Xác nhận khi nhấn Enter
    }
  };

  //~ Xử lý khi dán mã OTP
  const handlePaste = (event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const otpChars = pastedData.replace(/\D/g, '').slice(0, otp.length); // Lấy số và giới hạn độ dài

    if (otpChars) {
      const newOtp = [...otp];
      for (let i = 0; i < otp.length; i++) {
        newOtp[i] = otpChars[i] || ''; // Điền vào các ô
      }
      setOtp(newOtp);
      // Focus vào ô cuối cùng có dữ liệu hoặc ô cuối cùng nếu đủ 6 số
      const focusIndex = Math.min(otpChars.length, otp.length - 1);
      inputsRef.current[focusIndex]?.focus();
    }
  };


  //~ Xử lý xác nhận OTP
  const handleConfirm = () => {
    const code = otp.join('');
    if (code.length !== otp.length) {
      alert(`Vui lòng nhập đầy đủ ${otp.length} chữ số OTP!`);
      // Focus vào ô trống đầu tiên
      const firstEmptyIndex = otp.findIndex(val => !val);
      if (firstEmptyIndex !== -1) {
         inputsRef.current[firstEmptyIndex]?.focus();
      } else {
         inputsRef.current[0]?.focus();
      }
      return;
    }
    // TODO: Thêm logic xác thực OTP với backend ở đây
    console.log('OTP submitted:', code);
    onConfirm(); // Gọi hàm onConfirm được truyền từ AuthPage
  };

  return (
    <div>
      <div className={styles.otpContainer}>
        <div className={styles.otpInfo}>
          {/* Material Icons cần được import global */}
          <span className="material-icons">mail_outline</span>
          <p className={styles.otpInfoText}>Mã xác thực đã được gửi đến</p>
          <p className={styles.otpEmail}>{email || 'your.email@example.com'}</p> {/* Hiển thị email */}
        </div>

        <label className={styles.otpLabel} htmlFor="otp-input-0"> {/* Liên kết với input đầu tiên */}
          Nhập mã OTP ({otp.length} chữ số)
        </label>
        <div className={styles.otpInputs} onPaste={handlePaste}>
          {otp.map((value, index) => (
            <input
              key={index}
              id={`otp-input-${index}`} // Thêm id cho mỗi input
              type="tel" // Dùng type="tel" để hiện bàn phím số trên mobile
              inputMode="numeric" // Gợi ý bàn phím số
              autoComplete="one-time-code" // Gợi ý tự động điền OTP
              className={styles.otpInput}
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => (inputsRef.current[index] = el)} // Gán ref cho từng input
              aria-label={`OTP digit ${index + 1}`} // Thêm aria-label
            />
          ))}
        </div>

        <p className={styles.otpResend}>
          Không nhận được mã?{' '}
          {/* Class "link" lấy từ global */}
          <a href="#" className="link" onClick={(e) => e.preventDefault()}>
            Gửi lại (60s)
          </a>
        </p>
      </div>

      <div className={styles.buttonGroup}>
        <button type="button" className={styles.btnSecondary} onClick={onBack}>
          Quay lại
        </button>
        <button type="button" className={styles.btnPrimary} onClick={handleConfirm}>
          ĐĂNG NHẬP
        </button>
      </div>
    </div>
  );
}