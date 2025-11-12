import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthCard from '../features/auth/components/AuthCard';
import LogoHeader from '../features/auth/components/LogoHeader';
import LoginFormInfo from '../features/auth/components/LoginFormInfo';
import OtpStep from '../features/auth/components/OtpStep';
import RegisterFormInfo from '../features/auth/components/RegisterFormInfo';
import RegisterSuccessStep from '../features/auth/components/RegisterSuccessStep';
import styles from './AuthPage.module.css';

import formStyles from '../features/auth/components/formStyles.module.css';
import { useAuthForm } from '../features/auth/hooks/useAuthForm';
export default function AuthPage() {
    const {
        tab,
        loginStep,
        loginEmail,
        setLoginEmail,
        loginPassword,
        setLoginPassword,
        loginErrors,
        regStep,
        regUsername,
        setRegUsername,
        fullName,
        setFullName,
        regEmail,
        setRegEmail,
        regPassword,
        setRegPassword,
        regConfirm,
        setRegConfirm,
        regPhoneNumber,
        setRegPhoneNumber, // (Đổi tên từ setPhone)
        regAddress,
        setRegAddress, // (Đổi tên từ setAddress)
        acceptTerms,
        setAcceptTerms,
        regErrors,
        termsViewed,
        setTermsViewed,
        handleLoginFieldFocus,
        handleRegFieldFocus,
        handleSocialLogin,
        switchToLogin,
        switchToRegister,
        handleLoginInfoSubmit,
        handleRegisterInfoNext,
        handleRegisterOtpConfirm,
        handleRegisterSuccessDone
    } = useAuthForm();
    // Logic showTabs giữ nguyên
    const showTabs = (tab === 'login' && loginStep === 1) || (tab === 'register' && regStep === 1);

    return (
        <AuthCard>
            <LogoHeader />

            {/* Chỉ hiển thị nút tab khi showTabs là true */}
            {showTabs && (
                <div className={styles.tabButtons}>
                    <button
                        className={`${styles.tabBtn} ${tab === 'login' ? styles.tabBtnActive : styles.tabBtnInactive}`}
                        onClick={switchToLogin}
                        disabled={tab === 'login'}
                    >
                        Đăng nhập
                    </button>
                    <button
                        className={`${styles.tabBtn} ${tab === 'register' ? styles.tabBtnActive : styles.tabBtnInactive}`}
                        onClick={switchToRegister}
                        disabled={tab === 'register'}
                    >
                        Đăng ký
                    </button>
                </div>
            )}

            {/* Nội dung thay đổi theo tab và bước */}
            {tab === 'login' ? (
                <LoginFormInfo
                    email={loginEmail}
                    password={loginPassword}
                    onChangeEmail={setLoginEmail}
                    onChangePassword={setLoginPassword}
                    onSubmit={handleLoginInfoSubmit}
                    onSocial={handleSocialLogin}
                    switchToRegister={switchToRegister}
                    errors={loginErrors}
                    onFieldFocus={handleLoginFieldFocus}
                />
            ) : (
                <>
                    {regStep === 1 && (
                        <RegisterFormInfo
                            errors={regErrors}
                            termsViewed={termsViewed}
                            onTermsClick={() => setTermsViewed(true)}

                            username={regUsername}
                            setUsername={setRegUsername}

                            phoneNumber={regPhoneNumber}
                            setPhone={setRegPhoneNumber}

                            address={regAddress}
                            setAddress={setRegAddress}

                            fullName={fullName}
                            setFullName={setFullName}

                            email={regEmail}
                            setEmail={setRegEmail}

                            password={regPassword}
                            setPassword={setRegPassword}

                            confirm={regConfirm}
                            setConfirm={setRegConfirm}

                            accept={acceptTerms}
                            setAccept={setAcceptTerms}

                            onNext={handleRegisterInfoNext}
                            onSocial={handleSocialLogin}

                            onFieldFocus={handleRegFieldFocus}
                        />
                    )}
                    {regStep === 2 && (
                        <OtpStep
                            email={regEmail}
                            onBack={() => { setRegStep(1); setRegErrors({}); }} // Xóa lỗi khi back
                            onConfirm={handleRegisterOtpConfirm}
                            confirmButtonText="XÁC NHẬN"
                        />
                    )}
                    {regStep === 3 && (
                        <RegisterSuccessStep
                            onDone={handleRegisterSuccessDone} // Đảm bảo gọi đúng hàm
                        />
                    )}
                    {/* Link "Đăng nhập" chỉ hiện ở bước 1 */}
                    {regStep === 1 && (
                        <p className={formStyles.textCenter} style={{ marginTop: '0.5rem' }}>
                            Đã có tài khoản?{' '}
                            <a href="#" className="link" onClick={(e) => { e.preventDefault(); switchToLogin(); }}>
                                Đăng nhập
                            </a>
                        </p>
                    )}
                </>
            )}
        </AuthCard>
    );
}