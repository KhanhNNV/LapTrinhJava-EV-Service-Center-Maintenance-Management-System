// import { useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { authService } from "@/services/auth/auth";

// type Role = "CUSTOMER" | "STAFF" | "TECHNICIAN" | "ADMIN";

// const roleRoutes: Record<Role, string> = {
//   CUSTOMER: "/dashboard/customer",
//   STAFF: "/dashboard/staff",
//   TECHNICIAN: "/dashboard/technician",
//   ADMIN: "/dashboard/admin",
// };

// const AuthCallbackPage: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   useEffect(() => {
//     // 1. Lấy token từ query params
//     //    Ưu tiên accessToken, nếu BE đang gửi authToken thì vẫn support
//     const accessToken =
//       searchParams.get("accessToken") ?? searchParams.get("authToken");
//     const refreshToken = searchParams.get("refreshToken");

//     if (accessToken) {
//       // 2. Lưu token vào localStorage
//       localStorage.setItem("accessToken", accessToken);
//       if (refreshToken) {
//         localStorage.setItem("refreshToken", refreshToken);
//       }

//       // 3. Lấy role từ JWT (hàm getRole bạn đã có trong authService)
//       const role = authService.getRole();

//       // 4. Tính route đích dựa trên role
//       const targetPath =
//         role && roleRoutes[role as Role]
//           ? roleRoutes[role as Role]
//           : "/dashboard/customer";

//       // 5. Điều hướng, replace để không quay lại trang callback
//       navigate(targetPath, { replace: true });

//       // 6. Optional: reload nếu bạn muốn toàn bộ app mount lại với trạng thái mới
//       // window.location.reload();
//     } else {
//       console.error("Không tìm thấy accessToken/authToken trong URL callback.");
//       navigate("/login", { replace: true });
//     }
//   }, [searchParams, navigate]);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center gap-2">
//       <h1 className="text-2xl font-semibold">Đang xử lý đăng nhập...</h1>
//       <p className="text-muted-foreground">
//         Vui lòng chờ trong giây lát, chúng tôi đang xác thực tài khoản của bạn.
//       </p>
//     </div>
//   );
// };

// export default AuthCallbackPage;

import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth/auth";

type Role = "CUSTOMER" | "STAFF" | "TECHNICIAN" | "ADMIN";

const roleRoutes: Record<Role, string> = {
  CUSTOMER: "/dashboard/customer",
  STAFF: "/dashboard/staff",
  TECHNICIAN: "/dashboard/technician",
  ADMIN: "/dashboard/admin",
};

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken =
      searchParams.get("accessToken") ?? searchParams.get("authToken");
    const refreshToken = searchParams.get("refreshToken");
    const status = searchParams.get("status"); // NEW_EMAIL_UNVERIFIED / EXISTING...

    if (!accessToken) {
      console.error("Không tìm thấy accessToken trong URL callback.");
      navigate("/login", { replace: true });
      return;
    }

    // Lưu token
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    // Nếu backend bảo rằng email chưa verify → tới trang chờ xác thực
    if (status === "NEW_EMAIL_UNVERIFIED") {
      navigate("/auth/verify-email-pending", { replace: true });
      return;
    }

    // Ngược lại: user đã verify → điều hướng theo role
    const role = authService.getRole();
    const target =
      role && roleRoutes[role as Role]
        ? roleRoutes[role as Role]
        : "/dashboard/customer";

    navigate(target, { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-semibold">Đang xử lý đăng nhập...</h1>
      <p className="text-muted-foreground">
        Vui lòng chờ trong giây lát, chúng tôi đang xác thực tài khoản của bạn.
      </p>
    </div>
  );
};

export default AuthCallbackPage;
