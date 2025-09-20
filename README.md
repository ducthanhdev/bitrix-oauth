# Bitrix24 OAuth API

RESTful API được xây dựng với NestJS để tích hợp OAuth 2.0 với Bitrix24, cung cấp các chức năng quản lý contacts và requisites.

## 🚀 Hướng dẫn cài đặt và chạy dự án

### Yêu cầu hệ thống

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB >= 5.0
- ngrok (để expose local server)

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd bitrix-oauth
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình môi trường

Tạo file `.env` trong thư mục root:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/bitrix-oauth

# Bitrix24 OAuth Configuration
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=https://your-ngrok-url.ngrok-free.app/install

# API Security
API_KEY=your_api_key_here

# Server
PORT=3000
```

### Bước 4: Chạy MongoDB

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Bước 5: Chạy ứng dụng

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

## 🌐 Hướng dẫn cấu hình ngrok

### Cài đặt ngrok

1. Tải ngrok từ [https://ngrok.com/download](https://ngrok.com/download)
2. Đăng ký tài khoản miễn phí
3. Lấy auth token từ dashboard

### Cấu hình ngrok

```bash
# Đăng nhập với auth token
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Expose port 3000
ngrok http 3000
```

### Cập nhật cấu hình

Sau khi chạy ngrok, bạn sẽ nhận được URL như:
```
https://abc123.ngrok-free.app
```

Cập nhật file `.env`:
```env
REDIRECT_URI=https://abc123.ngrok-free.app/install
```

## 🔧 Hướng dẫn cấu hình Bitrix24

### Bước 1: Tạo ứng dụng trong Bitrix24

1. Đăng nhập vào Bitrix24 portal của bạn
2. Vào **Marketplace** > **Applications** > **Create application**
3. Chọn **Local application**

### Bước 2: Cấu hình OAuth

Trong form tạo ứng dụng:

- **Application name**: Bitrix OAuth API
- **Application code**: bitrix_oauth_api
- **Redirect URI**: `https://your-ngrok-url.ngrok-free.app/install`
- **Scopes**: Chọn các quyền cần thiết:
  - `crm` - Quản lý CRM
  - `user` - Thông tin người dùng

### Bước 3: Lấy thông tin ứng dụng

Sau khi tạo, bạn sẽ nhận được:
- **Client ID**: `local.xxxxxxxxxxxxxxxx.xxxxxxxx`
- **Client Secret**: Chuỗi dài 40 ký tự

### Bước 4: Cập nhật file .env

```env
CLIENT_ID=local.xxxxxxxxxxxxxxxx.xxxxxxxx
CLIENT_SECRET=your_40_character_secret_here
REDIRECT_URI=https://your-ngrok-url.ngrok-free.app/install
```

### Bước 5: Cài đặt ứng dụng

1. Trong Bitrix24, vào **Marketplace** > **Applications**
2. Tìm ứng dụng vừa tạo và click **Install**
3. Ứng dụng sẽ redirect đến ngrok URL và tự động cài đặt

## 📚 Danh sách API Endpoints

### 🔐 Authentication

Tất cả endpoints (trừ `/install`, `/health`, `/test/*`) yêu cầu API Key:

```
X-API-Key: your_api_key_here
```

### 🏠 OAuth Endpoints

#### Cài đặt ứng dụng
```http
POST /install
Content-Type: application/json

{
  "AUTH_ID": "access_token_from_bitrix",
  "REFRESH_ID": "refresh_token_from_bitrix",
  "member_id": "member_id"
}
```

#### Kiểm tra cấu hình OAuth
```http
GET /test/config
```

#### Health check
```http
GET /health
```

### 👥 Contact Management

#### Lấy danh sách contacts
```http
GET /contacts?domain=your-domain.bitrix24.com&name=John&email=john@example.com
X-API-Key: your_api_key
```

#### Lấy contact theo ID
```http
GET /contacts/{id}?domain=your-domain.bitrix24.com
X-API-Key: your_api_key
```

#### Tạo contact mới
```http
POST /contacts?domain=your-domain.bitrix24.com
X-API-Key: your_api_key
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "website": "https://johndoe.com",
  "address": {
    "ward": "Ward 1",
    "district": "District 1", 
    "city": "Ho Chi Minh City"
  },
  "bankInfo": {
    "bankName": "Vietcombank",
    "accountNumber": "1234567890"
  }
}
```

#### Cập nhật contact
```http
PUT /contacts/{id}?domain=your-domain.bitrix24.com
X-API-Key: your_api_key
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+0987654321",
  "email": "johnsmith@example.com"
}
```

#### Xóa contact
```http
DELETE /contacts/{id}?domain=your-domain.bitrix24.com
X-API-Key: your_api_key
```

### 🧪 Test Endpoints

#### Test contacts API
```http
GET /test/contacts?domain=your-domain.bitrix24.com
```

#### Test user API
```http
GET /test/user?domain=your-domain.bitrix24.com
```

#### Test deals API
```http
GET /test/deals?domain=your-domain.bitrix24.com
```

#### Test leads API
```http
GET /test/leads?domain=your-domain.bitrix24.com
```

## 🔍 API Documentation

Truy cập Swagger UI tại: `http://localhost:3000/api`

## ⚠️ Các lỗi thường gặp và cách khắc phục

### 1. Lỗi kết nối MongoDB

**Lỗi**: `MongoServerError: connection timed out`

**Nguyên nhân**: MongoDB chưa được khởi động

**Khắc phục**:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod

# Hoặc chạy MongoDB manual
mongod --dbpath /path/to/your/db
```

### 2. Lỗi OAuth configuration

**Lỗi**: `Missing OAuth configuration`

**Nguyên nhân**: Thiếu CLIENT_ID, CLIENT_SECRET, hoặc REDIRECT_URI

**Khắc phục**:
1. Kiểm tra file `.env` có đầy đủ thông tin
2. Restart ứng dụng sau khi cập nhật `.env`
3. Kiểm tra ngrok URL có đúng không

### 3. Lỗi ngrok tunnel

**Lỗi**: `ngrok: command not found`

**Khắc phục**:
1. Tải và cài đặt ngrok
2. Thêm ngrok vào PATH
3. Đăng nhập với auth token: `ngrok config add-authtoken YOUR_TOKEN`

### 4. Lỗi Bitrix24 API

**Lỗi**: `Bitrix24 API error: invalid_grant`

**Nguyên nhân**: Token hết hạn hoặc không hợp lệ

**Khắc phục**:
1. Cài đặt lại ứng dụng trong Bitrix24
2. Kiểm tra redirect URI có đúng không
3. Đảm bảo ngrok đang chạy và accessible

### 5. Lỗi API Key

**Lỗi**: `Invalid or missing API key`

**Khắc phục**:
1. Thêm header `X-API-Key` vào request
2. Kiểm tra API key trong file `.env`
3. Sử dụng đúng API key đã cấu hình

### 6. Lỗi domain không tồn tại

**Lỗi**: `No active token found for this domain`

**Khắc nhân**: Chưa cài đặt ứng dụng cho domain này

**Khắc phục**:
1. Cài đặt ứng dụng trong Bitrix24 portal
2. Đảm bảo domain trong request đúng với domain Bitrix24
3. Kiểm tra token đã được lưu trong database

## 🧪 Cách kiểm tra hệ thống

### 1. Kiểm tra cấu hình OAuth

```bash
curl -X GET http://localhost:3000/test/config
```

Kết quả mong đợi:
```json
{
  "status": "ok",
  "config": {
    "clientId": "configured",
    "clientSecret": "configured", 
    "redirectUri": "https://your-ngrok.ngrok-free.app/install"
  }
}
```

### 2. Kiểm tra health check

```bash
curl -X GET http://localhost:3000/health
```

### 3. Kiểm tra API endpoints

```bash
# Test với API key
curl -X GET "http://localhost:3000/contacts?domain=your-domain.bitrix24.com" \
  -H "X-API-Key: your_api_key"
```

### 4. Kiểm tra database

```bash
# Kết nối MongoDB
mongo bitrix-oauth

# Kiểm tra tokens
db.tokens.find()
```

## 📁 Cấu trúc dự án

```
src/
├── modules/
│   ├── oauth/           # OAuth authentication
│   ├── contact/         # Contact management
│   └── bitrix/          # Bitrix24 API integration
├── guards/
│   └── api-key.guard.ts # API key authentication
├── schemas/
│   └── token.schema.ts  # MongoDB token schema
├── dto/
│   └── contact.dto.ts   # Data transfer objects
├── config/
│   └── configuration.ts # App configuration
└── main.ts              # Application entry point
```

## 🛠️ Scripts có sẵn

```bash
# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Lint
npm run lint

# Test
npm run test
```

## 📝 Ghi chú quan trọng

1. **Ngrok URL**: Ngrok URL sẽ thay đổi mỗi lần restart, cần cập nhật REDIRECT_URI
2. **API Key**: Bảo mật API key, không commit vào git
3. **Database**: Đảm bảo MongoDB đang chạy trước khi start ứng dụng
4. **Bitrix24**: Mỗi domain cần cài đặt ứng dụng riêng biệt

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License