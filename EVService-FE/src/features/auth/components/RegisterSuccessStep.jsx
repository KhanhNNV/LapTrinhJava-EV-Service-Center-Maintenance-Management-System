import React from 'react';
import styles from './RegisterSuccessStep.module.css';

export default function RegisterSuccessStep({ onDone }) {
  return (
    <div className={styles.successContent}>
      <div className={styles.successIcon}>
        <span className="material-icons">check</span>
      </div>
      <h2 className={styles.successTitle}>Đăng ký thành công!</h2>
      <p className={styles.successText}>
        Tài khoản của bạn đã được tạo và kích hoạt thành công.
      </p>
      <button
        type="button"
        className={styles.btnPrimary}
        onClick={onDone}
      >
        BẮT ĐẦU SỬ DỤNG
      </button>
    </div>
  );
}