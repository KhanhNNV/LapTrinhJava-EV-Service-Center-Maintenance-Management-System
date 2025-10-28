# EV Service Center - Frontend (EVService-FE)

## Cấu trúc thư mục `src` (React + TypeScript)

Thư mục `src` chứa toàn bộ mã nguồn của ứng dụng Frontend. Việc tổ chức code khoa học giúp dự án dễ dàng bảo trì, mở rộng và làm việc nhóm hiệu quả hơn. Dưới đây là giải thích chức năng của các thư mục và file chính:

* **`main.tsx`**: 🚀
    * **Điểm vào (Entry Point)** của ứng dụng.
    * Chịu trách nhiệm render component gốc (`App`) vào cây DOM HTML (thường là thẻ `<div id="root">`).
    * Nơi import các file CSS toàn cục (`index.css`).

* **`App.tsx`**: 🌍
    * **Component gốc (Root Component)** của toàn bộ ứng dụng.
    * Thường chứa cấu hình **định tuyến (Routing)** chính bằng `react-router-dom`, quyết định trang (`page`) nào sẽ hiển thị dựa trên URL.
    * Bao bọc các **Context Providers** (như `AuthContext`) để cung cấp state toàn cục cho các component con.

* **`index.css`**: 🎨
    * **CSS toàn cục (Global Styles)**.
    * Chứa các quy tắc CSS áp dụng cho toàn bộ ứng dụng như: CSS reset, định nghĩa font chữ mặc định, các biến CSS (màu sắc, kích thước...), và các utility classes cơ bản.

* **`/assets`**: 🖼️
    * Chứa các **tài nguyên tĩnh (Static Assets)** như hình ảnh, font chữ cục bộ, icon tĩnh...
    * Các file trong này thường được import trực tiếp vào component hoặc được tham chiếu trong CSS.
    * Ví dụ: `assets/Logo.png`.

* **`/components`**: 🧩
    * Chứa các **thành phần giao diện (UI Components) dùng chung**, có khả năng tái sử dụng cao trên toàn ứng dụng.
    * Chúng thường là các "dumb components" – chỉ nhận `props` và hiển thị giao diện, không chứa logic nghiệp vụ phức tạp hoặc state riêng.
    * **`/UI`**: Các building blocks cơ bản nhất (Button, Input, Modal, Spinner, Card...).
    * **`/Icons`**: Các component SVG icon (GoogleIcon, FacebookIcon...).
    * **`/Layout`**: Các component định hình bố cục trang (AppBar, Footer, Sidebar...).

* **`/config`**: ⚙️
    * Chứa các file **cấu hình** cho ứng dụng hoặc các thư viện bên thứ ba.
    * Ví dụ: `config/axios.ts` (cấu hình instance Axios với `baseURL`, `interceptors`), `config/routes.ts` (định nghĩa hằng số cho các đường dẫn).

* **`/constants`**: 📌
    * Chứa các **giá trị hằng số** được sử dụng ở nhiều nơi trong code.
    * Giúp tránh "magic strings/numbers" và dễ dàng thay đổi giá trị khi cần.
    * Ví dụ: Key dùng cho LocalStorage, URL API cố định, các mã lỗi, vai trò người dùng...

* **`/contexts`**: 🌐
    * Chứa các **React Context** để quản lý **state toàn cục (Global State)** hoặc state cần chia sẻ giữa các component không có quan hệ cha-con trực tiếp.
    * Ví dụ: `contexts/AuthContext.tsx` để quản lý trạng thái đăng nhập (thông tin người dùng, token) và các hàm `login`, `logout`.

* **`/features`**: ✨
    * **Nơi tổ chức code theo từng tính năng nghiệp vụ lớn (Business Features)**. Mỗi thư mục con trong `features` giống như một "ứng dụng nhỏ" (mini-app) độc lập tương đối.
    * Chứa *tất cả* code liên quan đến một tính năng: components đặc thù, logic gọi API, custom hooks, kiểu dữ liệu TypeScript riêng...
    * Ví dụ: `features/auth` chứa mọi thứ liên quan đến đăng nhập/đăng ký; `features/appointments` chứa mọi thứ liên quan đến quản lý lịch hẹn.
    * Giúp dễ dàng khoanh vùng và quản lý code khi dự án phát triển.

* **`/hooks`**: 🎣
    * Chứa các **Custom React Hook dùng chung** (`use...`) để tái sử dụng logic có trạng thái (stateful logic) hoặc logic phức tạp khác qua nhiều component/feature.
    * Ví dụ: `hooks/useLocalStorage.ts`, `hooks/useToggle.ts`, `hooks/useDebounce.ts`.

* **`/layouts`**: 📐
    * Chứa các component định nghĩa **bố cục (Layout)** chính cho các nhóm trang khác nhau.
    * Giúp đảm bảo tính nhất quán về giao diện giữa các trang có cùng cấu trúc.
    * Ví dụ: `layouts/AuthLayout.tsx` (layout đơn giản cho trang login/register), `layouts/MainLayout.tsx` (layout có AppBar, Sidebar cho các trang sau khi đăng nhập).

* **`/pages`**: 📄
    * Chứa các component đại diện cho **từng trang (Page) hoặc route** cụ thể của ứng dụng.
    * Thường không chứa nhiều logic, chủ yếu làm nhiệm vụ **sắp xếp các Layout và các component từ `features` hoặc `components`** để tạo thành giao diện hoàn chỉnh cho một URL.
    * Ví dụ: `pages/AuthPage.tsx`, `pages/DashboardPage.tsx`, `pages/NotFoundPage.tsx`.

* **`/services`**: 📡
    * Chứa các **hàm gọi API dùng chung** hoặc **cấu hình client API** (như Axios instance đã cài đặt interceptors để tự động đính kèm token).
    * Lưu ý: Logic gọi API *cụ thể* cho từng feature nên được đặt trong thư mục `api` bên trong feature đó (ví dụ: `features/auth/api/index.ts`). Thư mục `services` cấp cao này dành cho những gì chung nhất.

* **`/styles`**: 💅
    * Chứa các file liên quan đến **styling** dùng chung như: biến màu sắc, kích thước (variables), mixins (nếu dùng SASS/LESS), cấu hình theme, hoặc file CSS utility classes bổ sung.

* **`/types`**: 📝
    * Chứa các **định nghĩa kiểu TypeScript dùng chung** trên toàn bộ ứng dụng.
    * Giúp đảm bảo tính nhất quán về cấu trúc dữ liệu.
    * Ví dụ: `types/index.ts` (định nghĩa kiểu `User`, `Appointment`), `types/api.ts` (định nghĩa kiểu chung cho API response).

* **`/utils`**: 🛠️
    * Chứa các **hàm tiện ích nhỏ, thuần túy (pure functions)**, không phụ thuộc vào React hay trạng thái component, có thể tái sử dụng ở bất kỳ đâu.
    * Thường là các hàm xử lý dữ liệu, chuỗi, số, ngày tháng, hoặc kiểm tra validation.
    * Ví dụ: `utils/validators.ts` (`isValidEmail`), `utils/formatters.ts` (`formatDate`, `formatCurrency`).