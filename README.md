# 🔴 Laser NTN Shop

Website bán hàng máy laser chuyên nghiệp — Full-Stack với **ReactJS**, **Node.js**, **MySQL**, chạy trên **Docker**.

---

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────┐
│              Docker Compose                 │
│                                             │
│  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │ Frontend  │  │  Backend  │  │   DB    │ │
│  │ React+Vite│─▶│ Node+Expr │─▶│ MySQL   │ │
│  │ Nginx:80  │  │ Port:5000 │  │ Port:33 │ │
│  │ →Port:3000│  │           │  │   06    │ │
│  └───────────┘  └───────────┘  └─────────┘ │
└─────────────────────────────────────────────┘
```

| Service | Công nghệ | Port |
|---------|-----------|------|
| Frontend | ReactJS 18 + Vite + Nginx | `3000` |
| Backend | Node.js 18 + Express + JWT | `5000` |
| Database | MySQL 8.0 | `3306` |

---

## 🚀 Khởi động nhanh

### Yêu cầu
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã được cài đặt và đang chạy

### Bước 1: Clone hoặc vào thư mục project
```bash
cd Laser_NTN_Shop
```

### Bước 2: Build và khởi động tất cả services
```bash
docker-compose up --build
```

### Bước 3: Truy cập
| URL | Mô tả |
|-----|-------|
| http://localhost:3000 | 🌐 Frontend (Website) |
| http://localhost:5000/api/health | 🟢 Backend Health Check |
| http://localhost:3306 | 🗄️ MySQL (dùng MySQL Workbench) |

---

## 📁 Cấu trúc thư mục

```
Laser_NTN_Shop/
├── 📄 docker-compose.yml       # Orchestrate tất cả services
├── 📄 .env                     # Biến môi trường
├── 📄 .gitignore
├── 📄 README.md
│
├── 🌐 frontend/                # ReactJS (Vite + Nginx)
│   ├── Dockerfile              # Multi-stage build
│   ├── nginx.conf              # Nginx reverse proxy
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # Router + Protected Routes
│       ├── index.css           # Global styles (Dark mode)
│       ├── components/
│       │   ├── Navbar.jsx/.css
│       │   ├── ProductCard.jsx/.css
│       │   └── Footer.jsx/.css
│       ├── pages/
│       │   ├── Home.jsx/.css
│       │   ├── Products.jsx/.css
│       │   ├── Login.jsx/.css
│       │   └── Cart.jsx/.css
│       └── services/
│           └── api.js          # Axios + interceptors
│
├── ⚙️ backend/                 # Node.js (Express)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js           # Entry point
│       ├── config/
│       │   └── db.js           # MySQL pool + retry
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── product.routes.js
│       │   └── cart.routes.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── product.controller.js
│       │   └── cart.controller.js
│       └── middleware/
│           └── auth.middleware.js  # JWT guard
│
└── 🗄️ database/
    └── init.sql                # Schema + 10 sản phẩm mẫu
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/auth/me` | Lấy thông tin user (cần JWT) |

### Products
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Danh sách sản phẩm (có phân trang, tìm kiếm) |
| GET | `/api/products/:slug` | Chi tiết sản phẩm |
| GET | `/api/products/categories` | Danh mục sản phẩm |

### Cart (cần đăng nhập)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/cart` | Xem giỏ hàng |
| POST | `/api/cart` | Thêm sản phẩm |
| PUT | `/api/cart/:id` | Cập nhật số lượng |
| DELETE | `/api/cart/:id` | Xóa 1 sản phẩm |
| DELETE | `/api/cart` | Xóa toàn bộ giỏ hàng |

---

## 🛠️ Lệnh Docker hữu ích

```bash
# Khởi động (có build)
docker-compose up --build

# Khởi động nền (background)
docker-compose up -d --build

# Xem logs real-time
docker-compose logs -f

# Xem log từng service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Dừng tất cả
docker-compose down

# Dừng + xóa volume (reset database)
docker-compose down -v

# Rebuild 1 service
docker-compose up --build backend
```

---

## 🔐 Tài khoản mặc định

> ⚠️ Thay đổi mật khẩu ngay sau khi deploy!

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@laserntn.vn | `password` |

---

## 🎨 Tính năng

- ✅ Dark mode + Glassmorphism design
- ✅ Trang chủ với Hero, Stats, Features
- ✅ Danh sách sản phẩm có tìm kiếm + lọc danh mục + phân trang
- ✅ Đăng ký / Đăng nhập với JWT
- ✅ Giỏ hàng (CRUD) — cần đăng nhập
- ✅ Responsive cho mobile
- ✅ React Router v6 với Protected Routes
- ✅ MySQL schema với 5 bảng + seed data
- ✅ Docker Compose orchestration
- ✅ Nginx reverse proxy + gzip

---

## 📝 Môi trường

Chỉnh sửa file `.env` ở root để thay đổi:

```env
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=laser_ntn_shop
MYSQL_USER=appuser
MYSQL_PASSWORD=apppassword123
JWT_SECRET=laser_ntn_super_secret_jwt_key_2024
```

---

*Made with ❤️ in Vietnam — Laser NTN Shop*