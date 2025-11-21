import axios, { AxiosError, AxiosRequestConfig } from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type CustomAxiosRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

// Biến điều khiển hàng đợi
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // Không đính kèm Authorization cho các endpoint auth
    if (
      url.startsWith("/auth/login") ||
      url.startsWith("/auth/register") ||
      url.startsWith("/auth/refresh")
    ) {
      return config;
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data && !(config.data instanceof FormData)) {
      config.data = JSON.stringify(config.data);
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh: xử lý 401 + refresh token với hàng đợi
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest: any = error.config;
//     const url: string = originalRequest?.url || "";

//     const isAuthEndpoint =
//       url.startsWith("/auth/login") ||
//       url.startsWith("/auth/register") ||
//       url.startsWith("/auth/refresh");

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !isAuthEndpoint
//     ) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem("refreshToken");
//         if (!refreshToken) {
//           localStorage.removeItem("accessToken");
//           localStorage.removeItem("refreshToken");
//           window.location.href = "/login";
//           return Promise.reject(error);
//         }

//         const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
//           refreshToken,
//         });

//         const { accessToken } = response.data;
//         localStorage.setItem("accessToken", accessToken);

//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         localStorage.removeItem("accessToken");
//         localStorage.removeItem("refreshToken");
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    const isAuthEndpoint =
      url.startsWith("/auth/login") ||
      url.startsWith("/auth/register") ||
      url.startsWith("/auth/refresh");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      // Nếu đang có 1 request khác đi refresh -> đẩy vào queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          if (!newToken) {
            return Promise.reject(error);
          }

          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };

          return api(originalRequest);
        });
      }

      // Bắt đầu refresh token
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        // BE nên trả: { accessToken, refreshToken }
        const { accessToken, refreshToken: newRefreshToken } = res.data as {
          accessToken: string;
          refreshToken?: string;
        };

        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        processQueue(null, accessToken);

        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        };

        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
