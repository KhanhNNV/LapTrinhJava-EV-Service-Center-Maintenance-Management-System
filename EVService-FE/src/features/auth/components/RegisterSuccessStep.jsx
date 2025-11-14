import React from 'react';
import styles from './RegisterSuccessStep.module.css';

// export default function RegisterSuccessStep({ onDone }) {
//   return (
//     <div className={styles.successContent}>
//       <div className={styles.successIcon}>
//         <span className="material-icons">check</span>
//       </div>
//       <h2 className={styles.successTitle}>Đăng ký thành công!</h2>
//       <p className={styles.successText}>
//         Tài khoản của bạn đã được tạo và kích hoạt thành công.
//       </p>
//       <button
//         type="button"
//         className={styles.btnPrimary}
//         onClick={onDone}
//       >
//         BẮT ĐẦU SỬ DỤNG
//       </button>
//     </div>
//   );
// }

export default function RegisterSuccessStep({ onDone }) {
  return (
    <div className={styles.successContent}>
      <div className={styles.successIcon}>
        <span className="material-icons">mark_email_read</span> {/* Thay icon */}
      </div>
      <h2 className={styles.successTitle}>Xác thực Email của bạn!</h2>
      <p className={styles.successText}>
        Chúng tôi đã gửi một đường link xác thực đến email của bạn.
        Vui lòng kiểm tra hộp thư và nhấp vào link để hoàn tất đăng ký.
      </p>
      <button
        type="button"
        className={styles.btnPrimary}
        onClick={onDone} // onDone sẽ gọi switchToLogin()
      >
        ĐÃ HIỂU
      </button>
    </div>
  );
}