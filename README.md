# Student Management System

## Cài đặt

### 1. MySQL
```bash
mysql -u root -p < database/init.sql
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
copy .env.example .env   # chỉnh DB_PASSWORD
python app.py
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Mở http://localhost:5173

## API
- `GET/POST /api/students` - Danh sách / Thêm
- `GET/PUT/DELETE /api/students/:id` - Chi tiết / Sửa / Xóa
- `GET /api/stats` - Thống kê
- `GET /api/classes` - Danh sách lớp
