import React, { useState, useMemo } from 'react';
import GoogleIcon from '../../../components/Icons/GoogleIcon'; //
import FacebookIcon from '../../../components/Icons/FacebookIcon'; //
import GithubIcon from '../../../components/Icons/GithubIcon'; //
// Import cả hai file CSS
import formStyles from './formStyles.module.css'; //
import styles from './RegisterFormInfo.module.css'; // File riêng

export default function RegisterFormInfo({
  fullName, email, password, confirm, accept,
  setFullName, setEmail, setPassword, setConfirm, setAccept,
  onNext, onSocial, switchToLogin
}) {
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) return { label: '', className: '', barClassName: '' };
    // Sử dụng styles từ file riêng
    if (password.length < 6) return { label: 'Yếu', className: styles.strengthTextWeak, barClassName: styles.strengthBarWeak };
    if (password.length < 10) return { label: 'Trung bình', className: styles.strengthTextMedium, barClassName: styles.strengthBarMedium };
    return { label: 'Mạnh', className: styles.strengthTextStrong, barClassName: styles.strengthBarStrong };
  }, [password]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onNext();
    }
  };

  return (
    <div>
      {/* Sử dụng class từ formStyles */}
      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="reg-fullname">Họ và tên</label>
        <input
          id="reg-fullname"
          className={formStyles.formInput}
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          className={formStyles.formInput}
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="reg-password">Mật khẩu</label>
        <div className={formStyles.inputWrapper}>
          <input
            id="reg-password"
            type={showPwd ? 'text' : 'password'}
            className={formStyles.formInput}
            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
             type="button"
             className={formStyles.togglePassword}
             onClick={() => setShowPwd((s) => !s)}
             aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            <span className="material-icons">{showPwd ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
        {/* Sử dụng class từ styles (riêng) */}
        {password && (
          <div className={styles.passwordStrength}>
            <div className={styles.strengthContainer}>
              <div className={styles.strengthBarBg}>
                <div className={`${styles.strengthBar} ${passwordStrength.barClassName}`}></div>
              </div>
              <span className={`${styles.strengthText} ${passwordStrength.className}`}>
                {passwordStrength.label}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className={formStyles.formGroup}>
         <label className={formStyles.formLabel} htmlFor="reg-confirm">Nhập lại mật khẩu</label>
        <div className={formStyles.inputWrapper}>
           <input
             id="reg-confirm"
             type={showPwd2 ? 'text' : 'password'}
             className={formStyles.formInput}
             placeholder="Nhập lại mật khẩu"
             value={confirm}
             onChange={(e) => setConfirm(e.target.value)}
             onKeyDown={handleKeyDown}
           />
          <button
             type="button"
             className={formStyles.togglePassword}
             onClick={() => setShowPwd2((s) => !s)}
             aria-label={showPwd2 ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
             <span className="material-icons">{showPwd2 ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>
        {/* Sử dụng class từ styles (riêng) */}
        {confirm && password && confirm !== password && (
          <p className={styles.errorText}>Mật khẩu không khớp</p>
        )}
      </div>

       {/* Dùng formStyles và inline style */}
      <div className={formStyles.checkboxWrapper} style={{ marginBottom: '1.5rem' }}>
        <input
          type="checkbox"
          id="acceptTerms"
          className={formStyles.checkbox}
          checked={accept}
          onChange={(e) => setAccept(e.target.checked)}
        />
        <label htmlFor="acceptTerms" className={formStyles.checkboxLabel}>
          Tôi đồng ý với <a href="#" className="link" onClick={(e) => e.preventDefault()}>Điều khoản dịch vụ</a>
        </label>
      </div>

      <button className={formStyles.btnPrimary} onClick={onNext}>
        TIẾP TỤC
      </button>

      <div className={formStyles.divider}>
        <span className={formStyles.dividerText}>Hoặc đăng ký với</span>
      </div>

      <div className={formStyles.socialButtons}>
         <button className={`${formStyles.socialBtn} ${formStyles.google}`} onClick={() => onSocial('Google')}>
           <GoogleIcon /> Google
         </button>
         <button className={`${formStyles.socialBtn} ${formStyles.facebook}`} onClick={() => onSocial('Facebook')}>
           <FacebookIcon /> Facebook
         </button>
         <button className={`${formStyles.socialBtn} ${formStyles.github}`} onClick={() => onSocial('GitHub')}>
           <GithubIcon /> GitHub
         </button>
      </div>

    </div>
  );
}