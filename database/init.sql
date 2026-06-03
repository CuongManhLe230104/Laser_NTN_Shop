-- =============================================
-- LASER NTN SHOP — Database Initialization
-- =============================================

SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS laser_ntn_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE laser_ntn_shop;

-- ----------------
-- Users Table
-- ----------------
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    email       VARCHAR(150)        NOT NULL UNIQUE,
    password    VARCHAR(255)        NOT NULL,
    role        ENUM('user','admin') DEFAULT 'user',
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------
-- Categories Table
-- ----------------
CREATE TABLE IF NOT EXISTS categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    slug        VARCHAR(100)        NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- ----------------
-- Products Table
-- ----------------
CREATE TABLE IF NOT EXISTS products (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    category_id   INT,
    name          VARCHAR(200)    NOT NULL,
    slug          VARCHAR(200)    NOT NULL UNIQUE,
    description   TEXT,
    price         DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
    stock         INT             NOT NULL DEFAULT 0,
    image_url     VARCHAR(500),
    is_active     BOOLEAN         DEFAULT TRUE,
    created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ----------------
-- Cart Items Table
-- ----------------
CREATE TABLE IF NOT EXISTS cart_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT             NOT NULL,
    product_id  INT             NOT NULL,
    quantity    INT             NOT NULL DEFAULT 1,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_cart_item (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ----------------
-- Orders Table
-- ----------------
CREATE TABLE IF NOT EXISTS orders (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    total_price     DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
    status          ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------
-- Order Items Table
-- ----------------
CREATE TABLE IF NOT EXISTS order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT             NOT NULL,
    product_id  INT             NOT NULL,
    quantity    INT             NOT NULL DEFAULT 1,
    unit_price  DECIMAL(10, 2)  NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- =============================================
-- SEED DATA
-- =============================================

-- Categories
INSERT INTO categories (name, slug, description) VALUES
('Quà tặng gỗ', 'qua-tang-go', 'Các sản phẩm quà tặng bằng gỗ handmade khắc laser tinh xảo'),
('Đồ dùng văn phòng', 'van-phong', 'Hộp bút, lịch để bàn và phụ kiện văn phòng gỗ tiện ích'),
('Đồ trang trí', 'trang-tri', 'Đèn ngủ, tranh gỗ và đồ trang trí khắc laser nghệ thuật'),
('Phụ kiện cá nhân', 'phu-kien', 'Móc khóa, ví da và các phụ kiện cá nhân khắc tên độc đáo');

-- Products
INSERT INTO products (category_id, name, slug, description, price, stock, image_url) VALUES
(1, 'Hộp rượu gỗ cao cấp', 'hop-ruou-go-cao-cap', 'Hộp gỗ đựng rượu vang cao cấp được cắt khắc hoa văn laser tinh xảo, thích hợp làm quà tặng sang trọng.', 350000, 50, '/hop-ruou.png'),
(1, 'Khay lịch gỗ để bàn', 'khay-lich-go-de-ban', 'Khay lịch gỗ handmade kết hợp khay đựng bút và danh thiếp tiện lợi. Hỗ trợ khắc thông tin/logo theo yêu cầu.', 180000, 30, '/khay-lich.png'),
(1, 'Hộp trà gỗ khắc hoa văn', 'hop-tra-go-khac-hoa-van', 'Hộp gỗ đựng trà cao cấp khắc hoa văn truyền thống tinh xảo, giúp bảo quản trà tốt và làm quà biếu ý nghĩa.', 150000, 40, 'https://placehold.co/400x300/1a1a2e/16213e?text=Hop+Tra+Go'),
(2, 'Hộp cắm bút gỗ khắc chữ', 'hop-cam-but-go-khac-chu', 'Hộp đựng bút bằng gỗ tự nhiên khắc câu nói truyền cảm hứng hoặc tên cá nhân. Thiết kế tinh giản, ấm áp.', 95000, 100, '/hop-but.png'),
(2, 'Sổ tay bìa gỗ khắc laser', 'so-tay-bia-go-khac-laser', 'Sổ tay bìa gỗ tự nhiên cao cấp khắc hình chân dung hoặc chữ ký cá nhân theo yêu cầu.', 120000, 60, 'https://placehold.co/400x300/1a1a2e/16213e?text=So+Tay+Bia+Go'),
(3, 'Đèn ngủ gỗ 3D khắc laser', 'den-ngu-go-3d-khac-laser', 'Đèn ngủ gỗ LED 3D khắc họa tiết chân dung hoặc phong cảnh ấm cúng, thích hợp làm quà tặng sinh nhật.', 250000, 20, 'https://placehold.co/400x300/1a1a2e/16213e?text=Den+Ngu+3D'),
(3, 'Tranh gỗ treo tường khắc laser', 'tranh-go-treo-tuong-khac-laser', 'Tranh gỗ treo tường khắc laser thư pháp hoặc danh ngôn truyền động lực. Gỗ MDF chống ẩm cao cấp.', 450000, 15, 'https://placehold.co/400x300/1a1a2e/16213e?text=Tranh+Go'),
(4, 'Móc khóa gỗ khắc tên', 'moc-khoa-go-khac-ten', 'Móc khóa gỗ handmade khắc tên và số điện thoại cá nhân hóa. Nhỏ gọn, bền bỉ và vô cùng độc đáo.', 35000, 200, '/moc-khoa.png');

-- Admin user (password: Admin@123 — hashed with bcrypt rounds 10)
-- NOTE: Trong production, hash password trước khi insert
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@laserntn.vn', '$2a$10$45KZYE8QnYazBEbczMALKu/xb6eTFDQLhhFxcE1S4nFtTVtLOH.nm', 'admin');
