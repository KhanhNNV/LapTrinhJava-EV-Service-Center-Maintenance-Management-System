import api from "./api";

// Helper: decode JWT payload
function parseJwt(token: string | null): any {
  if (!token) return null;
  const base64Url = token.split(".")[1];
  if (!base64Url) return null;
  try {
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export interface LoginCredentials {
  username: string; // form của bạn dùng "username"
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export type Role = "CUSTOMER" | "STAFF" | "TECHNICIAN" | "ADMIN";

export interface User {
  id?: number;
  username?: string;
  email?: string;
  fullName?: string;
  role: Role;
  phoneNumber?: string;
  address?: string;
}

export const authService = {
  // async login(credentials: LoginCredentials) {
  //   // BE yêu cầu LoginRequest có field "usernameOrEmail"
  //   const payload = { usernameOrEmail: credentials.username, password: credentials.password };

  //   // ✅ endpoint đúng: /auth/login (KHÔNG phải /auth/auth)
  //   const res = await api.post('/auth/login', payload);
  //   const { accessToken, refreshToken } = res.data;

  //   localStorage.setItem('accessToken', accessToken);
  //   localStorage.setItem('refreshToken', refreshToken);

  //   // Không trả user nữa cho đúng DTO
  //   return { accessToken, refreshToken };
  // },
  async login(credentials: { username: string; password: string }) {
    const payload = {
      usernameOrEmail: credentials.username, // BE yêu cầu field này
      password: credentials.password,
    };

    const response = await api.post("/auth/login", payload);
    const { accessToken, refreshToken } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    return { accessToken, refreshToken };
  },
  async register(data: RegisterData) {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // không dùng localStorage 'user' nữa
  },

  // ✅ Lấy role trực tiếp từ accessToken
  getRole(): Role | null {
    const payload = parseJwt(localStorage.getItem("accessToken"));
    if (!payload) return null;

    let rawRole: string | null =
      payload.role ||
      (Array.isArray(payload.authorities) ? payload.authorities[0] : null);

    if (!rawRole) return null;
    if (rawRole.startsWith("ROLE_")) {
      rawRole = rawRole.substring(5); // bỏ "ROLE_"
    }

    return rawRole as Role;
  },

  // ✅ Lấy user tối thiểu từ token (tuỳ claim BE đang nhúng)
  getCurrentUser(): User | null {
    const payload = parseJwt(localStorage.getItem("accessToken"));
    if (!payload) return null;

    const role = this.getRole();
    if (!role) return null;

    const id = payload.sub ? Number(payload.sub) : undefined;

    const user: User = {
      id,
      username: payload.username,
      email: payload.email,
      fullName: payload.fullName || payload.name,
      role,
      phoneNumber: payload.phoneNumber,
    };

    // nếu muốn vẫn cache vào localStorage:
    // localStorage.setItem('user', JSON.stringify(user));

    return user;
  },

  // ✅ Kiểm tra còn hạn
  isAuthenticated(): boolean {
    const payload = parseJwt(localStorage.getItem("accessToken"));
    if (!payload) return false;
    if (!payload.exp) return true;
    return payload.exp * 1000 > Date.now();
  },
};
