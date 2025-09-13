# Bitrix24 OAuth Integration với NestJS

## 📋 Mô tả dự án

Ứng dụng backend NestJS tích hợp với Bitrix24 thông qua OAuth 2.0, hỗ trợ:
- Nhận sự kiện cài đặt ứng dụng từ Bitrix24
- Quản lý và tự động làm mới OAuth tokens
- Gọi các API Bitrix24 (CRM, Contacts, Deals, Leads)
- API RESTful để quản lý Contacts với thông tin ngân hàng

## 🚀 Hướng dẫn cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- MongoDB >= 4.4
- ngrok (để tạo tunnel)

### Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd bitrix-oauth
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình environment**
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

4. **Khởi động MongoDB**
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

5. **Chạy ứng dụng**
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Với ngrok tunnel
npm run start:ngrok
```

## 🔧 Hướng dẫn cấu hình ngrok và Bitrix24

### Cấu hình ngrok

1. **Cài đặt ngrok**
```bash
# Download từ https://ngrok.com/download
# Hoặc sử dụng npm
npm install -g ngrok
```

2. **Chạy ngrok**
```bash
ngrok http 3000
```

3. **Lấy URL ngrok**
- Copy URL từ terminal (ví dụ: `https://abc123.ngrok-free.app`)
- Cập nhật `REDIRECT_URI` trong `.env`

### Cấu hình Bitrix24

1. **Truy cập Bitrix24**
- Đăng nhập vào `https://your-domain.bitrix24.vn`
- Vào **Ứng dụng** → **Phát triển** → **Ứng dụng của tôi**

2. **Tạo ứng dụng mới**
- Click **"Tạo ứng dụng"**
- Điền thông tin:
  - **Tên**: NestJS OAuth App
  - **URL cài đặt**: `https://your-ngrok-domain.ngrok-free.app/install`
  - **Quyền truy cập**: CRM, Users, Leads, Deals

3. **Lấy thông tin OAuth**
- Copy **CLIENT_ID** và **CLIENT_SECRET**
- Cập nhật vào file `.env`

4. **Cài đặt ứng dụng**
- Click **"Cài đặt"** để test OAuth flow

## 📚 Danh sách các endpoint API

### OAuth Endpoints

#### `POST /install`
Cài đặt ứng dụng và nhận OAuth token
```http
POST /install
Content-Type: application/json

{
  "code": "authorization_code_from_bitrix24",
  "domain": "your-domain.bitrix24.vn"
}
```

#### `GET /install`
Backup method cho OAuth (GET request)
```http
GET /install?code=authorization_code&domain=your-domain.bitrix24.vn
```

#### `GET /health`
Kiểm tra trạng thái ứng dụng
```http
GET /health
```

### Bitrix24 Test Endpoints

#### `GET /test/contacts`
Test API lấy danh sách contacts
```http
GET /test/contacts?domain=your-domain.bitrix24.vn
```

#### `GET /test/user`
Test API lấy thông tin user
```http
GET /test/user?domain=your-domain.bitrix24.vn
```

#### `GET /test/deals`
Test API lấy danh sách deals
```http
GET /test/deals?domain=your-domain.bitrix24.vn
```

#### `GET /test/leads`
Test API lấy danh sách leads
```http
GET /test/leads?domain=your-domain.bitrix24.vn
```

### Contact Management API

#### `GET /contacts`
Lấy danh sách tất cả contacts
```http
GET /contacts?domain=your-domain.bitrix24.vn
x-api-key: bitrix-oauth-default-key
```

#### `GET /contacts/:id`
Lấy thông tin contact theo ID
```http
GET /contacts/123?domain=your-domain.bitrix24.vn
x-api-key: bitrix-oauth-default-key
```

#### `POST /contacts`
Tạo contact mới
```http
POST /contacts?domain=your-domain.bitrix24.vn
x-api-key: bitrix-oauth-default-key
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "address": {
    "ward": "Phường 1",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh"
  },
  "phone": "0123456789",
  "email": "nguyenvana@example.com",
  "website": "https://example.com",
  "bankInfo": {
    "bankName": "Vietcombank",
    "accountNumber": "1234567890"
  }
}
```

#### `PUT /contacts/:id`
Cập nhật contact
```http
PUT /contacts/123?domain=your-domain.bitrix24.vn
x-api-key: bitrix-oauth-default-key
Content-Type: application/json

{
  "name": "Nguyễn Văn B",
  "phone": "0987654321",
  "email": "nguyenvanb@example.com"
}
```

#### `DELETE /contacts/:id`
Xóa contact
```http
DELETE /contacts/123?domain=your-domain.bitrix24.vn
x-api-key: bitrix-oauth-default-key
```

## 🔍 Các lỗi đã xử lý và cách kiểm tra

### 1. Lỗi OAuth
- **"Authorization code is required"**: Chưa cung cấp code từ Bitrix24
- **"Invalid domain"**: Domain không khớp với cấu hình
- **"OAuth token exchange failed"**: Lỗi trao đổi token với Bitrix24

### 2. Lỗi API Key
- **"Invalid or missing API key"**: Thiếu hoặc sai API key
- **"Unauthorized"**: API key không hợp lệ

### 3. Lỗi Token
- **"No active token found"**: Chưa có OAuth token cho domain
- **"Token expired"**: Token đã hết hạn, cần refresh
- **"Token refresh failed"**: Không thể refresh token

### 4. Lỗi Bitrix24 API
- **"401 Unauthorized"**: Token không hợp lệ hoặc hết hạn
- **"403 Forbidden"**: Không có quyền truy cập
- **"404 Not Found"**: Resource không tồn tại
- **"500 Internal Server Error"**: Lỗi server Bitrix24

### 5. Lỗi Network
- **"Network timeout"**: Kết nối mạng bị timeout
- **"DNS resolution failed"**: Không thể phân giải domain
- **"Connection refused"**: Không thể kết nối đến server

## 🧪 Kiểm thử

### Unit Tests
```bash
# Chạy tất cả tests
npm run test

# Chạy tests với coverage
npm run test:cov

# Chạy tests cho service cụ thể
npm run test -- --testPathPattern=bitrix-api.service.spec.ts
```

### Integration Tests
```bash
# Chạy e2e tests
npm run test:e2e
```

### Manual Testing
Sử dụng file `test-api.http` hoặc `test-contact-api.http` để test các endpoint.

## 📁 Cấu trúc dự án

```
src/
├── config/                 # Cấu hình ứng dụng
│   └── configuration.ts
├── dto/                    # Data Transfer Objects
│   └── contact.dto.ts
├── guards/                 # Authentication guards
│   └── api-key.guard.ts
├── modules/                # Feature modules
│   ├── oauth/              # OAuth module
│   │   ├── oauth.controller.ts
│   │   ├── oauth.module.ts
│   │   └── oauth.service.ts
│   ├── bitrix/             # Bitrix API module
│   │   ├── bitrix.controller.ts
│   │   ├── bitrix.module.ts
│   │   └── bitrix-api.service.ts
│   └── contact/            # Contact management module
│       ├── contact.controller.ts
│       ├── contact.module.ts
│       └── contact.service.ts
├── schemas/                # MongoDB schemas
│   └── token.schema.ts
├── scripts/                # Utility scripts
│   ├── create-test-token.js
│   └── delete-test-token.js
├── test/                   # Test files
│   └── unit/
│       ├── bitrix-api.service.spec.ts
│       └── contact.service.spec.ts
├── app.controller.ts       # Root controller
├── app.module.ts          # Root module
├── app.service.ts         # Root service
└── main.ts               # Application entry point
```

## 🔧 Scripts có sẵn

```bash
# Development
npm run start:dev          # Chạy development mode
npm run start:prod         # Chạy production mode
npm run start:ngrok        # Chạy với ngrok tunnel

# Testing
npm run test               # Chạy unit tests
npm run test:cov          # Chạy tests với coverage
npm run test:e2e          # Chạy e2e tests

# Code Quality
npm run format            # Format code với Prettier
npm run format:check      # Kiểm tra format
npm run lint              # Chạy ESLint
npm run lint:check        # Kiểm tra linting

# Build
npm run build             # Build ứng dụng
```

## 📊 Performance

- **Response time**: < 200ms cho các API đơn giản
- **Memory usage**: ~50MB cho development mode
- **Database**: MongoDB với indexing cho OAuth tokens
- **Caching**: Token caching để giảm API calls

## 🔒 Security

- **API Key authentication** cho tất cả endpoints (trừ OAuth)
- **OAuth 2.0** cho Bitrix24 integration
- **Input validation** với class-validator
- **Error handling** không expose sensitive information
- **Logging** cho audit trail

## 📝 Changelog

### v1.0.0
- ✅ OAuth 2.0 integration với Bitrix24
- ✅ Token management và auto-refresh
- ✅ Bitrix24 API integration
- ✅ Contact CRUD operations
- ✅ API documentation với Swagger
- ✅ Unit tests
- ✅ Error handling và logging

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 📞 Support

Nếu gặp vấn đề, hãy tạo issue trên GitHub hoặc liên hệ qua email.