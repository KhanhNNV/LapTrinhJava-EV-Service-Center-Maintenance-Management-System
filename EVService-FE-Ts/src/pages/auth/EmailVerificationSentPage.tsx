// import { Zap, CheckCircle, Mail, RefreshCw } from "lucide-react";
// import { Link } from "react-router-dom";

// export default function EmailVerificationSentPage({
//   email,
// }: {
//   email: string;
// }) {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center gap-2 font-bold text-2xl mb-2">
//             <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
//               <Zap className="w-7 h-7 text-primary-foreground" />
//             </div>
//             <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//               EV Service
//             </span>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
//           <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />

//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               Kiểm tra email của bạn
//             </h1>
//             <p className="text-gray-600 mt-2">
//               Chúng tôi đã gửi liên kết xác thực đến
//             </p>
//             <p className="font-semibold text-blue-600">{email}</p>
//           </div>

//           <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
//             <p className="flex items-center justify-center gap-2">
//               <Mail className="w-4 h-4" />
//               Vui lòng kiểm tra hộp thư (và mục <strong>Spam</strong> nếu cần)
//             </p>
//           </div>

//           <div className="flex flex-col gap-3">
//             <button
//               onClick={() => window.open("https://mail.google.com", "_blank")}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
//             >
//               <Mail className="w-5 h-5" />
//               Mở Gmail
//             </button>

//             <Link
//               to="/auth/resend-verification"
//               className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1"
//             >
//               <RefreshCw className="w-4 h-4" />
//               Gửi lại email xác thực
//             </Link>
//           </div>

//           <p className="text-xs text-gray-500">
//             © 2025 EV Service. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/auth/EmailVerificationSentPage.tsx
import { useState } from "react";
import { CheckCircle, Mail, RefreshCw, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/services/api.ts";

interface LocationState {
  email: string;
}

export default function EmailVerificationSentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as LocationState)?.email || "email của bạn";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/resend-verification", { email });
      setMessage(res.data.message || "Đã gửi lại email xác thực!");
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Không thể gửi lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              Lightning
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">
              Kiểm tra email của bạn
            </h1>
            <p className="text-gray-600 mt-2">
              Chúng tôi đã gửi liên kết xác thực đến
            </p>
            <p className="font-semibold text-blue-600 break-all">{email}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 text-center">
            <p className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Kiểm tra hộp thư và mục <strong>Spam/Promotions</strong>
            </p>
          </div>

          {/* NÚT GỬI LẠI - KHÔNG CẦN FORM */}
          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Gửi lại email xác thực
              </>
            )}
          </button>

          {/* THÔNG BÁO */}
          {message && (
            <p
              className={`text-center text-sm font-medium ${
                message.includes("Đã gửi") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <button
            onClick={() => window.open("https://mail.google.com", "_blank")}
            className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Mở Gmail
          </button>

          <p className="text-center text-xs text-gray-500">
            © 2025 EV Service. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
