require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const { connectWithRetry } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const categoryRoutes = require('./routes/category.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// MIDDLEWARE
// =============================================
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['http://localhost:3000']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// =============================================
// SWAGGER UI
// =============================================
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Laser NTN — API Docs',
    customCss: `
      .swagger-ui .topbar { background: linear-gradient(135deg, #6c63ff, #a855f7); }
      .swagger-ui .topbar-wrapper img { content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'); width: 32px; }
      .swagger-ui .info h2.title { color: #6c63ff; }
    `,
    swaggerOptions: {
      persistAuthorization: true,   // giữ token sau khi reload
      displayRequestDuration: true, // hiện thời gian response
      filter: true,                 // ô tìm kiếm endpoint
      tryItOutEnabled: true,        // mở sẵn "Try it out"
    },
  })
);

// Redirect /api-docs/ (trailing slash) -> /api-docs
app.get('/api/swagger.json', (req, res) => res.json(swaggerSpec));

// =============================================
// ROUTES
// =============================================

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Kiểm tra trạng thái server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server đang hoạt động
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 🚀 Laser NTN Shop API is running! }
 *                 timestamp: { type: string, format: date-time }
 *                 environment: { type: string, example: development }
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Laser NTN Shop API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} không tồn tại.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Lỗi server không xác định.' });
});

// =============================================
// START SERVER
// =============================================
const startServer = async () => {
  await connectWithRetry();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📋 API Health:   http://localhost:${PORT}/api/health`);
    console.log(`📖 Swagger Docs: http://localhost:${PORT}/api-docs`);
    console.log(`🌿 Environment:  ${process.env.NODE_ENV || 'development'}\n`);
  });
};

startServer();
