import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/services/auth/api";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "ERROR">(
    "LOADING"
  );

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("ERROR");
      return;
    }

    const verify = async () => {
      try {
        await api.post("/auth/verify-email", { token });
        setStatus("SUCCESS");
      } catch (error) {
        console.error(error);
        setStatus("ERROR");
      }
    };

    verify();
  }, [searchParams]);

  if (status === "LOADING") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang xác thực email của bạn...</p>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-xl font-semibold mb-2">Xác thực thất bại</h1>
        <p className="text-muted-foreground mb-4">
          Liên kết xác thực không hợp lệ hoặc đã hết hạn.
        </p>
        <button
          className="px-4 py-2 rounded bg-primary text-primary-foreground"
          onClick={() => navigate("/login")}
        >
          Quay lại đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-xl font-semibold mb-2">Xác thực thành công!</h1>
      <p className="text-muted-foreground mb-4">
        Email của bạn đã được xác nhận. Bạn có thể đăng nhập ngay bây giờ.
      </p>
      <button
        className="px-4 py-2 rounded bg-primary text-primary-foreground"
        onClick={() => navigate("/login")}
      >
        Đến trang đăng nhập
      </button>
    </div>
  );
};

export default VerifyEmailPage;
