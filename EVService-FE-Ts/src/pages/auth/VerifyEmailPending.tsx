import { useSearchParams } from "react-router-dom";

const VerifyEmailPending: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold mb-2">Xác nhận email của bạn</h1>
      <p className="text-muted-foreground max-w-md">
        Chúng tôi đã gửi một email xác nhận tới{" "}
        <span className="font-semibold">{email ?? "địa chỉ email của bạn"}</span>.
        Vui lòng mở email và nhấp vào đường link để hoàn tất xác thực tài khoản.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Sau khi xác thực, bạn có thể quay lại trang này và đăng nhập.
      </p>
    </div>
  );
};

export default VerifyEmailPending;
