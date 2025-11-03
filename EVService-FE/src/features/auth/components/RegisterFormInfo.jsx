import React, { useState, useMemo } from "react";
import GoogleIcon from "../../../components/Icons/GoogleIcon";
import FacebookIcon from "../../../components/Icons/FacebookIcon";
import GithubIcon from "../../../components/Icons/GithubIcon";

import formStyles from "./formStyles.module.css";
import styles from "./RegisterFormInfo.module.css";

export default function RegisterFormInfo({
  username,
  fullName,
  email,
  password,
  confirm,
  phoneNumber,
  address,
  accept,
  setUsername,
  setFullName,
  setEmail,
  setPassword,
  setConfirm,
  setAccept,
  setPhone,
  setAddress,
  onNext,
  onSocial,
  errors = {},
  termsViewed, 
  onTermsClick,
  onFieldFocus,
}) {
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);



//. Hàm kiểm tra mật khẩu
const passwordStrength = useMemo(() => {
  //~Nếu chưa có mật khẩu -> object rỗng không hiển thị gì
  if (!password)
    return {
      label: "",
      className: "",
      barClassName: "",
      score: 0,
      requirements: [],
    };

  //---------Kiểm tra các yếu tố của mật khẩu---------------
  const hasUppercase = /[A-Z]/.test(password);//~Có chứa chữ in hoa k
  const hasLowercase = /[a-z]/.test(password);//~Có chứa chữ thường k
  const hasNumber = /[0-9]/.test(password);//~ Có chứa chữ số k
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);//~Có chứ ký tự đặt biệt k
  const hasLength = password.length >= 8; 
  //---------Danh sách gợi ý cho người dùng nếu mật khẩu chưa đủ mạnh-----------------
  const requirements = [
      { text: "Tối thiểu nhất 8 ký tự", met: hasLength },
      { text: "Có chữ in hoa (A-Z)", met: hasUppercase },
      { text: "Có chữ thường (a-z)", met: hasLowercase },
      { text: "Có chữ số (0-9)", met: hasNumber },
      { text: "Có ký tự đặc biệt (!@#...)", met: hasSpecial },
    ];

  //--------Tính điểm mật khẩu---------------------
  let score = 0;
  if (password.length >= 8) score++ 
  else score--;
  if (hasUppercase ) score++;
  if (hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
//-----------Phân loại mức độ----------------------
  if (score <= 1)
    return {
      label: "Yếu",
      className: styles.strengthTextWeak,
      barClassName: styles.strengthBarWeak,
      score,
      requirements,
    };

  if (score === 2)
    return {
      label: "Trung bình",
      className: styles.strengthTextMedium,
      barClassName: styles.strengthBarMedium,
      score,
      requirements,
    };
  if (score === 3)
    return {
      label: "Mạnh",
      className: styles.strengthTextStrong,
      barClassName: styles.strengthBarStrong,
      score,
      requirements,
    };
  return {
    label: "Rất Mạnh",
    className: styles.strengthTextVeryStrong,
      barClassName: styles.strengthBarVeryStrong,
      score,
      requirements,
  };
}, [password]);


//.Hàm xữ lý ENTER
const handleKeyDown = (event) => {
  if (event.key === "Enter") {
    onNext();
  }
};

//. Hàm xử lý chỉ cho nhập số
const handlePhoneChange = (e) => {
  const value = e.target.value.replace(/[^0-9]/g, ""); //~ chỉ giữ số
  setPhone(value); 
};


  return (  
    <div>
        {/*USERNAME*/}
      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="reg-fullname">
          Tên đăng nhập
        </label>
        <input
          id="reg-username"
          className={`${formStyles.formInput} ${
            errors.username ? formStyles.formInputError : ''
          }`}
          placeholder="NguyenVanA"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => onFieldFocus('username')}
        />
        {/*Hiển thị lỗi */}
        {errors.username && (
          <p className={formStyles.formErrorText}>{errors.username}</p>
        )}
      </div>


      {/*FULLNAME*/}
      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="reg-fullname">
          Họ và tên
        </label>
        <input
          id="reg-fullname"
          className={formStyles.formInput}
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/*EMAIL*/}
      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="reg-email">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          className={`${formStyles.formInput} ${
            errors.email ? formStyles.formInputError : ''
          }`}
          placeholder="nguyenvana@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => onFieldFocus('email')}
        />
        {/* Hiển thị lỗi */}
        {errors.email && (
          <p className={formStyles.formErrorText}>{errors.email}</p>
        )}
      </div>

      {/*SỐ ĐIỆN THOẠI*/}
      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="reg-phone">
          Số điện thoại
        </label>
        <input
          id="reg-phone"
          type="tel"
          className={`${formStyles.formInput} ${
            errors.phoneNumber ? formStyles.formInputError : ''
          }`}
          placeholder="0123456789"
          value={phoneNumber}
          onChange = {handlePhoneChange}
          onKeyDown={handleKeyDown}
          onFocus={() => onFieldFocus('phoneNumber')}
        />
       {/* Hiển thị lỗi */}
        {errors.phoneNumber && (
          <p className={formStyles.formErrorText}>{errors.phoneNumber}</p>
        )}
      </div>

      {/*ĐỊA CHỈ*/}
      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="reg-address">
          Địa chỉ
        </label>
        <input
          id="reg-address"
          className={formStyles.formInput}
          placeholder="123 Đường ABC, Phường X, Quận Y, Tỉnh Z, TP.V"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/*PASSWORD*/}
      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="reg-password">
          Mật khẩu
        </label>
        <div className={formStyles.inputWrapper}>
          <input
            id="reg-password"
            type={showPwd ? "text" : "password"}
            className={`${formStyles.formInput} ${
              errors.password ? formStyles.formInputError : ''
            }`}
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => onFieldFocus('password')}
          />
          
          <button
            type="button"
            className={formStyles.togglePassword}
            onClick={() => setShowPwd((s) => !s)}
            aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            <span className="material-icons">
              {showPwd ? "visibility" : "visibility_off"}
            </span>
          </button>
        </div>


        {/*THANH MỨC ĐỘ MẬT KHẨU*/}
        {password && (
          <div className={styles.passwordStrength}>
            <div className={styles.strengthContainer}>
              <div className={styles.strengthBarBg}>
                <div
                  className={`${styles.strengthBar} ${passwordStrength.barClassName}`}
                ></div>
              </div>
              <span
                className={`${styles.strengthText} ${passwordStrength.className}`}
              >
                {passwordStrength.label}
              </span>
            </div>

          {/*Thêm danh sách yêu cầu */}
            <div className={styles.requirementList}>
              {passwordStrength.requirements.map((req, index) => (
                <div
                  key={index}
                  className={`${styles.requirementItem} ${
                    req.met
                      ? styles.requirementMet
                      : styles.requirementNotMet
                  }`}
                >
                  <span className={styles.requirementIcon}>
                    {req.met ? "✓" : "✗"}
                  </span>
                  <span className={styles.requirementText}>{req.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hiển thị lỗi */}
        {errors.password && (
          <p className={formStyles.formErrorText}>{errors.password}</p>
        )}
      </div>

        {/*NHẬP LẠI MẬT KHẨU*/}
      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="reg-confirm">
          Nhập lại mật khẩu
        </label>
        <div className={formStyles.inputWrapper}>
          <input
            id="reg-confirm"
            type={showPwd2 ? "text" : "password"}
            className={`${formStyles.formInput} ${
              errors.confirm ? formStyles.formInputError : ''
            }`}
            placeholder="Nhập lại mật khẩu"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => onFieldFocus('confirm')}
        
          />
          <button
            type="button"
            className={formStyles.togglePassword}
            onClick={() => setShowPwd2((s) => !s)}
            aria-label={showPwd2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            <span className="material-icons">
              {showPwd2 ? "visibility" : "visibility_off"}
            </span>
          </button>
        </div>

        {/* Hiển thị lỗi từ state */}
        {errors.confirm ? (
            <p className={formStyles.formErrorText}>{errors.confirm}</p>
        ) : (
            confirm && password && confirm !== password && (
                <p className={formStyles.formErrorText}>Mật khẩu không khớp</p>
            )
        )}
      </div>
      
      {/*Ô CHECK BOX TÔI ĐỒNG Ý VỚI ĐIỀU KHOẢN*/}
      <div
        className={formStyles.checkboxWrapper}
        style={{ margin: "1rem .5rem 1rem " }}
      >
        <input
          type="checkbox"
          id="acceptTerms"
          className={formStyles.checkbox}
          checked={accept}
          onChange={(e) => setAccept(e.target.checked)}
          onClick={() => onFieldFocus('acceptTerms')}
        />
        <label htmlFor="acceptTerms" className={formStyles.checkboxLabel}>
          Tôi đồng ý với{" "}
          <a href="https://m.yodycdn.com/blog/anh-troll-nguoi-yeu-yodyvn33.jpg" className="link" target = "_blank" rel="noopener noreferrer" onClick={onTermsClick}>
            Điều khoản dịch vụ
          </a>
        </label>

        {/* Hiển thị lỗi điều khoản */}
        {errors.acceptTerms && (
          <p className={formStyles.formErrorText} style={{ marginTop:"0"}}>
              {errors.acceptTerms}
          </p>
        )}
      </div>

      <button className={formStyles.btnPrimary} onClick={onNext}>
        TIẾP TỤC
      </button>



        {/*Social buttons*/}
      <div className={formStyles.divider}>
        <span className={formStyles.dividerText}>Hoặc đăng ký với</span>
      </div>

      <div className={formStyles.socialButtons}>
        <button
          className={`${formStyles.socialBtn} ${formStyles.google}`}
          onClick={() => onSocial("Google")}
        >
          <GoogleIcon /> Google
        </button>
        <button
          className={`${formStyles.socialBtn} ${formStyles.facebook}`}
          onClick={() => onSocial("Facebook")}
        >
          <FacebookIcon /> Facebook
        </button>
        <button
          className={`${formStyles.socialBtn} ${formStyles.github}`}
          onClick={() => onSocial("GitHub")}
        >
          <GithubIcon /> GitHub
        </button>
      </div>
    </div>
  );
}
