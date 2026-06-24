import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 3001, // Đảm bảo khớp với cổng chạy trong container của bạn (thường là 3001 hoặc giữ nguyên nếu chạy lệnh preview)
    host: true, // Ép Vite lắng nghe trên toàn mạng Docker
    proxy: { 
      '/api': {
        target: 'http://student-backend:5000',
        changeOrigin: true,
        secure: false
      }
    } 
  }
})