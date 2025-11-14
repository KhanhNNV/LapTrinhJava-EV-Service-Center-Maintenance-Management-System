import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthCard from "../features/auth/components/AuthCard";
import LogoHeader from "../features/auth/components/LogoHeader";
import LoginFormInfo from "../features/auth/components/LoginFormInfo";
import RegisterFormInfo from "../features/auth/components/RegisterFormInfo";
import RegisterSuccessStep from "../features/auth/components/RegisterSuccessStep";
import ForgotPasswordForm from "../features/auth/components/ForgotPasswordForm"; // THÊM
import ForgotPasswordStep from "../features/auth/components/ForgotPasswordStep"; // THÊM
import styles from "./AuthPage.module.css";

import formStyles from "../features/auth/components/formStyles.module.css";
import { useAuthForm } from "../features/auth/hooks/useAuthForm";

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
    setRegPhoneNumber,
    regAddress,
    setRegAddress,
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
    handleRegisterSuccessDone,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    forgotPasswordStep,
    setForgotPasswordStep,
    handleForgotPasswordSubmit,
    handleForgotPasswordDone,
    switchToForgotPassword,
  } = useAuthForm();

  const showTabs =
    (tab === "login" && loginStep === 1) ||
    (tab === "register" && regStep === 1) ||
    (tab === "forgot" && forgotPasswordStep === 1);

  return (
    <AuthCard>
      <LogoHeader />

      {/* Chỉ hiển thị nút tab khi showTabs là true */}
      {showTabs && (
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tabBtn} ${
              tab === "login" ? styles.tabBtnActive : styles.tabBtnInactive
            }`}
            onClick={switchToLogin}
            disabled={tab === "login"}
          >
            Đăng nhập
          </button>
          <button
            className={`${styles.tabBtn} ${
              tab === "register" ? styles.tabBtnActive : styles.tabBtnInactive
            }`}
            onClick={switchToRegister}
            disabled={tab === "register"}
          >
            Đăng ký
          </button>
        </div>
      )}

      {/* Nội dung thay đổi theo tab và bước */}
      {tab === "login" ? (
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
          onForgotPassword={switchToForgotPassword} // THÊM PROP NÀY
        />
      ) : tab === "register" ? (
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
          {regStep === 3 && (
            <RegisterSuccessStep onDone={handleRegisterSuccessDone} />
          )}
          {regStep === 1 && (
            <p
              className={formStyles.textCenter}
              style={{ marginTop: "0.5rem" }}
            >
              Đã có tài khoản?{" "}
              <a
                href="#"
                className="link"
                onClick={(e) => {
                  e.preventDefault();
                  switchToLogin();
                }}
              >
                Đăng nhập
              </a>
            </p>
          )}
        </>
      ) : (
        // LUỒNG QUÊN MẬT KHẨU
        <>
          {forgotPasswordStep === 1 && (
            <ForgotPasswordForm
              email={forgotPasswordEmail}
              onChangeEmail={setForgotPasswordEmail}
              onSubmit={handleForgotPasswordSubmit}
              errors={loginErrors} // Có thể dùng chung errors với login
              onFieldFocus={handleLoginFieldFocus}
              onBackToLogin={switchToLogin}
            />
          )}
          {forgotPasswordStep === 2 && (
            <ForgotPasswordStep onDone={handleForgotPasswordDone} />
          )}
        </>
      )}
    </AuthCard>
  );
}
