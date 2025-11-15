// import { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import api from "@/services/auth/api";
// import { Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

// const ResetPasswordPage: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [password, setPassword] = useState("");
//   const [confirm, setConfirm] = useState("");
//   const [tokenValid, setTokenValid] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const token = searchParams.get("token");

//   useEffect(() => {
//     if (!token) {
//       setTokenValid(false);
//     }
//   }, [token]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!token) return;
//     if (password !== confirm) {
//       alert("Mật khẩu xác nhận không khớp");
//       return;
//     }
//     if (password.length < 8) {
//       alert("Mật khẩu phải có ít nhất 8 ký tự!");
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await api.post("/auth/reset-password", {
//         token,
//         newPassword: password,
//       });
//       // navigate("/login");
//       setTimeout(() => navigate("/login"), 3000);
//     } catch (error) {
//       alert("Có lỗi xảy ra. Vui lòng thử lại.");
//       console.error(error);
//       setTokenValid(false);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (!tokenValid) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center">
//         <h1 className="text-xl font-semibold mb-2">Liên kết không hợp lệ</h1>
//         <p className="text-muted-foreground mb-4">
//           Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
//         </p>
//         <button
//           className="px-4 py-2 rounded bg-primary text-primary-foreground"
//           onClick={() => navigate("/auth/forgot-password")}
//         >
//           Gửi yêu cầu mới
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4">
//       <form
//         onSubmit={handleSubmit}
//         className="max-w-md w-full bg-card shadow p-6 rounded-lg space-y-4"
//       >
//         <h1 className="text-2xl font-semibold">Đặt lại mật khẩu</h1>
//         <input
//           type="password"
//           className="w-full border rounded px-3 py-2"
//           placeholder="Mật khẩu mới"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           className="w-full border rounded px-3 py-2"
//           placeholder="Nhập lại mật khẩu"
//           value={confirm}
//           onChange={(e) => setConfirm(e.target.value)}
//           required
//         />
//         <button
//           type="submit"
//           disabled={submitting}
//           className="w-full px-4 py-2 rounded bg-primary text-primary-foreground"
//         >
//           {submitting ? "Đang xử lý..." : "Xác nhận"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ResetPasswordPage;

// src/pages/auth/ResetPasswordPage.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/services/auth/api";
import { Zap, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"form" | "invalid" | "success">("form");
  const [error, setError] = useState("");

  // Kiểm tra token
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
    }
  }, [token]);

  useEffect(() => {
    validatePassword();
  }, [password, confirm]);

  const validatePassword = () => {
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setStatus("success");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setStatus("invalid");
    } finally {
      setSubmitting(false);
    }
  };

  // Token không hợp lệ
  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Liên kết không hợp lệ
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
          <button
            onClick={() => navigate("/auth/forgot-password")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Gửi yêu cầu mới
          </button>
        </div>
      </div>
    );
  }

  // Thành công
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Đặt lại mật khẩu thành công!
          </h1>
          <p className="text-gray-600 text-sm mb-2">
            Bạn có thể đăng nhập với mật khẩu mới.
          </p>
          <p className="text-xs text-gray-500">Chuyển hướng sau 3 giây...</p>
        </div>
      </div>
    );
  }

  // Form chính – GIỐNG HỆT FORM LOGIN
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-bold text-2xl mb-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EV Service
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Đặt lại mật khẩu
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Nhập mật khẩu mới của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mật khẩu mới */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // validatePassword();
                  }}
                  required
                  minLength={8}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground"
                >
                  {showPass ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    // validatePassword();
                  }}
                  required
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground"
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* LỖI HIỂN THỊ DƯỚI INPUT */}
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !!error}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md"
            >
              {submitting ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Quay lại{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Đăng nhập
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          © 2025 EV Service. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
