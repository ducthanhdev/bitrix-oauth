# Hướng dẫn cài đặt chi tiết - Bitrix24 OAuth Integration

## 📋 Yêu cầu hệ thống

### Phần mềm cần thiết
- **Node.js**: >= 18.0.0
- **MongoDB**: >= 4.4
- **ngrok**: Để tạo tunnel
- **Git**: Để clone repository

### Hệ điều hành hỗ trợ
- Windows 10/11
- macOS 10.15+
- Ubuntu 18.04+
- CentOS 7+

## 🚀 Cài đặt từng bước

### Bước 1: Cài đặt Node.js

#### Windows
1. Truy cập https://nodejs.org
2. Download phiên bản LTS (>= 18.0.0)
3. Chạy file installer
4. Kiểm tra cài đặt:
```bash
node --version
npm --version
```

#### macOS
```bash
# Sử dụng Homebrew
brew install node

# Hoặc download từ https://nodejs.org
```

#### Linux (Ubuntu/Debian)
```bash
# Cập nhật package list
sudo apt update

# Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra cài đặt
node --version
npm --version
```

### Bước 2: Cài đặt MongoDB

#### Windows
1. Truy cập https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server
3. Chạy installer và làm theo hướng dẫn
4. Khởi động MongoDB:
```bash
mongod
```

#### macOS
```bash
# Sử dụng Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Tạo list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Cập nhật package list
sudo apt-get update

# Cài đặt MongoDB
sudo apt-get install -y mongodb-org

# Khởi động MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Bước 3: Cài đặt ngrok

#### Windows
1. Truy cập https://ngrok.com/download
2. Download file ZIP
3. Giải nén và copy `ngrok.exe` vào thư mục trong PATH
4. Đăng ký tài khoản ngrok và lấy authtoken
5. Cấu hình authtoken:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

#### macOS
```bash
# Sử dụng Homebrew
brew install ngrok/ngrok/ngrok

# Hoặc download từ https://ngrok.com/download
```

#### Linux
```bash
# Download và cài đặt
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Đăng ký tài khoản và cấu hình authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### Bước 4: Clone và cài đặt dự án

```bash
# Clone repository
git clone <repository-url>
cd bitrix-oauth

# Cài đặt dependencies
npm install

# Kiểm tra cài đặt
npm run build
```

### Bước 5: Cấu hình environment

Tạo file `.env` trong thư mục gốc:

```env
# Bitrix24 OAuth Configuration
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
BITRIX24_DOMAIN=your-domain.bitrix24.vn
REDIRECT_URI=https://your-ngrok-domain.ngrok-free.app/install

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bitrix-oauth

# Server Configuration
PORT=3000
NODE_ENV=development

# API Security
API_KEY=bitrix-oauth-default-key
```

### Bước 6: Khởi động ứng dụng

```bash
# Development mode
npm run start:dev

# Hoặc với ngrok tunnel
npm run start:ngrok
```

## 🔧 Cấu hình Bitrix24

### Bước 1: Truy cập Bitrix24

1. Mở trình duyệt và truy cập: `https://your-domain.bitrix24.vn`
2. Đăng nhập vào tài khoản Bitrix24

### Bước 2: Vào phần Ứng dụng

1. Click vào menu (3 gạch ngang) ở góc trái
2. Chọn **"Ứng dụng"** hoặc **"Applications"**
3. Chọn **"Phát triển"** hoặc **"Development"**
4. Chọn **"Ứng dụng của tôi"** hoặc **"My Applications"**

### Bước 3: Tạo ứng dụng mới

1. Click **"Tạo ứng dụng"** hoặc **"Create Application"**
2. Điền thông tin:
   - **Tên**: NestJS OAuth App
   - **URL cài đặt**: `https://your-ngrok-domain.ngrok-free.app/install`
   - **Quyền truy cập**: 
     - CRM (để quản lý contacts)
     - Users (để lấy thông tin user)
     - Leads (để quản lý leads)
     - Deals (để quản lý deals)

### Bước 4: Lấy thông tin OAuth

1. Sau khi tạo ứng dụng, copy **CLIENT_ID** và **CLIENT_SECRET**
2. Cập nhật vào file `.env`:
```env
CLIENT_ID=local.68c4da752a3844.61968186
CLIENT_SECRET=bzz49I7hgWSxlKNhr1IjXe2qgdl08vP1GUWrf76JuS0H1YqQjs
```

### Bước 5: Cài đặt ứng dụng

1. Click **"Cài đặt"** hoặc **"Install"**
2. Chọn quyền truy cập (nếu có)
3. Xác nhận cài đặt

## 🧪 Kiểm tra cài đặt

### Bước 1: Kiểm tra ứng dụng

```bash
# Kiểm tra health check
curl http://localhost:3000/health

# Kết quả mong đợi:
# {"status":"ok","timestamp":"2024-12-19T17:30:00.000Z"}
```

### Bước 2: Kiểm tra ngrok

```bash
# Kiểm tra ngrok tunnel
curl https://your-ngrok-domain.ngrok-free.app/health

# Kết quả mong đợi:
# {"status":"ok","timestamp":"2024-12-19T17:30:00.000Z"}
```

### Bước 3: Kiểm tra MongoDB

```bash
# Kết nối MongoDB
mongo

# Trong MongoDB shell:
use bitrix-oauth
db.tokens.find()

# Kết quả mong đợi: Danh sách tokens (có thể rỗng)
```

### Bước 4: Kiểm tra OAuth flow

1. Cài đặt ứng dụng trên Bitrix24
2. Kiểm tra logs của ứng dụng
3. Kiểm tra MongoDB có token mới không

## 🔍 Troubleshooting

### Lỗi thường gặp

#### 1. MongoDB không khởi động được
```bash
# Windows
net start MongoDB

# Linux/macOS
sudo systemctl start mongod
# hoặc
brew services start mongodb/brew/mongodb-community
```

#### 2. Port 3000 đã được sử dụng
```bash
# Tìm process sử dụng port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Kill process (Linux/macOS)
kill -9 <PID>
```

#### 3. ngrok không hoạt động
```bash
# Kiểm tra authtoken
ngrok config check

# Cấu hình lại authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN
```

#### 4. OAuth token không được tạo
- Kiểm tra `CLIENT_ID` và `CLIENT_SECRET` trong `.env`
- Kiểm tra `REDIRECT_URI` có khớp với ngrok URL không
- Kiểm tra logs của ứng dụng

#### 5. API Key authentication không hoạt động
- Kiểm tra header `x-api-key` có đúng không
- Kiểm tra `API_KEY` trong `.env`

### Logs và Debug

#### Xem logs ứng dụng
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

#### Xem logs MongoDB
```bash
# Windows
tail -f C:\Program Files\MongoDB\Server\6.0\log\mongod.log

# Linux/macOS
tail -f /var/log/mongodb/mongod.log
```

#### Xem logs ngrok
```bash
# Chạy ngrok với verbose mode
ngrok http 3000 --log=stdout
```

## 📚 Tài liệu tham khảo

- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [ngrok Documentation](https://ngrok.com/docs)
- [Bitrix24 OAuth Documentation](https://dev.1c-bitrix.com/rest_help/oauth/index.php)
- [Bitrix24 REST API Documentation](https://dev.1c-bitrix.com/rest_help/index.php)

## 🤝 Hỗ trợ

Nếu gặp vấn đề trong quá trình cài đặt:

1. Kiểm tra logs của ứng dụng
2. Kiểm tra file `README.md` để biết hướng dẫn chi tiết
3. Kiểm tra file `test-results.md` để biết kết quả kiểm thử
4. Tạo issue trên GitHub với thông tin chi tiết về lỗi
5. Liên hệ qua email với thông tin:
   - Hệ điều hành
   - Phiên bản Node.js
   - Phiên bản MongoDB
   - Logs lỗi
   - Các bước đã thực hiện
