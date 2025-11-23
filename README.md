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
