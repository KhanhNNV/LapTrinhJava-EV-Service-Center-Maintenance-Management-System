import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/services/auth/api";

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [tokenValid, setTokenValid] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password !== confirm) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      navigate("/auth/reset-password-success");
    } catch (error) {
      console.error(error);
      setTokenValid(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-xl font-semibold mb-2">Liên kết không hợp lệ</h1>
        <p className="text-muted-foreground mb-4">
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
        </p>
        <button
          className="px-4 py-2 rounded bg-primary text-primary-foreground"
          onClick={() => navigate("/auth/forgot-password")}
        >
          Gửi yêu cầu mới
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-card shadow p-6 rounded-lg space-y-4"
      >
        <h1 className="text-2xl font-semibold">Đặt lại mật khẩu</h1>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="Nhập lại mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2 rounded bg-primary text-primary-foreground"
        >
          {submitting ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
