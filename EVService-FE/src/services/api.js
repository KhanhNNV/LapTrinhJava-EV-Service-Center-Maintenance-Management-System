/**
 * 🧩 apiClient.js
 * - Dùng để kết nối FE ↔️ BE.
 * - Tự động gắn accessToken vào mỗi request.
 * - Nếu accessToken hết hạn → tự động xin refreshToken.
 * - Nếu refreshToken hết hạn → logout về trang /auth.
 * 
 * 
*. // Interceptor như "LỚP TRUNG GIAN" xử lý tự động     
*.┌─────────────┐    ┌───────────────┐    ┌─────────────┐
*.│   Client    │ -> │ INTERCEPTOR   │ -> │   SERVER    │
*.│(Gửi request)│    │ (Auto token)  │    │(Spring boot)│
*.└─────────────┘    └───────────────┘    └─────────────┘
 */

import axios from "axios";
//============================================================================//
//~ Địa chỉ server
export const API_URL = "http://localhost:8081";
//============================================================================//
//. Tạo một instance mới của axios với cấu hình tùy chỉnh
const apiClient = axios.create({
  baseURL: API_URL, //~ Thiết lập URL gốc cho tất cả request
  headers: { "Content-Type": "application/json" }, //~ Kiểu dữ liệu trả về là JSON
});
//============================================================================//
//. Tự động đính kèm Token vào mỗi lần request gửi đến server
//-> Đây là hàm đầu tiên xữ lý Trước khi request gửi đi 

apiClient.interceptors.request.use(
  (config) => {
    //~ So sánh xem thử URL có phải là /auth/refresh không?
    if (config.url?.includes("/auth/refresh")){
      return config;
    }
    //~ Lấy token từ LocalStorage
    const token = localStorage.getItem("authToken");
    //~ Nếu có token thì đính kèm vào header Authorizaion
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config; //-> Trả về request đã được xữ lý
  },
  (error) => Promise.reject(error)
);
//============================================================================//
//. Biến điều khiển hàng đợi
let isRefreshing = false; //~CỜ: có đang refresh token không
let failedQueue = []; //~Hàng chờ chứa các request bị 401 trong khi đang refesh
//============================================================================//
//.Hàm xữ lý các request bị 401 để
//~ FE gửi nhiều request đến BE.

//~ BE trả về 401 vì token hết hạn.

//~ Request đầu tiên gặp 401 sẽ gọi API /auth/refresh
//~  để xin token mới.
//~ → Cờ isRefreshing = true.

//~ Những request khác cũng bị 401 thì thấy đang refresh,
//~ nên không gọi refresh thêm, chỉ đẩy bản thân vào
//~ failedQueue để “chờ token mới”.
const processQueue = (error, token = null) => {
  failedQueue.forEach((e) => {
    if (error) e.reject(error);
    else e.resolve(token);
  });
  failedQueue = [];
};
//============================================================================//
//. Hàm xin accessToken (autheToken) khi hết hạn
//-> Hàm này sẽ kiểm tra response trả về từ server
apiClient.interceptors.response.use(
  //~ Kiểm tra response
  (response) => {
    //~ Nếu không có lỗi gì thì trả về luôn
    return response;
  },
  //~ Nếu có lỗi xãy ra bắt lại
  async (error) => {
    const originalRequest = error.config;

    //~ Kiểm tra nếu lỗi là 401 và request này chưa thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {
      //~   ".?"=> Object là null hoặc undefined thì dừng lại và trả về undefined,KHÔNG báo lỗi.
      //~   "._retry"=> ._retry này là một thuộc tính của "axios": “Request này đã được thử lại một lần rồi — đừng thử nữa nếu lại lỗi 401.”

      //~ Đánh dấu request này đã thử để tránh retry vòng lặp vô hạn
      originalRequest._retry = true;

      //~ Kiểm tra xem đã có 1 request nào khác đã xin accessToken chưa
      if (isRefreshing) {
        //~ Đưa request hiện tại vào hàng đợi chờ token mới
        return new Promise((resolve, reject) => {
          //~ Thêm request vào hàng đợi và lưu resolve và reject
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          //~ Khi đã có token rồi thì gắn lại vào header Authorization
          //~ -> gọi lại request vừa lưu vào hàng đợi
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        });
      }

      //~ Đánh dấu đã đang có 1 request đang đi xin refresh token (tránh nhiều request rũ nhau đi xin)
      isRefreshing = true;

      //~ Lấy refesh token từ LocalStorage
      const localRefreshToken = localStorage.getItem("refreshToken");
      //~ Nếu không có refreshToken
      if (!localRefreshToken) {
        localStorage.clear(); //~ Xóa hết token cũ
        window.location.href = "/auth"; //~ Đưa về trang đăng nhập
        isRefreshing = false;
        return Promise.reject(error);
      }

      //~Nếu có refresh token trong LocalStorage
      try {
        const reset = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: localRefreshToken,
        });

        //~ Lấy được token mới từ server
        //~ Đây là gán giá trị
        const { accessToken, refreshToken: newRefreshToken } = reset.data;

        //~ Lưu lại token mới vào localStorage
        localStorage.setItem("authToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        //~ Thông báo thành công cho tất cả request trong hàng đợi
        processQueue(null, accessToken);

        //~ Gắn token mới vào request mới xin token rồi gửi lại
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        //~ Khi add accessToken vào queue và request hiện tại xong trả cờ về False
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (e) {
        //~ Xử lý nếu refresh token cũng hết hạn
          processQueue(e, null);
          isRefreshing = false;
          localStorage.clear();
          window.location.href = "/auth";
          return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);
//============================================================================//
export default apiClient;
