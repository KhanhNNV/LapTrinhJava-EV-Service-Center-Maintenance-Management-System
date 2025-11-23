# EV Service Center Maintenance Management System

## Cấu trúc dự án

```plaintext
📁 LapTrinhJava-EV-Service-Center-Maintenance-Management-System/
├── 📂 EVService (Backend - Spring Boot)
│   ├── 📂 src/main/java/edu/uth/evservice
│   │   ├── 📂 config/          # Cấu hình hệ thống (AI, Payment, Security, JWT)
│   │   ├── 📂 controllers/     # API Endpoints (REST Controllers)
│   │   ├── 📂 dtos/            # Data Transfer Objects (Response)
│   │   ├── 📂 models/          # JPA Entities & Enums
│   │   ├── 📂 repositories/    # Data Access Layer (JPA Interfaces)
│   │   ├── 📂 requests/        # Data Transfer Objects (Request)
│   │   ├── 📂 services/        # Business Logic (Xử lý nghiệp vụ, AI, Auth)
│   │   └── 📂 exception/       # Xử lý lỗi toàn cục
│   └── 📄 pom.xml              # Quản lý dependency Maven
│
├── 📂 EVService-FE-Ts (Frontend - React + TypeScript)
│   ├── 📂 src
│   │   ├── 📂 components/      # Các UI component tái sử dụng (Button, Table, Dialog...)
│   │   ├── 📂 layouts/         # Bố cục trang theo vai trò (Admin, Staff, Customer...)
│   │   ├── 📂 pages/           # Các màn hình chính phân theo chức năng
│   │   │   ├── 📂 admin/       # Trang quản trị
│   │   │   ├── 📂 customer/    # Trang khách hàng
│   │   │   ├── 📂 staff/       # Trang nhân viên
│   │   │   └── 📂 technician/  # Trang kỹ thuật viên
│   │   ├── 📂 services/        # Gọi API (Axios/Fetch)
│   │   ├── 📂 hooks/           # Custom React Hooks
│   │   └── 📂 utils/           # Các hàm tiện ích
│   └── 📄 package.json         # Quản lý dependency NPM
│
└── 📂 database/                # Script khởi tạo CSDL
```


## 🛠️ Installation & Setup Guide (Hướng dẫn Cài đặt)

Tài liệu này hướng dẫn chi tiết cách thiết lập môi trường phát triển (Local Environment) cho dự án **EV Service Center Management System**.

### 📋 Yêu cầu hệ thống (Prerequisites)

Hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

- **Java JDK**: Phiên bản 17 hoặc 21.
- **Node.js**: Phiên bản 18 trở lên.
- **MySQL**: Phiên bản 8.0.
- **Maven**: (Tùy chọn, dự án đã có sẵn `mvnw`).
- **IDE**: IntelliJ IDEA (khuyên dùng cho Backend) & VS Code (Frontend).

---

### 🗄️ 1. Thiết lập Database

1. Mở MySQL Workbench hoặc Terminal.
2. Chạy lệnh SQL sau để tạo database trống (Bảng sẽ được tự động tạo bởi Hibernate khi chạy Backend):

```sql
CREATE DATABASE evservicedb;
```

### ☕ 2. Thiết lập Backend (Spring Boot)
Bước 2.1: Cấu hình biến môi trường
Dự án sử dụng profile dev làm mặc định để phát triển. Bạn cần tạo một file cấu hình riêng để chứa các thông tin nhạy cảm (Mật khẩu DB, API Key, Email...).

Truy cập thư mục: EVService/src/main/resources/

Tạo file mới tên là: application-dev.properties
```Properties
Copy toàn bộ nội dung dưới đây vào file đó và thay thế các giá trị trong ngoặc <...> bằng thông tin thật của bạn.
# =============================================================================
# LOCAL DEVELOPMENT CONFIGURATION (application-dev.properties)
# File này chứa thông tin cá nhân/nhạy cảm và KHÔNG được push lên Git.
# Các giá trị này sẽ thay thế cho các biến ${...} trong application.properties
# =============================================================================

# --- 1. DATABASE CONFIGURATION ---
spring.datasource.url=jdbc:mysql://localhost:3306/evservicedb?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=<YOUR_MYSQL_PASSWORD>

# --- 2. SERVER PORT ---
server.port=8080

# --- 3. JWT SECURITY (HS512 Key) ---
# Chuỗi bí mật để mã hóa Token. Giữ nguyên hoặc thay đổi tùy ý.
app.key.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970

# --- 4. EMAIL CONFIGURATION (Gmail SMTP) ---
# Hướng dẫn: Bật 2-Step Verification -> Tạo App Password
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=<YOUR_GMAIL_ADDRESS>
spring.mail.password=<YOUR_GMAIL_APP_PASSWORD>

# --- 5. AI CONFIGURATION (Google Gemini) ---
# Lấy API Key tại: [https://aistudio.google.com/](https://aistudio.google.com/)
spring.ai.google.genai.api-key=<YOUR_GEMINI_API_KEY>

# --- 6. OAUTH2 CONFIGURATION (Social Login) ---
# Nếu chưa test login Google/FB, có thể để giá trị rỗng hoặc dummy string
spring.security.oauth2.client.registration.google.client-id=<YOUR_GOOGLE_CLIENT_ID>
spring.security.oauth2.client.registration.google.client-secret=<YOUR_GOOGLE_CLIENT_SECRET>

spring.security.oauth2.client.registration.github.client-id=<YOUR_GITHUB_CLIENT_ID>
spring.security.oauth2.client.registration.github.client-secret=<YOUR_GITHUB_CLIENT_SECRET>

spring.security.oauth2.client.registration.facebook.client-id=<YOUR_FACEBOOK_CLIENT_ID>
spring.security.oauth2.client.registration.facebook.client-secret=<YOUR_FACEBOOK_CLIENT_SECRET>
```

##### Bước 2.2: Chạy Backend
Mở terminal tại thư mục gốc EVService/ (thư mục chứa file pom.xml) và chạy lệnh:

###### Windows:
```Bash
./mvnw spring-boot:run
```
##### Mac/Linux:
```Bash
./mvnw spring-boot:run
```

Khi thấy log hiển thị: Started EvServiceApplication in ... seconds nghĩa là Backend đã khởi động thành công tại cổng 8080.

### ⚛️ 3. Thiết lập Frontend (React + TypeScript)
#### Bước 3.1: Cài đặt thư viện
Mở một terminal mới (không tắt terminal Backend), di chuyển vào thư mục Frontend:
``` Bash
cd EVService-FE-Ts
npm install
```
#### Bước 3.2: Chạy Frontend
Khởi chạy server phát triển:
```Bash
npm run dev
```
Truy cập trình duyệt tại địa chỉ được hiển thị trên terminal (thường là): http://localhost:5173
