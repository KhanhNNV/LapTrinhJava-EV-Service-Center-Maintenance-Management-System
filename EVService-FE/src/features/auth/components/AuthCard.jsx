import React from 'react'
import styles from './AuthCard.module.css'

export default function AuthCard({ children }) {
    return (
    <div className={styles.gradientBg}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authContent}>
            {children}
          </div>
        </div>
      </div>
    </div>
    );
}