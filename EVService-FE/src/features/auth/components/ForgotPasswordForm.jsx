import React from 'react';
import formStyles from './formStyles.module.css';

export default function ForgotPasswordForm({
  email,
  onChangeEmail,
  onSubmit,
  errors = {},
  onFieldFocus,
  onBackToLogin,
  isLoading = false,
}) {

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

      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="forgot-email">
          Email
        </label>
        <input
          id="forgot-email"
          className={`${formStyles.formInput} ${
            errors.email || errors.general ? formStyles.formInputError : ''
          }`}
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => onFieldFocus('email')}
        />
        {errors.email && (
          <p className={formStyles.formErrorText}>{errors.email}</p>
        )}
      </div>

      {isLoading ? (
          <div className={formStyles.loaderContainer}>
            <div className={formStyles.loader}></div>
          </div>
        ) : (
          <button className={formStyles.btnPrimary} onClick={onSubmit}>
            GỬI LIÊN KẾT ĐẶT LẠI
          </button>
        )}

      <p className={formStyles.textCenter} style={{ marginTop: '1rem' }}>
        <a
          href="#"
          className="link"
          onClick={(e) => { e.preventDefault(); onBackToLogin(); }}
        >
          ← Quay lại đăng nhập
        </a>
      </p>
    </div>
  );
}