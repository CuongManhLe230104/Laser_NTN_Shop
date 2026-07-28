# 🔴 Laser NTN Shop

Website bán hàng sản phẩm quà tặng & đồ trang trí khắc laser chuyên nghiệp — Full-Stack với **ReactJS**, **Node.js**, **MySQL**, chạy trên **Docker**.

> Thiết kế theo phong cách **Wood Theme** (gỗ tự nhiên) — hiện đại, sang trọng, tối ưu UX với kiến trúc **Context API** và **AI Assistant**.

---

## 🏗️ Kiến trúc hệ thống

```
┌──────────────────────────────────────────────────┐
│                  Docker Compose                  │
│                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │  Frontend   │  │   Backend   │  │    DB    │ │
│  │ React+Vite  │─▶│ Node+Express│─▶│ MySQL 8  │ │
│  │ Nginx :80   │  │ Port: 5000  │  │ Port:3306│ │
│  │ →Port: 3000 │  │             │  │          │ │
│  └─────────────┘  └─────────────┘  └──────────┘ │
└──────────────────────────────────────────────────┘
```

| Service   | Công nghệ                        | Port   |
|-----------|----------------------------------|--------|
| Frontend  | ReactJS 18 + Vite + Nginx        | `3000` |
| Backend   | Node.js 18 + Express + JWT       | `5000` |
| Database  | MySQL 8.0                        | `3308` |

---

## 🚀 Khởi động nhanh

### Yêu cầu
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã được cài và đang chạy
- Google OAuth 2.0 Client ID (nếu dùng đăng nhập Google)

### Bước 1: Clone hoặc vào thư mục project
```bash
cd Laser_NTN_Shop
```

### Bước 2: Cấu hình biến môi trường
Chỉnh sửa file `.env` ở thư mục root:
```env
# MySQL
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=laser_ntn_shop
MYSQL_USER=appuser
MYSQL_PASSWORD=apppassword123

# Backend
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
BACKEND_PORT=5000

# Google OAuth 2.0 (tuỳ chọn)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Gemini AI / OpenRouter
GEMINI_API_KEY=sk-or-v1-...
```

> ⚠️ Tạo file `frontend/.env` với `VITE_GOOGLE_CLIENT_ID` để Vite đọc khi build trong Docker.

### Bước 3: Build và khởi động tất cả services
```bash
docker-compose up --build
```

### Bước 4: Truy cập
| URL | Mô tả |
|-----|-------|
| http://localhost:3000 | 🌐 Website (Frontend) |
| http://localhost:3000/admin | 🔧 Trang quản trị (Admin) |
| http://localhost:5000/api/health | 🟢 Backend Health Check |
| http://localhost:5000/api-docs | 📖 Swagger API Docs |
| localhost:3308 | 🗄️ MySQL (dùng MySQL Workbench / DBeaver) |

---

## 📁 Cấu trúc thư mục Nâng Cao (ReactJS + Node.js)

```
Laser_NTN_Shop/
├── 📄 docker-compose.yml         # Orchestrate tất cả services
├── 📄 .env                       # Biến môi trường (root)
├── 📄 .gitignore
├── 📄 README.md
│
├── 🌐 frontend/                  # ReactJS (Vite + Nginx)
│   ├── Dockerfile                # Multi-stage: Node build → Nginx serve
│   ├── nginx.conf                # Nginx reverse proxy config
│   ├── .env                      # VITE_ vars cho Docker build
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx              # Entry point + Multi-Provider (Auth, Cart, Toast, GoogleOAuth)
│       ├── App.jsx               # Router + Protected Routes + Admin Layouts
│       ├── context/              # Context API quản lý State toàn cục
│       │   ├── AuthContext.jsx   # Quản lý login, logout, token & user role
│       │   ├── CartContext.jsx   # Quản lý giỏ hàng real-time & badge counter
│       │   └── ToastContext.jsx  # Hệ thống thông báo nổi (Toast Notification)
│       ├── utils/
│       │   └── formatPrice.js    # Chuẩn hóa hiển thị tiền tệ (VD: 100.000 VNĐ)
│       ├── styles/               # Quản lý CSS tập trung theo phân hệ
│       │   ├── index.css         # Global variables & reset CSS
│       │   ├── admin/            # CSS trang quản trị
│       │   ├── components/       # CSS các component dùng chung (Navbar, Footer, Card, Chat)
│       │   ├── context/          # CSS cho Toast notification
│       │   └── pages/            # CSS cho từng trang giao diện
│       ├── components/           # UI Components tái sử dụng
│       │   ├── Navbar.jsx        # Thanh điều hướng + Badge giỏ hàng real-time
│       │   ├── Footer.jsx
│       │   ├── ProductCard.jsx
│       │   ├── ProductBanner.jsx
│       │   └── ChatWidget.jsx    # Chatbot tư vấn AI + Markdown parser
│       ├── pages/                # Các trang chính của người dùng
│       │   ├── Home.jsx          # Trang chủ
│       │   ├── Products.jsx      # Danh sách sản phẩm (tìm kiếm, lọc)
│       │   ├── ProductDetail.jsx # Chi tiết sản phẩm, gallery, đánh giá
│       │   ├── Login.jsx         # Đăng nhập / Đăng ký + Google OAuth 2.0
│       │   ├── Cart.jsx          # Quản lý giỏ hàng
│       │   ├── Checkout.jsx      # Thanh toán & đặt hàng
│       │   ├── Orders.jsx        # Theo dõi lịch sử đơn hàng
│       │   └── CustomOrder.jsx   # Đặt hàng khắc laser theo yêu cầu
│       ├── admin/                # Phân hệ quản trị Admin Dashboard
│       │   ├── AdminLayout.jsx
│       │   ├── AdminSidebar.jsx
│       │   ├── AdminTopbar.jsx
│       │   ├── AdminDashboard.jsx # Thống kê nhanh
│       │   ├── AdminProducts.jsx  # Quản lý sản phẩm & Upload nhiều ảnh
│       │   ├── AdminCategories.jsx# Quản lý danh mục
│       │   ├── AdminOrders.jsx    # Xử lý đơn hàng
│       │   ├── AdminUsers.jsx     # Quản lý người dùng & phân quyền
│       │   ├── AdminAnalytics.jsx # Thống kê doanh thu & AI Phân tích phản hồi
│       │   ├── AdminChat.jsx      # Chat trực tiếp với khách hàng
│       │   └── AdminSettings.jsx  # Cài đặt hệ thống
│       └── services/
│           └── api.js            # Axios Interceptors & API Client
│
├── ⚙️ backend/                   # Node.js (Express RESTful API)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js             # Express Server + Swagger Docs
│       ├── config/
│       │   └── db.js             # MySQL Connection Pool & Auto Migrations
│       ├── routes/               # Express Routers
│       │   ├── auth.routes.js
│       │   ├── product.routes.js
│       │   ├── category.routes.js
│       │   ├── cart.routes.js
│       │   ├── order.routes.js
│       │   ├── chat.routes.js
│       │   └── admin.routes.js
│       ├── controllers/          # Request Handlers & Business Logic
│       │   ├── auth.controller.js
│       │   ├── product.controller.js
│       │   ├── category.controller.js
│       │   ├── cart.controller.js
│       │   ├── order.controller.js
│       │   ├── chat.controller.js
│       │   ├── review.controller.js
│       │   └── admin.controller.js
│       ├── services/
│       │   └── gemini.service.js # Tích hợp Gemini AI / OpenRouter
│       └── middleware/
│           ├── auth.middleware.js # JWT & Role authorization
│           └── upload.middleware.js # Multer file upload
│
├── 🗄️ database/
│   └── init.sql                  # MySQL Schema & Seed Data
│
└── 📁 uploads/                   # Thư mục lưu trữ ảnh sản phẩm upload
```

---

## 🔌 API Endpoints chính

### Authentication — `/api/auth`
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới | — |
| POST | `/api/auth/login` | Đăng nhập bằng email/mật khẩu | — |
| POST | `/api/auth/google` | Đăng nhập bằng Google OAuth | — |
| GET  | `/api/auth/me` | Thông tin tài khoản hiện tại | JWT |

### Products & Reviews — `/api/products`
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/products` | Danh sách sản phẩm (tìm kiếm, lọc, phân trang) | — |
| GET | `/api/products/:slug` | Chi tiết sản phẩm | — |
| GET | `/api/products/categories` | Danh mục sản phẩm | — |
| POST | `/api/products` | Tạo sản phẩm mới | Admin |
| PUT | `/api/products/:id` | Cập nhật sản phẩm | Admin |
| DELETE | `/api/products/:id` | Xóa sản phẩm | Admin |
| GET | `/api/products/:id/reviews` | Danh sách đánh giá & sao trung bình | — |
| POST | `/api/products/:id/reviews` | Gửi đánh giá mới (1-5⭐ kèm bình luận) | JWT |

### Cart — `/api/cart`
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/cart` | Lấy danh sách giỏ hàng | JWT |
| POST | `/api/cart` | Thêm sản phẩm vào giỏ | JWT |
| PUT | `/api/cart/:id` | Cập nhật số lượng | JWT |
| DELETE | `/api/cart/:id` | Xóa 1 sản phẩm khỏi giỏ | JWT |
| DELETE | `/api/cart` | Xóa toàn bộ giỏ hàng | JWT |

### Orders — `/api/orders`
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/orders` | Danh sách đơn hàng cá nhân | JWT |
| POST | `/api/orders` | Đặt hàng | JWT |
| GET | `/api/orders/admin` | Quản lý tất cả đơn hàng | Admin |
| PUT | `/api/orders/:id/status` | Cập nhật trạng thái đơn hàng | Admin |

### Admin & AI Analytics — `/api/admin`
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/admin/stats` | Thống kê tổng quan | Admin |
| GET | `/api/admin/users` | Quản lý tài khoản người dùng | Admin |
| POST | `/api/admin/upload` | Upload ảnh sản phẩm | Admin |
| GET | `/api/admin/reviews/ai-analysis` | **AI Phân tích phản hồi & đánh giá khách hàng** | Admin |

---

## 🎨 Tính năng nổi bật

### 👤 Trải nghiệm Khách hàng
- ✅ Đăng ký / Đăng nhập nhanh bằng **Google OAuth 2.0** hoặc Email/Password.
- ✅ **Kiến trúc Context API**: Đồng bộ trạng thái Auth và Cart toàn ứng dụng tức thì.
- ✅ **Badge giỏ hàng Real-time**: Huy hiệu tròn màu nâu nổi bật đếm số lượng giỏ hàng trên Navbar với hiệu ứng `pop-animation` sống động.
- ✅ **Hệ thống Toast Notification**: Thông báo nổi Glassmorphic tức thì khi thực hiện các thao tác (Thêm giỏ hàng, Đăng nhập, Báo lỗi).
- ✅ **Đánh giá & Bình luận sản phẩm**: Gửi đánh giá 1–5⭐ kèm nhận xét thực tế trên trang chi tiết.
- ✅ **Chuẩn hóa giá tiền**: Hiển thị định dạng thống nhất `100.000 VNĐ`.
- ✅ **Đặt hàng thiết kế riêng**: Gửi thông tin gia công laser theo yêu cầu (Custom Order).
- ✅ **Chatbot tự động (NTN Laser Bot)**: Tự động trả lời thắc mắc sản phẩm, báo giá, tồn kho theo thời gian thực (hỗ trợ văn bản thuần, không dính ký tự markdown rác).

### 🔧 Quản trị viên (Admin)
- ✅ Dashboard quản trị thiết kế sang trọng với Dark/Light sidebar.
- ✅ Quản lý sản phẩm: CRUD, tải lên ảnh đại diện và **nhiều ảnh chi tiết (extra images)**.
- ✅ Xử lý đơn hàng: Đổi trạng thái (Chờ xử lý, Đang giao, Đã giao, Hủy đơn).
- ✅ Quản lý tài khoản người dùng & phân quyền vai trò (Admin / User).
- ✅ **Bảng điều khiển AI Phân tích phản hồi**: Tổng hợp đánh giá sản phẩm của người dùng và gọi Gemini AI để phân tích điểm mạnh, điểm yếu, dự báo xu hướng sản phẩm cần bán chạy.
- ✅ **Chat trực tiếp với Khách hàng**: Hỗ trợ tư vấn trực tuyến và có thể bật/tắt Bot tự động cho từng cuộc trò chuyện.

---

## 🛠️ Lệnh Docker hữu ích

```bash
# Rebuild và khởi động lại toàn bộ services
docker-compose up --build -d

# Force rebuild Frontend không dùng cache (khi thay đổi mã nguồn ReactJS/CSS)
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Xem logs real-time của backend
docker-compose logs -f backend

# Dừng tất cả dịch vụ
docker-compose down
```

---

## 🔐 Tài khoản mặc định

| Role  | Email                | Password    |
|-------|----------------------|-------------|
| Admin | admin@laserntn.vn    | `Admin@123` |

---

## 🌐 Lưu ý Cấu hình Google OAuth khi Host lên Domain khác

Khi bạn deploy ứng dụng lên domain khác (DevTunnels, Vercel, VPS, v.v.), nếu gặp lỗi `Error 400: origin_mismatch`:
1. Truy cập [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Thêm domain mới vào cả **Authorized JavaScript origins** và **Authorized redirect URIs** (Ví dụ: `https://your-domain.devtunnels.ms`).
3. Nhấn **Save** và đợi 1–5 phút để Google áp dụng thay đổi.

---

*Made with ❤️ in Vietnam — Laser NTN Shop*