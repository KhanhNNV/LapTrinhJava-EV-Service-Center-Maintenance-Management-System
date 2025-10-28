import styles from './LogoHeader.module.css'
import logoPath from '../../../assets/Logo.png'; 

export default function LogoHeader() {
  return (
    <div className={styles.logoSection}>
      <div className={styles.logoCircle}>
        <img src={logoPath} 
        alt="EV Service Center Logo" 
        className={styles.logoImage}/> 
      </div>
      <h1 className={styles.authTitle}>EV Service Center</h1>
      <p className={styles.authSubtitle}>Hệ thống Quản lý Bảo dưỡng Xe điện</p>
    </div>
  );
}