// src/pages/ForgotPasswordPage.tsx
import { useState } from "react";
import api from "@/services/api.ts";
import { useNavigate } from "react-router-dom";
import EmailSentPage from "./EmailSentPage";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSentPage, setShowSentPage] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setShowSentPage(true); // HIỂN THỊ TRANG "ĐÃ GỬI"
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSending(false);
    }
  };

  // Nếu đã gửi → hiển thị trang thành công
  if (showSentPage) {
    return <EmailSentPage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-card shadow p-6 rounded-lg space-y-4"
      >
        <h1 className="text-2xl font-semibold">Quên mật khẩu</h1>
        <p className="text-muted-foreground text-sm">
          Nhập địa chỉ email của bạn. Chúng tôi sẽ gửi liên kết để đặt lại mật
          khẩu.
        </p>
        <input
          type="email"
          required
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <button
          type="submit"
          disabled={isSending}
          className="w-full px-4 py-2 rounded bg-primary text-primary-foreground"
        >
          {isSending ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
