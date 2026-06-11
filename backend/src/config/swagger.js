const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '⚡ Laser NTN Shop — API Documentation',
      version: '1.0.0',
      description: `
API backend cho website bán máy laser chuyên nghiệp **Laser NTN Shop**.

## Authentication
Các endpoint có 🔒 yêu cầu **JWT Bearer Token**.

1. Đăng nhập tại \`POST /api/auth/login\`
2. Copy \`token\` từ response
3. Click nút **Authorize** (🔒) ở trên góc phải
4. Nhập: \`Bearer <token>\`
      `,
      contact: {
        name: 'Laser NTN Shop',
        email: 'info@laserntn.vn',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: '🐳 Docker Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token theo format: Bearer <token>',
        },
      },
      schemas: {
        // ---- User ----
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Nguyễn Văn A' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        // ---- Product ----
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Máy Laser CO2 60W' },
            slug: { type: 'string', example: 'may-laser-co2-60w' },
            description: { type: 'string', example: 'Máy laser CO2 công suất 60W...' },
            price: { type: 'number', format: 'float', example: 25000000 },
            stock: { type: 'integer', example: 15 },
            image_url: { type: 'string', example: 'https://example.com/image.jpg' },
            category_name: { type: 'string', example: 'Máy Laser' },
            category_slug: { type: 'string', example: 'may-laser' },
          },
        },
        // ---- Category ----
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Máy Laser' },
            slug: { type: 'string', example: 'may-laser' },
            description: { type: 'string', example: 'Các loại máy laser chuyên nghiệp' },
            product_count: { type: 'integer', example: 4 },
          },
        },
        // ---- Cart Item ----
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            product_id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Máy Laser CO2 60W' },
            slug: { type: 'string', example: 'may-laser-co2-60w' },
            price: { type: 'number', example: 25000000 },
            quantity: { type: 'integer', example: 2 },
            image_url: { type: 'string', example: 'https://example.com/image.jpg' },
          },
        },
        // ---- Pagination ----
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 12 },
            total: { type: 'integer', example: 50 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
        // ---- Responses ----
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Thành công' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Đã xảy ra lỗi' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Kiểm tra trạng thái server' },
      { name: 'Auth', description: 'Đăng ký, đăng nhập, thông tin tài khoản' },
      { name: 'Products', description: 'Danh sách và chi tiết sản phẩm' },
      { name: 'Categories', description: 'Quản lý danh mục sản phẩm (CRUD)' },
      { name: 'Cart', description: 'Quản lý giỏ hàng (cần đăng nhập 🔒)' },
    ],
  },
  apis: ['./src/routes/*.js', './src/server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
