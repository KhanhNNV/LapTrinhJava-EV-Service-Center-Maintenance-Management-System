// import axios from 'axios';

// export const API_BASE_URL = 'http://localhost:8080';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// // Gắn Bearer
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('accessToken');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // Refresh token
// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const original: any = error.config;
//     const url: string = original?.url || '';

//     // Không tự refresh cho các endpoint auth
//     const isAuthEndpoint =
//       url.startsWith('/auth/login') ||
//       url.startsWith('/auth/register') ||
//       url.startsWith('/auth/refresh');

//     if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
//       const refreshToken = localStorage.getItem('refreshToken');
//       if (!refreshToken) {
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         window.location.href = '/login';
//         return Promise.reject(error);
//       }

//       original._retry = true;
//       try {
//         const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
//         const { accessToken } = resp.data;
//         localStorage.setItem('accessToken', accessToken);
//         original.headers.Authorization = `Bearer ${accessToken}`;
//         return api(original);
//       } catch (e) {
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         window.location.href = '/login';
//         return Promise.reject(e);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;


// api.ts
import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const url = config.url || '';

    // ❗ Không đính kèm Authorization cho các endpoint auth
    if (url.startsWith('/auth/login') || url.startsWith('/auth/register') || url.startsWith('/auth/refresh')) {
      return config;
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: any = error.config;
    const url: string = originalRequest?.url || '';

    const isAuthEndpoint =
      url.startsWith('/auth/login') ||
      url.startsWith('/auth/register') ||
      url.startsWith('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
