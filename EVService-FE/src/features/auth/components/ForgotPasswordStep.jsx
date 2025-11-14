import React from 'react';
import styles from './ForgotPasswordStep.module.css';

export default function ForgotPasswordStep({ onDone }) {
  return (
    <div className={styles.successContent}>
      <div className={styles.successIcon}>
        <span className="material-icons">mark_email_read</span>
      </div>
      <h2 className={styles.successTitle}>Kiểm tra Email của bạn!</h2>
      <p className={styles.successText}>
        Chúng tôi đã gửi một đường link đặt lại mật khẩu đến email của bạn.
        Vui lòng kiểm tra hộp thư và nhấp vào link để tạo mật khẩu mới.
      </p>
      <button
        type="button"
        className={styles.btnPrimary}
        onClick={onDone}
      >
        ĐÃ HIỂU
      </button>
    </div>
  );
}