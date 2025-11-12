import React, { useState } from 'react';
import GoogleIcon from '../../../components/Icons/GoogleIcon'; //
import GithubIcon from '../../../components/Icons/GithubIcon'; //
import FacebookIcon from '../../../components/Icons/FacebookIcon'; //
// Chỉ import style chung
import formStyles from './formStyles.module.css'; //

export default function LoginFormInfo({
  email,
  password,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  onSocial,
  errors = {},
  onFieldFocus,
  switchToRegister
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div>
      {errors.general && (
        <p
          className={formStyles.formErrorText}
          style={{ textAlign: 'center', marginBottom: '1rem' }}
        >
          {errors.general}
        </p>
      )}
      {/* Sử dụng class từ formStyles */}
      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="login-email">
          Tên đăng nhập/Email
        </label>
        <input
          id="login-email"
          className={`${formStyles.formInput} ${
            errors.email || errors.general ? formStyles.formInputError : ''
          }`}
          placeholder="Nhập Tên đăng nhập/Email"
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => onFieldFocus('email')}
        />
        {errors.email && (
          <p className={formStyles.formErrorText}>{errors.email}</p>
        )}
      </div>

      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="login-password">
          Mật khẩu
        </label>
        <div className={formStyles.inputWrapper}>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            className={`${formStyles.formInput} ${
              errors.password || errors.general ? formStyles.formInputError : ''
            }`}
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => onChangePassword(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => onFieldFocus('password')}
          />
          <button
            type="button"
            className={formStyles.togglePassword}
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {/* Đảm bảo Material Icons đã được import global */}
            <span className="material-icons">{showPassword ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
        {errors.password && (
          <p className={formStyles.formErrorText}>{errors.password}</p>
        )}
      </div>

      {/* Dùng formStyles.rememberForgot nếu bạn đã định nghĩa trong đó, hoặc giữ inline style/class riêng */}
      <div className={formStyles.rememberForgot} >
        <div className={formStyles.checkboxWrapper}>
          <input type="checkbox" className={formStyles.checkbox} id="rememberMe" />
          <label htmlFor="rememberMe" className={formStyles.checkboxLabel}>
            Ghi nhớ đăng nhập
          </label>
        </div>
        <a href="#" className="link" onClick={(e) => e.preventDefault()}>
          Quên mật khẩu?
        </a>
      </div>

      <button className={formStyles.btnPrimary} onClick={onSubmit}>
        TIẾP TỤC
      </button>

      <div className={formStyles.divider}>
        <span className={formStyles.dividerText}>Hoặc đăng nhập với</span>
      </div>


      <div className={formStyles.socialButtons}>
        <button 
          className={`${formStyles.socialBtn} ${formStyles.google}`}
          onClick={() => onSocial('Google')} //Gọi hàm onSocial từ AuthPage
        >
          <GoogleIcon /> Google
        </button>

        <button className={`${formStyles.socialBtn} ${formStyles.facebook}`} onClick={() => onSocial('Facebook')}>
          <FacebookIcon /> Facebook
        </button>
        <button className={`${formStyles.socialBtn} ${formStyles.github}`} onClick={() => onSocial('GitHub')}>
          <GithubIcon /> GitHub
        </button>
      </div>

      <p className={formStyles.textCenter}>
        Chưa có tài khoản?{' '}
        <a
          href="#"
          className="link"
          onClick={(e) => { e.preventDefault(); switchToRegister(); }}
        >
          Đăng ký ngay
        </a>
      </p>
    </div>
  );
}