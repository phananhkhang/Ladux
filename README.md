# Ladux - Hệ Thống Thương Mại Điện Tử & Quản Lý Chuỗi Cung Ứng Laptop

![Java 21](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot 4.0.6](https://img.shields.io/badge/Spring%20Boot-4.0.6-6DB33F?logo=springboot&logoColor=white)
![PostgreSQL 17](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Flyway](https://img.shields.io/badge/Flyway-41%20Migrations-CC0200?logo=flyway&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6DB33F?logo=springsecurity&logoColor=white)
![JWT HttpOnly](https://img.shields.io/badge/Auth-JWT%20Cookie%20%2B%20CSRF-000000?logo=jsonwebtokens&logoColor=white)
![Maven 3.9](https://img.shields.io/badge/Maven-3.9-C71A36?logo=apachemaven&logoColor=white)

![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite 6](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-764ABC?logo=react&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

**Ladux** là một hệ thống thương mại điện tử chuyên biệt dành cho ngành hàng Laptop & Thiết bị công nghệ, tích hợp toàn diện từ **Storefront (Khách hàng)**, **Admin Operations (Quản trị vận hành)** đến **Supply Chain & Procurement (Quản lý chuỗi cung ứng & Kho hàng)**.

---

## 📋 Mục Lục

- [Giới Thiệu Tổng Quan](#-giới-thiệu-tổng-quan)
- [Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
- [Công Nghệ & Kiến Trúc](#-công-nghệ--kiến-trúc)
- [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
- [Luồng Hoạt Động Hệ Thống](#-luồng-hoạt-động-hệ-thống)
- [Hướng Dẫn Cài Đặt & Chạy Ứng Dụng](#-hướng-dẫn-cài-đặt--chạy-ứng-dụng)
- [Cấu Hình Biến Môi Trường](#-cấu-hình-biến-môi-trường)
- [Cơ Sở Dữ Liệu & Migrations](#-cơ-sở-dữ-liệu--migrations)
- [Danh Sách API Chính](#-danh-sách-api-chính)
- [Tài Liệu Chi Tiết trong `/docs`](#-tài-liệu-chi-tiết-trong-docs)
- [Kiểm Thử, Build & Ghi Chú Vận Hành](#-kiểm-thử-build--ghi-chú-vận-hành)

---

## 🚀 Giới Thiệu Tổng Quan

Dự án Ladux bao gồm hai thành phần trọng yếu kết nối qua REST API:

- **`backend/`**: Hệ thống Spring Boot RESTful API hỗ trợ Java 21, quản lý danh mục sản phẩm, biến thể (RAM, ROM, Màu sắc, SKU), giỏ hàng, đặt hàng khóa tồn kho nguyên tử (`PESSIMISTIC_WRITE`), tích hợp thanh toán (VNPay Sandbox IPN HMAC-SHA512 với `merchantTxnRef`, MoMo, COD), quy trình nhập hàng NCC (PO, Goods Receipt), sổ cái biến động kho (Stock Ledger), mã giảm giá (Coupon), xác thực OTP (Phone/Email), và phân quyền người dùng (Role-based access control).
- **`frontend/`**: Ứng dụng Single Page Application (SPA) xây dựng trên nền React 18, TypeScript, Vite & Tailwind CSS. Cung cấp cả giao diện bán hàng Cyber Luxury Storefront (Header cố định nhận diện hướng cuộn trang, Dropdown kính mờ Popover, Card sản phẩm 3D Aura, Khung thương hiệu 12 đối tác, Font Orbitron/Rajdhani) và giao diện quản trị Admin Dashboard chuyên nghiệp.

---

## ✨ Tính Năng Nổi Bật

### 🛒 1. Khách Hàng (Storefront Cyber Design)

- **Trang chủ & Banner Carousel**: Banner slide 4 hình ảnh quảng cáo tự động chuyển 5s (Autoplay), hiệu ứng vuốt chạm cảm ứng (touch swipe), nút điều hướng kính mờ và 4 thẻ cam kết dịch vụ (*Chính hãng 100%, Giao hỏa tốc 2h, Trả góp 0%, 1 đổi 1 30 ngày*).
- **6-Card Category Showcase**: Giao diện chọn laptop theo nhu cầu 6 ô (*Laptop Gaming, Laptop Văn Phòng, Ultrabook Mỏng Nhẹ, Laptop Đồ Họa, Laptop Doanh Nhân, Laptop Sinh Viên*) kèm hiệu ứng mờ biên trái độc đáo (`mask-image`).
- **Thương hiệu đối tác hàng đầu**: Khung bao đen kính mờ (`bg-[#0d0e10]/90 backdrop-blur-xl`) chứa 12 thương hiệu đối tác (*Apple, Lenovo, Dell, HP, Asus, Acer, MSI, Razer, Samsung, LG, Microsoft, Huawei*) với đường viền xanh neon `#00FF41`.
- **Thanh Header Cố Định & Nhận Diện Hướng Cuộn**:
  - Header chính cố định ở đỉnh màn hình (`fixed top-0 left-0 right-0 z-50`).
  - Thanh Header phụ tự động trượt rút lên trên và mờ ẩn khi cuộn xuống (`scroll DOWN`), tự động trượt lộ ra lại khi cuộn lên (`scroll UP`).
  - Menu chọn danh mục Popover kính mờ thay thế `<select>` mặc định.
  - Phông chữ logo thương hiệu **LADUX** dùng Google Fonts **Orbitron & Rajdhani** mạnh mẽ kèm quầng sáng xanh neon.
  - Biểu tượng giỏ hàng công nghệ **`ShoppingCart`** kèm huy hiệu số lượng nhịp thở Cyber.
- **Bộ lọc sản phẩm thông minh (Catalog Filters)**: Lọc kết hợp đa tiêu chí cùng lúc: Thương hiệu, Dòng máy, Dung lượng RAM, Dung lượng Ổ cứng (ROM), Khoảng giá, Tìm kiếm full-text (`pg_trgm`) và Sắp xếp Popover (Mới nhất, Giá tăng/giảm, Đánh giá cao). Đồng bộ nút "Đặt lại" bộ lọc thông minh.
- **Card Sản Phẩm Cyber 3D Aura (`ProductCard.tsx`)**:
  - Khung ảnh sản phẩm có quầng sáng xanh neon `radial ambient glow` phía sau laptop.
  - Hộp thông số kỹ thuật 2 cột (*Màn hình, CPU, RAM, ROM, GPU*).
  - Phân cấp giá Sale màu xanh neon `#00FF41` kích thước lớn gạch chân `đ` kèm badge đánh giá sao.
  - Bộ đôi nút *`ⓘ Chi tiết`* và *`🛒 Thêm giỏ`* chuẩn phong cách Cyber Gaming.
- **Xác thực & Bảo mật tài khoản**:
  - Đăng ký / Đăng nhập tài khoản bằng mật khẩu mã hóa BCrypt.
  - Đăng nhập nhanh bằng **Google OAuth2**.
  - REST API stateless: access token được frontend giữ trong bộ nhớ và gửi qua `Authorization: Bearer`; refresh token nằm trong cookie `HttpOnly + Secure + SameSite`.
  - Token Versioning (`token_version`) giúp vô hiệu hóa phiên làm việc tức thì khi đổi mật khẩu hoặc đăng xuất.
  - Xác thực số điện thoại & email qua mã OTP (`phone_verifications`, `email_verifications`).
- **Giỏ hàng & Thanh Toán VNPay Sandbox Flow**:
  - Quản lý giỏ hàng realtime, chọn biến thể, cập nhật số lượng.
  - Áp dụng Mã giảm giá (Coupon) trực tiếp khi checkout.
  - Tính phí vận chuyển tự động theo địa chỉ & đơn vị vận chuyển.
  - Khóa tồn kho nguyên tử an toàn tránh overselling (`PESSIMISTIC_WRITE`).
  - Tích hợp thanh toán **VNPay Sandbox** (Tạo URL thanh toán kèm HMAC-SHA512 checksum & `merchantTxnRef`, kiểm tra kết quả trả về tại `VNPayReturnView`), **MoMo**, và **COD** (Thanh toán khi nhận hàng).
  - Theo dõi trạng thái đơn hàng & timeline lịch sử đơn (`PENDING` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`).
- **Thông tin liên hệ thực tế**:
  - Showroom Chính: `49/40/46 Trịnh Đình Trọng, Tân Phú, TP.HCM`
  - Hotline Hỗ Trợ: `0352 060 306`
  - Email Liên Hệ: `laduxshop@gmail.com`

### ⚙️ 2. Quản Trị & Chuỗi Cung Ứng (Admin & Supply Chain Operations)

- **Dashboard Vận Hành**: Thống kê doanh thu, số lượng đơn hàng, biểu đồ tổng quan, danh sách đơn hàng mới nhất và trạng thái hệ thống.
- **Quản lý Danh Mục & Sản Phẩm (Catalog Management)**:
  - Quản lý Thương hiệu (Brands), Danh mục (Categories) và Màu sắc (Colors).
  - Quản lý Sản phẩm, Biến thể sản phẩm (Variant: SKU, RAM, ROM, Giá nhập, Giá bán, Giá giảm, Số lượng tồn kho).
  - Upload & quản lý bộ sưu tập hình ảnh sản phẩm local/public asset.
- **Quản lý Chuỗi Cung Ứng & Nhập Hàng (Procurement & Inventory)**:
  - Quản lý Nhà cung cấp (Suppliers) & Liên kết Sản phẩm - Nhà cung cấp (Product-Supplier mapping).
  - Đơn nhập hàng (Purchase Orders - PO): Tạo PO, chuyển trạng thái, nhận hàng từng phần (Partial Receiving) hoặc toàn bộ.
  - Sổ cái biến động kho (Stock Ledger): Tự động ghi nhật ký mọi giao dịch kho (`PURCHASE_IN`, `SALE_OUT`, `ADJUSTMENT_IN/OUT`, `DAMAGE_OUT`). Hỗ trợ điều chỉnh kho thủ công an toàn (chống kho âm).
- **Quản lý Đơn Hàng & Thanh Toán (Sales & Payments)**:
  - Xem danh sách đơn hàng, lọc theo trạng thái, tìm kiếm mã đơn.
  - Chuyển trạng thái đơn hàng an toàn theo State Machine.
  - Xử lý các yêu cầu thanh toán (Payment Attempts), xác nhận thanh toán thành công hoặc thất bại.
- **Quản lý Người Dùng & Hệ Thống**:
  - Quản lý danh sách User, Phân quyền Role (ADMIN, USER), kiểm tra lịch sử địa chỉ khách hàng.
  - Quản lý Mã giảm giá (Coupons): loại giảm theo %, giảm cố định, giới hạn lượt dùng, ngày hết hạn.
  - Kiểm duyệt Đánh giá (Reviews) của khách hàng.

---

## 🛠️ Công Nghệ & Kiến Trúc

### Backend
- **Core Framework**: Java 21, Spring Boot `4.0.6`.
- **Web & Security**: Spring Web MVC, Spring Security, OAuth2 Client (Google Login), Spring Validation.
- **Authentication**: Bearer JWT (`jjwt` 0.13.x), REST stateless/CSRF disabled, refresh-token cookie HttpOnly, Refresh Token Rotation, Token Versioning.
- **Database & Persistence**: PostgreSQL 17, Spring Data JPA / Hibernate, Flyway Database Migration (41 scripts).
- **Full-Text Search & Locking**: PostgreSQL Extension `pg_trgm` cho tìm kiếm chuỗi, ShedLock cho distributed locking, Pessimistic Locking (`PESSIMISTIC_WRITE`) cho giao dịch kho/coupon.
- **Utils & Integration**: Lombok, Commons Codec (HMAC SHA-512 cho VNPay checksum).

### Frontend
- **Framework & Build Tools**: React 18, TypeScript 5, Vite 6.3.
- **Routing & State Management**: React Router DOM v7, Zustand (quản lý state toàn cục cho auth, products, cart, wishlist, orders, notifications, UI).
- **Styling & UI Components**: Tailwind CSS, Radix UI Primitives (Dialog, Select, Popover), Lucide React Icons, Sonner Toaster.
- **Data Fetching**: Axios API Client với Interceptors (xử lý tự động CSRF token, Auth expired events, Error handling).

### Infrastructure & DevOps
- Dockerfile đa tầng (Multi-stage build / JAR deployment) cho backend.
- Docker Compose thiết lập môi trường hoàn chỉnh (Backend + PostgreSQL 17 Alpine).

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
Ladux/
├── backend/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/org/akira/ladux/
│       │   │   ├── config/              # Security, CORS, Web, ShedLock, OpenAPI configs
│       │   │   ├── controller/          # AuthController
│       │   │   │   ├── admin/           # Admin REST APIs (22 controllers)
│       │   │   │   └── user/            # Storefront REST APIs (16 controllers)
│       │   │   ├── dto/                 # Request & Response DTOs theo module
│       │   │   ├── exception/           # Global Exception Handler & Custom Errors
│       │   │   ├── model/               # JPA Entities (User, Product, Order, PO, Stock, etc.)
│       │   │   ├── repository/          # Spring Data JPA Repositories
│       │   │   ├── service/             # Business Logic & Service Implementations
│       │   │   └── utils/               # Helper utils (Cookie, JWT, Security, VNPay)
│       │   └── resources/
│       │       ├── application.properties
│       │       ├── application-dev.properties
│       │       ├── application-prod.properties
│       │       └── db/
│       │           ├── migration/       # 41 Flyway SQL Migrations
│       │           └── devdata/         # Seed mock data cho môi trường Dev
│       └── test/                        # Integration & Unit Tests
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── admin/                       # Admin Panel SPA
│       │   ├── api/                     # Admin API client endpoints
│       │   ├── components/              # AdminUI (Table, Panel, Button, Dialog) & AdminShell
│       │   ├── pages/                   # Admin pages (Dashboard, Products, Sales, Procurement, etc.)
│       │   └── types/                   # Admin TypeScript declarations
│       ├── app/                         # App Router, StorefrontProvider & UI primitives
│       ├── components/                  # Shared Storefront UI components (Header, Footer, Cards)
│       ├── config/                      # env.ts (API URL config)
│       ├── pages/                       # Storefront pages (Home, Catalog, ProductDetail, Cart, Checkout, etc.)
│       ├── services/                    # Axios API services (product, cart, order, user, etc.)
│       ├── stores/                      # Zustand state stores
│       └── types/                       # Core TypeScript interfaces & DTO mappers
├── docs/                                # Tài liệu thiết kế, kiến trúc & báo cáo chi tiết
├── uploads/                             # Thư mục lưu hình ảnh sản phẩm / brand / category
└── README.md
```

---

## 🔄 Luồng Hoạt Động Hệ Thống

### 1. Kiến trúc tổng thể

```mermaid
flowchart TD
    Client["Browser (Storefront / Admin SPA)"]
    APIClient["Axios Client (Bearer access token + refresh cookie)"]
    SecFilter["Spring Security Filter Chain"]
    JwtFilter["JwtFilter (Authorization: Bearer)"]
    Controllers["REST Controllers (Admin / User)"]
    Services["Service Layer (Transactional Business Logic)"]
    Locks["Pessimistic DB Lock / ShedLock"]
    Repos["Spring Data JPA Repositories"]
    DB[(PostgreSQL 17 Database)]

    Client --> APIClient
    APIClient --> SecFilter
    SecFilter --> JwtFilter
    JwtFilter --> Controllers
    Controllers --> Services
    Services --> Locks
    Locks --> Repos
    Repos --> DB
```

### 2. Luồng Đặt Hàng & Khóa Tồn Kho (Order & Inventory Locking Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách Hàng
    participant FE as React Frontend
    participant BE as OrderController
    participant SVC as OrderServiceImpl
    participant INV as InventoryServiceImpl
    participant DB as PostgreSQL DB

    User->>FE: Nhấn "Thanh Toán Đơn Hàng"
    FE->>BE: POST /api/v1/orders (kèm CSRF Header + Auth Cookie)
    BE->>SVC: createOrder(userId, dto)
    SVC->>INV: Lock & Kiểm tra tồn kho (PESSIMISTIC_WRITE)
    INV->>DB: SELECT FOR UPDATE stock_quantity
    DB-->>INV: Tồn kho khả dụng
    alt Tồn kho đủ
        INV->>DB: Giảm stock_quantity & Ghi nhận Stock Movement (SALE_OUT)
        SVC->>DB: Tạo Order, OrderItems & PaymentAttempt (PENDING)
        SVC-->>FE: Trả về OrderResponse (Mã đơn + Trạng thái)
        FE-->>User: Chuyển hướng sang VNPay / Xác nhận đơn thành công
    else Hết hàng / Tồn kho không đủ
        INV-->>SVC: Throw InsufficientStockException
        SVC-->>FE: Error 400 - "Sản phẩm đã hết hàng"
    end
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu hệ thống
- **Java**: OpenJDK 21 trở lên.
- **Maven**: 3.9+ (hoặc dùng `./mvnw` / `mvnw.cmd` trong thư mục `backend/`).
- **Node.js**: v20.x trở lên.
- **Package Manager**: `npm`.
- **Database**: PostgreSQL 17 (hoặc chạy qua Docker).
- **Docker & Docker Compose** (Tùy chọn).

---

### Phương Án 1: Chạy bằng Docker Compose (Nhanh nhất)

1. **Build file JAR cho backend**:
   ```powershell
   cd backend
   mvn -q -DskipTests package
   ```

2. **Khởi chạy container PostgreSQL & Backend**:
   ```powershell
   docker compose up --build -d
   ```
   *Backend REST API sẽ sẵn sàng tại:* `http://localhost:8080`

3. **Khởi chạy Frontend**:
   ```powershell
   cd ../frontend
   npm install
   npm run dev
   ```
   *Frontend Storefront sẽ khả dụng tại:* `http://localhost:3000` (hoặc port do Vite cấp).

---

### Phương Án 2: Chạy trực tiếp trên máy cục bộ (Local Development)

#### 1. Khởi động Backend Spring Boot:
Cần đảm bảo PostgreSQL đang chạy và đã tạo cơ sở dữ liệu `ladux`.

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_HOST="localhost"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_postgres_password"
$env:JWT_SECRET="c3VwZXItc2VjcmV0LWtleS13aXRoLW1pbmltdW0tMjU2LWJpdHMtZm9yLWp3dC1zaWduaW5n"
$env:GOOGLE_CLIENT_ID="dummy_google_client_id"
$env:GOOGLE_CLIENT_SECRET="dummy_google_client_secret"

mvn spring-boot:run
```

*Khi khởi động ở profile `dev`, Flyway sẽ tự động chạy 41 file migrations và nạp dữ liệu mẫu (devdata).*

#### 2. Khởi động Frontend React / Vite:
```powershell
cd frontend
npm install
$env:VITE_API_BASE_URL="http://localhost:8080"
npm run dev
```

---

## 🔑 Cấu Hình Biến Môi Trường

### Backend (`application.properties` / Môi trường)

| Biến Môi Trường | Bắt Bắt Buộc | Giá Trị Mặc Định | Mô Tả |
| :--- | :---: | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Không | `dev` | Profile hoạt động (`dev`, `prod`). |
| `DB_HOST` | Không | `localhost` | Địa chỉ Host PostgreSQL Database. |
| `DB_PORT` | Không | `5432` | Cổng kết nối PostgreSQL. |
| `DB_NAME` | Không | `ladux` | Tên cơ sở dữ liệu PostgreSQL. |
| `DB_USERNAME` | Không | `akira` / `postgres` | Username kết nối PostgreSQL. |
| `DB_PASSWORD` | Có | `-` | Mật khẩu truy cập PostgreSQL; production không có giá trị mặc định. |
| `JWT_SECRET` | Có | `-` | Chuỗi Base64 ký JWT (tối thiểu 256-bit). |
| `GOOGLE_CLIENT_ID` | Có (nếu dùng OAuth) | `-` | Google OAuth2 Client ID. |
| `GOOGLE_CLIENT_SECRET` | Có (nếu dùng OAuth) | `-` | Google OAuth2 Client Secret. |
| `AUTH_COOKIE_REFRESH_NAME` | Không | `REFRESH_TOKEN` | Tên cookie HttpOnly lưu refresh token storefront. |
| `ADMIN_AUTH_COOKIE_REFRESH_NAME` | Không | `ADMIN_REFRESH_TOKEN` | Tên cookie HttpOnly lưu refresh token admin. |
| `AUTH_COOKIE_REFRESH_PATH` | Không | `/api/v1/auth` | Giới hạn cookie storefront cho nhóm endpoint refresh/logout. |
| `ADMIN_AUTH_COOKIE_REFRESH_PATH` | Không | `/api/v1/admin/auth` | Giới hạn cookie admin cho nhóm endpoint refresh/logout. |
| `AUTH_COOKIE_SAME_SITE` | Không | `Strict` | Cấu hình SameSite cookie (`Strict`/`Lax`/`None`). |
| `AUTH_COOKIE_SECURE` | Không | `true` | Bắt buộc cookie refresh chỉ được gửi qua secure context. |

### Frontend (`frontend/.env`)

| Biến Môi Trường | Bắt Buộc | Giá Trị Mặc Định | Mô Tả |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Không | `http://localhost:8080` | URL REST API Backend (không kèm `/api/v1`). |

---

## 🗄️ Cơ Sở Dữ Liệu & Migrations

Dự án sử dụng **Flyway** để quản lý 41 phiên bản migration tự động tại `backend/src/main/resources/db/migration/`.

### Các sơ đồ bảng dữ liệu chính:

```text
├── Identity & Access        : users, roles, user_roles, refresh_tokens, phone_verifications, email_verifications
├── Product Catalog         : categories, brands, products, product_images, colors, product_variants, product_suppliers
├── Sales & Commerce        : carts, cart_items, orders, order_items, order_histories, coupons
├── Procurement & Inventory : suppliers, purchase_orders, purchase_order_items, stock_movements
├── Engagement & Audit      : reviews, wishlists, user_addresses, notifications, shedlock
```

---

## 🌐 Danh Sách API Chính (`/api/v1`)

### 🔑 Authentication & Profile
- `POST /api/v1/auth/register` : Đăng ký tài khoản mới.
- `POST /api/v1/auth/login` : Đăng nhập (trả access token, set refresh-token cookie).
- `POST /api/v1/auth/refresh` : Xoay refresh token và trả access token mới.
- `POST /api/v1/auth/logout` : Thu hồi phiên và xóa refresh-token cookie.
- `GET  /api/v1/users/me` : Lấy thông tin user hiện tại.

### 💻 Products & Catalog
- `GET /api/v1/products` : Lấy danh sách sản phẩm (Phân trang, Lọc, Tìm kiếm full-text).
- `GET /api/v1/products/{id}` : Lấy chi tiết sản phẩm & danh sách biến thể.
- `GET /api/v1/categories` : Lấy danh sách danh mục.
- `GET /api/v1/brands` : Lấy danh sách thương hiệu.

### 🛍️ Cart & Checkout & Orders
- `GET    /api/v1/cart` : Lấy giỏ hàng của người dùng.
- `POST   /api/v1/cart/items` : Thêm sản phẩm/biến thể vào giỏ.
- `PUT    /api/v1/cart/items/{id}` : Cập nhật số lượng item trong giỏ.
- `DELETE /api/v1/cart/items/{id}` : Xóa item khỏi giỏ hàng.
- `POST   /api/v1/orders` : Khởi tạo đơn hàng & khóa tồn kho.
- `GET    /api/v1/orders/user` : Xem danh sách đơn hàng của người dùng.

### 🛡️ Admin Operations (`/api/v1/admin/*`)
- `GET/POST/PUT/DELETE /api/v1/admin/products` : Quản lý CRUD sản phẩm.
- `GET/POST/PUT/DELETE /api/v1/admin/product-variants` : Quản lý biến thể cấu hình.
- `GET/POST/PUT /api/v1/admin/orders` : Xử lý đơn hàng & đổi trạng thái State Machine.
- `GET/POST/PUT /api/v1/admin/purchase-orders` : Quản lý đơn nhập hàng (PO) & nhận hàng.
- `GET/POST /api/v1/admin/stock-movements` : Ghi sổ cái điều chỉnh kho hàng.

---

## 📚 Tài Liệu Chi Tiết Trong `/docs`

Dự án cung cấp bộ tài liệu kỹ thuật hoàn chỉnh trong thư mục [`docs/`](file:///c:/Users/ADMIN/OneDrive/Desktop/Ladux/docs):

1. 📖 [00. Tổng quan dự án](docs/00-tong-quan-du-an.md)
2. 📂 [01. Cấu trúc thư mục](docs/01-cau-truc-thu-muc.md)
3. 🏗️ [02. Kiến trúc Backend](docs/02-kien-truc-backend.md)
4. 🔄 [03. Luồng nghiệp vụ End-to-End](docs/03-luong-nghiep-vu.md)
5. 🗃️ [04. Cơ sở dữ liệu & Các Module](docs/04-co-so-du-lieu-va-module.md)
6. 🎨 [05. Frontend & API Integration](docs/05-frontend-va-api.md)
7. 🚀 [06. Vận hành, Kiểm thử & Mở rộng](docs/06-van-hanh-kiem-thu-mo-rong.md)
8. 🎓 [07. Bài giảng Backend chi tiết](docs/07-bai-giang-backend-chi-tiet.md)

---

## 🧪 Kiểm Thử, Build & Ghi Chú Vận Hành

### 1. Build & Kiểm thử Backend
```powershell
cd backend

# Biên dịch mã nguồn
mvn clean compile

# Chạy kiểm thử tự động (yêu cầu DB hoặc test profile)
mvn test

# Đóng gói ứng dụng JAR
mvn -DskipTests package
```

### 2. Build & Kiểm tra kiểu Frontend
```powershell
cd frontend

# Kiểm tra TypeScript
npm run typecheck

# Build ứng dụng cho môi trường Production
npm run build
```

---

*Hệ thống Ladux được thiết kế tối ưu, sẵn sàng cho việc phát triển mở rộng tính năng thương mại điện tử chuyên nghiệp.*
