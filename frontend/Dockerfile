FROM node:18-alpine

WORKDIR /app

# Copy package files và cài đặt thư viện
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn frontend vào container
COPY . .

# Mở cổng và cấu hình ép Vite chạy ở cổng 3001, cho phép truy cập từ bên ngoài (--host)
EXPOSE 3001
CMD ["npm", "run", "dev", "--", "--port", "3001", "--host"]