# 🔴 Laser NTN Shop

Website bán hàng máy laser chuyên nghiệp — Full-Stack với **ReactJS**, **Node.js**, **MySQL**, chạy trên **Docker**.

> Thiết kế theo phong cách **Wood Theme** (gỗ tự nhiên) — hiện đại, sang trọng, tối ưu UX.

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

## 📁 Cấu trúc thư mục

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
│       ├── main.jsx              # Entry point + GoogleOAuthProvider
│       ├── App.jsx               # Router + Protected Routes
│       ├── index.css             # Global styles + CSS variables
│       ├── components/
│       │   ├── Navbar.jsx/.css
│       │   ├── Footer.jsx/.css
│       │   ├── ProductCard.jsx/.css
│       │   └── ChatWidget.jsx/.css  # Chat hỗ trợ trực tuyến
│       ├── pages/
│       │   ├── Home.jsx/.css        # Trang chủ (Hero, Stats, Features)
│       │   ├── Products.jsx/.css    # Danh sách sản phẩm
│       │   ├── ProductDetail.jsx/.css # Chi tiết sản phẩm + ảnh slideshow
│       │   ├── Login.jsx/.css       # Đăng nhập / Đăng ký + Google OAuth
│       │   ├── Cart.jsx/.css        # Giỏ hàng
│       │   ├── Checkout.jsx/.css    # Thanh toán
│       │   ├── Orders.jsx/.css      # Lịch sử đơn hàng
│       │   └── CustomOrder.jsx/.css # Đặt hàng thiết kế riêng
│       ├── admin/
│       │   ├── AdminLayout.jsx      # Layout admin (Sidebar + Topbar)
│       │   ├── AdminSidebar.jsx     # Menu điều hướng admin
│       │   ├── AdminDashboard.jsx   # Thống kê tổng quan
│       │   ├── AdminProducts.jsx    # Quản lý sản phẩm + upload ảnh
│       │   ├── AdminCategories.jsx  # Quản lý danh mục
│       │   ├── AdminOrders.jsx      # Quản lý đơn hàng
│       │   ├── AdminUsers.jsx       # Quản lý người dùng
│       │   ├── AdminAnalytics.jsx   # Báo cáo doanh thu
│       │   ├── AdminChat.jsx        # Chat hỗ trợ real-time
│       │   └── AdminSettings.jsx    # Cài đặt hệ thống
│       └── services/
│           └── api.js              # Axios + interceptors + all API methods
│
├── ⚙️ backend/                   # Node.js (Express)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js             # Entry point + Swagger + static files
│       ├── config/
│       │   └── db.js             # MySQL pool + retry + auto migrations
│       ├── routes/
│       │   ├── auth.routes.js    # /api/auth
│       │   ├── product.routes.js # /api/products
│       │   ├── category.routes.js# /api/categories
│       │   ├── cart.routes.js    # /api/cart
│       │   ├── order.routes.js   # /api/orders
│       │   ├── chat.routes.js    # /api/chat
│       │   └── admin.routes.js   # /api/admin
│       ├── controllers/
│       │   ├── auth.controller.js      # Register, Login, Google OAuth
│       │   ├── product.controller.js   # CRUD + tìm kiếm + phân trang
│       │   ├── category.controller.js  # Quản lý danh mục
│       │   ├── cart.controller.js      # Giỏ hàng
│       │   ├── order.controller.js     # Đơn hàng + thống kê
│       │   ├── chat.controller.js      # Chat hỗ trợ
│       │   └── admin.controller.js     # Dashboard + upload ảnh
│       └── middleware/
│           ├── auth.middleware.js      # JWT verify + role check
│           └── upload.middleware.js    # Multer file upload
│
├── 🗄️ database/
│   └── init.sql                  # Schema + dữ liệu mẫu
│
└── 📁 uploads/                   # Ảnh sản phẩm upload (tự tạo)
```

---

## 🔌 API Endpoints

### Authentication — `/api/auth`
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới | — |
| POST | `/api/auth/login` | Đăng nhập bằng email/mật khẩu | — |
| POST | `/api/auth/google` | Đăng nhập bằng Google OAuth | — |
| GET  | `/api/auth/me` | Thông tin tài khoản hiện tại | JWT |

### Products — `/api/products`
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/products` | Danh sách (tìm kiếm, lọc, phân trang) | — |
| GET | `/api/products/:slug` | Chi tiết sản phẩm | — |
| GET | `/api/products/categories` | Danh mục sản phẩm | — |
| POST | `/api/products` | Tạo sản phẩm mới | Admin |
| PUT | `/api/products/:id` | Cập nhật sản phẩm | Admin |
| DELETE | `/api/products/:id` | Xóa sản phẩm | Admin |
| GET | `/api/products/:id/reviews` | Lấy danh sách đánh giá của sản phẩm | — |
| POST | `/api/products/:id/reviews` | Gửi đánh giá mới (giới hạn 1 lần/user) | JWT |

### Cart — `/api/cart`
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/cart` | Xem giỏ hàng | JWT |
| POST | `/api/cart` | Thêm sản phẩm vào giỏ | JWT |
| PUT | `/api/cart/:id` | Cập nhật số lượng | JWT |
| DELETE | `/api/cart/:id` | Xóa 1 sản phẩm | JWT |
| DELETE | `/api/cart` | Xóa toàn bộ giỏ hàng | JWT |

### Orders — `/api/orders`
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/orders` | Đơn hàng của tôi | JWT |
| POST | `/api/orders` | Đặt hàng | JWT |
| GET | `/api/orders/admin` | Tất cả đơn hàng | Admin |
| PUT | `/api/orders/:id/status` | Cập nhật trạng thái | Admin |

### Admin — `/api/admin`
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/admin/stats` | Thống kê dashboard | Admin |
| GET | `/api/admin/products` | Danh sách sản phẩm (admin) | Admin |
| GET | `/api/admin/users` | Danh sách người dùng | Admin |
| PUT | `/api/admin/users/:id/role` | Thay đổi role user | Admin |
| DELETE | `/api/admin/users/:id` | Xóa user | Admin |
| POST | `/api/admin/upload` | Upload 1 ảnh sản phẩm | Admin |
| POST | `/api/admin/upload-multiple` | Upload nhiều ảnh | Admin |
| GET | `/api/admin/reviews/ai-analysis` | Chạy AI phân tích xu hướng phản hồi | Admin |

### Chat — `/api/chat`
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/chat/conversations` | Danh sách cuộc trò chuyện | JWT |
| POST | `/api/chat/messages` | Gửi tin nhắn | JWT |
| GET | `/api/chat/messages` | Lịch sử tin nhắn | JWT |

---

## 🎨 Tính năng nổi bật

### 👤 Người dùng
- ✅ Đăng ký / Đăng nhập bằng email + mật khẩu
- ✅ **Đăng nhập bằng Google OAuth 2.0**
- ✅ Xem danh sách sản phẩm — tìm kiếm, lọc danh mục, phân trang
- ✅ Trang chi tiết sản phẩm với **slideshow ảnh tự động**
- ✅ **Hệ thống đánh giá sản phẩm**: Xem điểm trung bình sao, số lượng đánh giá và gửi đánh giá (1-5⭐ kèm bình luận) trực tiếp trên trang chi tiết sản phẩm (Giới hạn 1 đánh giá/người dùng/sản phẩm)
- ✅ Giỏ hàng (thêm, sửa số lượng, xóa)
- ✅ Checkout & đặt hàng
- ✅ Xem lịch sử đơn hàng
- ✅ Đặt hàng thiết kế riêng (Custom Order)
- ✅ Chat hỗ trợ trực tuyến với Admin

### 🔧 Quản trị (Admin)
- ✅ Dashboard thống kê: doanh thu, đơn hàng, người dùng, sản phẩm
- ✅ Quản lý sản phẩm: thêm, sửa, xóa, **upload ảnh trực tiếp từ máy**
- ✅ Quản lý nhiều ảnh chi tiết sản phẩm
- ✅ Quản lý danh mục sản phẩm
- ✅ Quản lý đơn hàng: xem, cập nhật trạng thái
- ✅ Quản lý người dùng: xem, thay đổi role, xóa
- ✅ Báo cáo doanh thu theo thời gian
- ✅ Chat hỗ trợ real-time với khách hàng
- ✅ **AI Phân tích phản hồi khách hàng**: Nút phân tích AI ở trang Thống kê giúp đọc toàn bộ đánh giá của khách hàng, tạo báo cáo phân tích tự động (tổng quan hài lòng, điểm mạnh, điểm yếu cần cải tiến, đề xuất và dự báo xu hướng sản phẩm yêu thích) dạng Markdown
- ✅ **Tự động trả lời Chat bằng AI (NTN Laser Bot)**: Bot tự động trả lời tư vấn khách hàng dựa trên lịch sử chat và danh sách sản phẩm thực tế trong cửa hàng khi admin offline

### 🎨 Giao diện
- ✅ **Wood Theme** — bảng màu nâu gỗ sang trọng
- ✅ Glassmorphism design
- ✅ Micro-animations và hover effects
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Google Fonts (Outfit, Inter)

---

## 🛠️ Lệnh Docker hữu ích

```bash
# Khởi động (có build)
docker-compose up --build

# Khởi động nền
docker-compose up --build -d

# Xem logs real-time
docker-compose logs -f

# Xem log từng service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Dừng tất cả
docker-compose down

# Dừng + xóa anonymous volumes (reset node_modules trong container)
docker-compose down -v

# Force rebuild không dùng cache (khi thêm package mới)
docker-compose build --no-cache backend
docker-compose build --no-cache frontend

# Rebuild và khởi động lại
docker-compose up --build -d

# Kiểm tra backend logs
docker logs laser_ntn_backend --tail 20
```

---

## 🔐 Tài khoản mặc định

> ⚠️ **Hãy thay đổi mật khẩu ngay sau khi deploy lên production!**

| Role  | Email                | Password   |
|-------|----------------------|------------|
| Admin | admin@laserntn.vn    | `Admin@123` |

---

## 🌐 Cấu hình Google OAuth (tuỳ chọn)

Để bật tính năng **Đăng nhập bằng Google**:

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. **Authorized JavaScript origins**: `http://localhost:3000`, `http://localhost:3001`
5. Sao chép **Client ID** và **Client Secret**
6. Điền vào `.env` và `frontend/.env`
7. Rebuild Docker: `docker-compose build --no-cache; docker-compose up -d`

---

## 🗄️ Database Schema

| Bảng | Mô tả |
|------|-------|
| `users` | Người dùng (id, name, email, password, google_id, avatar, role) |
| `categories` | Danh mục sản phẩm |
| `products` | Sản phẩm (id, name, slug, price, image, extra_images, ...) |
| `product_reviews` | Đánh giá sản phẩm (id, product_id, user_id, rating, comment, created_at) |
| `cart_items` | Giỏ hàng |
| `orders` | Đơn hàng |
| `order_items` | Chi tiết đơn hàng |
| `chat_conversations` | Cuộc trò chuyện |
| `chat_messages` | Tin nhắn chat |

---

## 📝 Biến môi trường đầy đủ

```env
# =============================================
# LASER NTN SHOP — Environment Variables
# =============================================

# MySQL Configuration
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=laser_ntn_shop
MYSQL_USER=appuser
MYSQL_PASSWORD=apppassword123

# Backend Configuration
NODE_ENV=development
JWT_SECRET=laser_ntn_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
BACKEND_PORT=5000

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend Configuration
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Gemini AI / OpenRouter Configuration
GEMINI_API_KEY=your_gemini_api_key_or_openrouter_key
```

---

*Made with ❤️ in Vietnam — Laser NTN Shop*