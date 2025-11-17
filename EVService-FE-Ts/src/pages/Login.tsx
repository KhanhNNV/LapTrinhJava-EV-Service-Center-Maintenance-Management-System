import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zap, Loader2, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/auth.ts";
import { toast } from "sonner";

// Nếu bạn đã có sẵn icon riêng cho Google/Facebook/GitHub thì có thể import:
import GoogleIcon from "@/assets/icons/GoogleIcon";
import FacebookIcon from "@/assets/icons/FacebookIcon";
import GithubIcon from "@/assets/icons/GithubIcon";

type LoginErrors = {
  username?: string;
  password?: string;
  general?: string;
};

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<LoginErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // xoá lỗi cũ

    if (!formData.username || !formData.password) {
      setErrors({
        username: !formData.username
          ? "Vui lòng nhập Tên đăng nhập/Email"
          : undefined,
        password: !formData.password ? "Vui lòng nhập Mật khẩu" : undefined,
      });
      return;
    }

    setIsLoading(true);

    try {
      // formData hiện có { username, password, rememberMe }
      await authService.login({
        username: formData.username,
        password: formData.password,
      });

      toast.success("Đăng nhập thành công!");

      // TODO: nếu muốn dùng rememberMe để phân biệt localStorage/sessionStorage
      // có thể xử lý thêm ở đây.

      const role = authService.getRole() || "CUSTOMER";
      const roleRoutes: Record<string, string> = {
        CUSTOMER: "/dashboard/customer",
        STAFF: "/dashboard/staff",
        TECHNICIAN: "/dashboard/technician",
        ADMIN: "/dashboard/admin",
      };

      navigate(roleRoutes[role] || "/dashboard/customer");
    } catch (error: any) {
      const status = error?.response?.status;
      let message = "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";

      if (status === 401 || status === 403 || status === 404) {
        message = "Sai Tên đăng nhập hoặc Mật khẩu.";
      } else if (!error?.response) {
        message = "Không thể kết nối tới server. Vui lòng thử lại.";
      }

      setErrors({ general: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "facebook" | "github") => {
    // Điều hướng sang endpoint OAuth2 của BE
    const base = "http://localhost:8080/oauth2/authorization";
    const urlMap: Record<typeof provider, string> = {
      google: `${base}/google`,
      facebook: `${base}/facebook`,
      github: `${base}/github`,
    };

    window.location.href = urlMap[provider];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-bold text-2xl mb-2"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EV Service
            </span>
          </Link>
          <p className="text-muted-foreground mt-2">Đăng nhập vào hệ thống</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>
              Nhập thông tin đăng nhập của bạn để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tên đăng nhập / Email */}
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập / Email</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập hoặc email"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Mật khẩu + toggle show/hide */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Ghi nhớ + Quên mật khẩu */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  {/* <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        rememberMe: Boolean(checked),
                      })
                    }
                    disabled={isLoading}
                  /> */}
                  {/* <span>Ghi nhớ đăng nhập</span> */}
                </label>

                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => {
                    // TODO: điều hướng sang trang forgot password khi bạn làm xong
                    navigate("/auth/forgot-password");
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Nút login */}
              <Button
                type="submit"
                className="w-full bg-gradient-primary shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>

              {/* Divider */}
              <div className="flex items-center my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="px-2 text-xs text-muted-foreground">
                  Hoặc đăng nhập với
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Social login buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("google")}
                >
                  <GoogleIcon className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("facebook")}
                >
                  <FacebookIcon className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("github")}
                >
                  <GithubIcon className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>

              <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">
                  Chưa có tài khoản?{" "}
                </span>
                <Link to="/register" className="text-primary hover:underline">
                  Đăng ký ngay
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
