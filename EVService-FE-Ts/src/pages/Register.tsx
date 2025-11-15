import { useMemo, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Loader2, Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/auth/auth";
import { toast } from "sonner";

// Nếu bạn có icon riêng thì import thêm
import GoogleIcon from "@/assets/icons/GoogleIcon";
import FacebookIcon from "@/assets/icons/FacebookIcon";
import GithubIcon from "@/assets/icons/GithubIcon";

type PasswordRequirement = {
  text: string;
  met: boolean;
};

type PasswordStrength = {
  label: string;
  className: string;
  barClassName: string;
  score: number;
  requirements: PasswordRequirement[];
};

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // ======= Password strength giống logic cũ (đơn giản hoá một chút) =======
  const passwordStrength: PasswordStrength = useMemo(() => {
    const pwd = formData.password;

    if (!pwd) {
      return {
        label: "",
        className: "",
        barClassName: "",
        score: 0,
        requirements: [],
      };
    }

    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasLength = pwd.length >= 8;

    const requirements: PasswordRequirement[] = [
      { text: "Tối thiểu 8 ký tự", met: hasLength },
      { text: "Có chữ in hoa (A-Z)", met: hasUppercase },
      { text: "Có chữ thường (a-z)", met: hasLowercase },
      { text: "Có chữ số (0-9)", met: hasNumber },
      { text: "Có ký tự đặc biệt (!@#...)", met: hasSpecial },
    ];

    let score = 0;
    if (hasLength) score++;
    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    let label = "Yếu";
    let className = "text-red-500";
    let barClassName = "bg-red-500";

    if (score >= 4) {
      label = "Mạnh";
      className = "text-green-500";
      barClassName = "bg-green-500";
    } else if (score === 3) {
      label = "Trung bình";
      className = "text-yellow-500";
      barClassName = "bg-yellow-500";
    }

    return {
      label,
      className,
      barClassName,
      score,
      requirements,
    };
  }, [formData.password]);

  // ======= Chỉ cho nhập số ở phoneNumber =======
  const handlePhoneChange = (value: string) => {
    const onlyDigits = value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({ ...prev, phoneNumber: onlyDigits }));
  };

  // ======= Social register (OAuth2) =======
  const handleSocialRegister = (provider: "google" | "facebook" | "github") => {
    const base = "http://localhost:8080/oauth2/authorization";
    const urlMap: Record<typeof provider, string> = {
      google: `${base}/google`,
      facebook: `${base}/facebook`,
      github: `${base}/github`,
    };
    window.location.href = urlMap[provider];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (!formData.acceptTerms) {
      toast.error("Bạn phải đồng ý với Điều khoản dịch vụ.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });
      navigate("/auth/email-sent", { state: { email: formData.email } });
      //toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      //navigate("/login");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-muted-foreground mt-2">Tạo tài khoản mới</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Đăng ký</CardTitle>
            <CardDescription>
              Nhập thông tin để tạo tài khoản mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Họ và tên */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Tên đăng nhập */}
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Chọn tên đăng nhập"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Số điện thoại */}
              {/* <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0123456789"
                  value={formData.phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div> */}

              {/* Địa chỉ */}
              {/* <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Đường ABC, Phường X, Quận Y, Tỉnh Z..."
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div> */}

              {/* Mật khẩu */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Tạo mật khẩu"
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
                    onClick={() => setShowPwd((prev) => !prev)}
                    aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Thanh mức độ mật khẩu */}
                {formData.password && (
                  <div className="space-y-2 text-xs mt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.barClassName}`}
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <span className={passwordStrength.className}>
                        {passwordStrength.label}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {passwordStrength.requirements.map((req, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 ${
                            req.met ? "text-green-500" : "text-muted-foreground"
                          }`}
                        >
                          <span>{req.met ? "✓" : "✗"}</span>
                          <span>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPwd2 ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPwd2((prev) => !prev)}
                    aria-label={showPwd2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPwd2 ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password &&
                  formData.confirmPassword !== formData.password && (
                    <p className="text-xs text-red-500">Mật khẩu không khớp</p>
                  )}
              </div>

              {/* Checkbox điều khoản */}
              <div className="flex items-start gap-2 text-sm">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      acceptTerms: Boolean(checked),
                    })
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="acceptTerms"
                  className="leading-snug text-muted-foreground"
                >
                  Tôi đồng ý với{" "}
                  <a
                    href="#"
                    className="text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: mở modal điều khoản hoặc điều hướng sang /terms
                    }}
                  >
                    Điều khoản dịch vụ
                  </a>
                </label>
              </div>

              {/* Nút đăng ký */}
              <Button
                type="submit"
                className="w-full bg-gradient-primary shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </Button>

              {/* Divider social */}
              <div className="flex items-center my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="px-2 text-xs text-muted-foreground">
                  Hoặc đăng ký với
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialRegister("google")}
                >
                  <GoogleIcon className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialRegister("facebook")}
                >
                  <FacebookIcon className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialRegister("github")}
                >
                  <GithubIcon className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>

              <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">Đã có tài khoản? </span>
                <Link to="/login" className="text-primary hover:underline">
                  Đăng nhập ngay
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
