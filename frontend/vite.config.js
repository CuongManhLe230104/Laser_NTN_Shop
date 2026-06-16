import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,    // luôn dùng port 3000, báo lỗi nếu bị chiếm (tránh chạy 2 host)
    proxy: {
      '/api': {
        // Khi chạy npm run dev trực tiếp → backend ở localhost:5000
        // Khi chạy trong Docker → Nginx xử lý proxy, file này không được dùng
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})

