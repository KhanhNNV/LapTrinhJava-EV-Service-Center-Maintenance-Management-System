import { Link } from "react-router-dom";

export default function EmailSentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon check */}
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Đã gửi email!</h1>
          <p className="text-muted-foreground mt-2">
            Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Vui lòng kiểm tra hộp thư (và mục Spam nếu cần).
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => (window.location.href = "https://mail.google.com")}
            className="w-full px-4 py-2 rounded bg-primary text-primary-foreground font-medium"
          >
            Mở Gmail
          </button>
          <Link to="/login" className="text-sm text-primary hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
