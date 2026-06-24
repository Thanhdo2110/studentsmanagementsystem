# 🎓 Student Management System

Dự án Hệ thống Quản lý Sinh viên toàn diện được đóng gói hoàn toàn bằng **Docker**, tích hợp hệ thống Reverse Proxy **Nginx**, chứng chỉ bảo mật **SSL (HTTPS)**, và tự động hóa quy trình triển khai thông qua pipeline **CI/CD (GitHub Actions / GitLab CI)** lên đám mây **AWS EC2**.

---

## 🏗️ Kiến Trúc Hệ Thống (Architecture)

Hệ thống được xây dựng dựa trên kiến trúc Microservices phân lớp, đảm bảo tính đóng gói và khả năng mở rộng:

* **Frontend**: React (Vite) - Cổng nội bộ `3001`
* **Backend**: Flask (Python) - Cổng nội bộ `5000`
* **Database**: MySQL 8.0 - Cổng nội bộ `3306` (Ánh xạ ra ngoài qua `3307`)
* **Reverse Proxy & SSL**: Nginx - Lắng nghe cổng tiêu chuẩn `80` (HTTP) và `443` (HTTPS)

---

## 🚀 Tính Năng Nổi Bật

- [x] **Containerization**: Toàn bộ ứng dụng chạy cô lập trong môi trường Docker giúp dễ dàng triển khai mọi nơi.
- [x] **Reverse Proxy & Load Balancing**: Nginx đóng vai trò tiếp nhận và điều hướng toàn bộ request bảo mật.
- [x] **Auto HTTPS**: Tự động cấu hình chứng chỉ SSL và cấu hình ép chuyển hướng (Redirect 301) từ HTTP sang HTTPS.
- [x] **Vite Allowed Hosts**: Cấu hình chống tấn công DNS Rebinding nhưng vẫn mở thông suốt cho tên miền cá nhân.
- [x] **Full-Automation CI/CD**: Tự động chạy kiểm thử, build image và cập nhật code trực tiếp lên AWS EC2 khi `git push`.

---

## 🛠️ Yêu Cầu Hệ Thống (Prerequisites)

Trước khi khởi chạy hệ thống, hãy đảm bảo máy chủ/máy cá nhân đã cài đặt:
* Docker & Docker Compose (v2.x trở lên)
* Git

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
studentsmanagementsystem/
├── .github/
│   └── workflows/
│       └── cicd.yml           # Kịch bản GitHub Actions (Nếu dùng GitHub)
├── .gitlab-ci.yml             # Kịch bản GitLab CI/CD (Nếu dùng GitLab)
├── backend/                   # Mã nguồn Python Flask API
│   ├── app.py
│   └── requirements.txt
├── frontend/                  # Mã nguồn React UI (Vite)
│   ├── src/
│   ├── vite.config.js         # Cấu hình cổng 3001 & allowedHosts
│   └── package.json
├── nginx/                     # Cấu hình Web Server Nginx
│   ├── default.conf           # File định tuyến proxy_pass & SSL
│   └── ssl/                   # Thư mục chứa chứng chỉ ssl (nginx.crt, nginx.key)
└── docker-compose.yml         # File điều phối toàn bộ các container

💻 Hướng Dẫn Cài Đặt và Khởi Chạy (Local / Server)Bước 1: Clone dự án về máyBashgit clone [https://github.com/Thanhdo2110/studentsmanagementsystem.git](https://github.com/Thanhdo2110/studentsmanagementsystem.git)
cd studentsmanagementsystem


Bước 2: 
Chuẩn bị chứng chỉ SSL (Dành cho môi trường Production)
Tạo thư mục SSL và tạo chứng chỉ Self-signed (hoặc thay thế bằng file chứng chỉ từ Let's Encrypt / Certbot của bạn):
Bash mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/nginx.key \
  -out nginx/ssl/nginx.crt


Bước 3: Khởi chạy hệ thống bằng Docker ComposeBiên dịch lại toàn bộ mã nguồn của Frontend/Backend và kích hoạt 
các container chạy ngầm:Bashsudo docker compose up -d --build
Bước 4: Kiểm tra trạng thái các dịch vụBashsudo docker compose ps
Đảm bảo các dịch vụ student-nginx-proxy, student-flask-backend, student-react-frontend, và student-mysql-db đều 
ở trạng thái Up hoặc healthy.


⚙️ Cấu Hình Môi Trường Triển Khai (CI/CD Deployment)Dự án này hỗ trợ cơ chế tự động deploy lên AWS EC2. 

Để kích hoạt, bạn cần cấu hình các biến sau vào mục Settings > Secrets / Variables của GitHub hoặc GitLab:EC2_HOST: 
Địa chỉ Elastic IP của máy chủ AWS EC2.EC2_USERNAME: Username mặc định (ví dụ: ubuntu).SSH_PRIVATE_KEY: 

Nội dung file khóa private key (.pem) dùng để SSH trực tiếp vào server.Quy trình hoạt động của Pipeline:Code Push: 

Lập trình viên push code lên nhánh main.Test Stage: Pipeline tự động khởi tạo môi trường Node.js và Python 
độc lập để kiểm tra cú pháp và build thử nghiệm.Deploy Stage: 

Sau khi test pass, GitHub/GitLab Runner tự động SSH vào AWS EC2, thực hiện lệnh git pull, hạ cụm container 
cũ xuống và kích hoạt build cụm container mới ngay lập tức.


🔒 Cấu Hình Bảo Mật AWS FirewallĐể người dùng bên ngoài có thể truy cập thành công vào hệ thống,
 bạn cần cấu hình Inbound Rules trong Security Group trên AWS Console:
 
 Loại (Type)Cổng (Port Range)Nguồn (Source)Mô tảHTTP800.0.0.0/0Tiếp nhận và 
 redirect sang HTTPSHTTPS4430.0.0.0/0Cổng truy cập ứng dụng an toàn chính thứcSSH22IP của bạn / 
 AnywherePhục vụ kết nối Terminal và CI/CD