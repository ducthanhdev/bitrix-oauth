# 🚀 Bitrix24 OAuth & Contact Management API

Ứng dụng backend NestJS để tích hợp với Bitrix24 thông qua OAuth 2.0 và quản lý Contact với đầy đủ tính năng CRUD.

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [API Documentation](#-api-documentation)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Troubleshooting](#-troubleshooting)

## ✨ Tính năng

### 🔐 OAuth 2.0 với Bitrix24
- ✅ Nhận sự kiện cài đặt ứng dụng từ Bitrix24
- ✅ Trao đổi authorization code lấy access token
- ✅ Lưu trữ và quản lý token trong MongoDB
- ✅ Tự động làm mới token khi hết hạn
- ✅ Xử lý lỗi OAuth và logging chi tiết

### 👥 Quản lý Contact
- ✅ CRUD operations đầy đủ (Create, Read, Update, Delete)
- ✅ Quản lý thông tin ngân hàng với crm.requisite
- ✅ Validation dữ liệu đầu vào (email, phone, địa chỉ)
- ✅ Tìm kiếm và lọc contacts
- ✅ API Key authentication

### 🛡️ Bảo mật & Documentation
- ✅ API Key Guard bảo vệ tất cả endpoints
- ✅ Swagger documentation tự động
- ✅ Error handling toàn diện
- ✅ Logging chi tiết cho debug

## 🛠️ Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- MongoDB >= 4.4
- npm hoặc yarn

### Cài đặt dependencies
```bash
# Clone repository
git clone <repository-url>
cd bitrix-oauth

# Cài đặt dependencies
npm install

# Hoặc sử dụng yarn
yarn install
```

## ⚙️ Cấu hình

### 1. Tạo file `.env`
```env
# Bitrix24 OAuth Configuration
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
BITRIX24_DOMAIN=your-domain.bitrix24.com
REDIRECT_URI=http://localhost:3000/install

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bitrix-oauth

# Server Configuration
PORT=3000
NODE_ENV=development

# API Security
API_KEY=bitrix-oauth-default-key
```

### 2. Cấu hình Bitrix24 Local Application

1. **Đăng nhập Bitrix24** → Ứng dụng → Phát triển → Ứng dụng của tôi
2. **Tạo "Ứng dụng cục bộ"** mới
3. **Cấu hình URLs:**
   - URL ứng dụng: `http://localhost:3000/install`
   - URL cài đặt: `http://localhost:3000/install`
4. **Chọn quyền truy cập:** CRM, Users, etc.
5. **Lưu và lấy CLIENT_ID, CLIENT_SECRET**

### 3. Cài đặt MongoDB

#### Windows:
```bash
# Sử dụng winget
winget install MongoDB.Server

# Hoặc tải từ: https://www.mongodb.com/try/download/community
```

#### Linux/Mac:
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS với Homebrew
brew install mongodb-community
```

#### MongoDB Atlas (Cloud):
1. Truy cập: https://www.mongodb.com/atlas
2. Tạo cluster miễn phí
3. Lấy connection string
4. Cập nhật `MONGODB_URI` trong `.env`

## 🚀 Chạy ứng dụng

### Development mode
```bash
# Terminal 1: Chạy NestJS
npm run start:dev

# Terminal 2: Chạy ngrok (nếu cần test với Bitrix24)
npm run start:ngrok
```

### Production mode
```bash
# Build ứng dụng
npm run build

# Chạy production
npm run start:prod
```

### Các lệnh khác
```bash
# Format code
npm run format

# Kiểm tra format
npm run format:check

# Lint code
npm run lint

# Kiểm tra lint
npm run lint:check

# Chạy tests
npm run test

# Chạy tests với coverage
npm run test:cov
```

## 📚 API Documentation

### Swagger UI
Truy cập: **http://localhost:3000/api**

- Tài liệu API đầy đủ
- Test interface trực tiếp
- Schema validation
- Authentication examples

### Health Check
```bash
curl -H "x-api-key: bitrix-oauth-default-key" http://localhost:3000/health
```

## 🔗 API Endpoints

### OAuth Endpoints
| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|----------------|
| POST | `/install` | Cài đặt ứng dụng từ Bitrix24 | ❌ |
| GET | `/install` | Cài đặt ứng dụng (backup) | ❌ |
| GET | `/health` | Health check | ❌ |

### Test Endpoints
| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|----------------|
| GET | `/test/contacts` | Test API contacts | ❌ |
| GET | `/test/user` | Test API user | ❌ |
| GET | `/test/deals` | Test API deals | ❌ |
| GET | `/test/leads` | Test API leads | ❌ |

### Contact Endpoints
| Method | Endpoint | Mô tả | Authentication |
|--------|----------|-------|----------------|
| GET | `/contacts` | Lấy danh sách contacts | ✅ API Key |
| GET | `/contacts/:id` | Lấy contact theo ID | ✅ API Key |
| POST | `/contacts` | Tạo contact mới | ✅ API Key |
| PUT | `/contacts/:id` | Cập nhật contact | ✅ API Key |
| DELETE | `/contacts/:id` | Xóa contact | ✅ API Key |

### Authentication
Tất cả Contact endpoints yêu cầu API Key:
```bash
# Header
x-api-key: bitrix-oauth-default-key
```

## 🧪 Testing

### Unit Tests
```bash
# Chạy tất cả tests
npm run test

# Chạy tests với watch mode
npm run test:watch

# Chạy tests với coverage
npm run test:cov

# Chạy unit tests
npm run test:unit
```

### API Testing với cURL

#### 1. Health Check
```bash
curl -H "x-api-key: bitrix-oauth-default-key" \
  http://localhost:3000/health
```

#### 2. Lấy danh sách contacts
```bash
curl -H "x-api-key: bitrix-oauth-default-key" \
  "http://localhost:3000/contacts?domain=your-domain.bitrix24.com"
```

#### 3. Tạo contact mới
```bash
curl -X POST \
  -H "x-api-key: bitrix-oauth-default-key" \
  -H "Content-Type: application/json" \
  -d '{
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
  }' \
  "http://localhost:3000/contacts?domain=your-domain.bitrix24.com"
```

#### 4. Cập nhật contact
```bash
curl -X PUT \
  -H "x-api-key: bitrix-oauth-default-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn B",
    "phone": "0987654321",
    "email": "nguyenvanb@example.com"
  }' \
  "http://localhost:3000/contacts/123?domain=your-domain.bitrix24.com"
```

#### 5. Xóa contact
```bash
curl -X DELETE \
  -H "x-api-key: bitrix-oauth-default-key" \
  "http://localhost:3000/contacts/123?domain=your-domain.bitrix24.com"
```

### API Testing với Postman

1. **Import collection** từ file `test-api.http`
2. **Set environment variables:**
   - `base_url`: `http://localhost:3000`
   - `api_key`: `bitrix-oauth-default-key`
   - `domain`: `your-domain.bitrix24.com`
3. **Chạy tests** theo thứ tự

## 📁 Cấu trúc dự án

```
src/
├── config/
│   └── configuration.ts          # Cấu hình môi trường
├── modules/
│   ├── oauth/                    # OAuth module
│   │   ├── oauth.module.ts
│   │   ├── oauth.service.ts
│   │   └── oauth.controller.ts
│   ├── bitrix/                   # Bitrix API module
│   │   ├── bitrix.module.ts
│   │   ├── bitrix-api.service.ts
│   │   └── bitrix.controller.ts
│   └── contact/                  # Contact module
│       ├── contact.module.ts
│       ├── contact.service.ts
│       └── contact.controller.ts
├── dto/
│   └── contact.dto.ts            # Contact DTOs với validation
├── schemas/
│   └── token.schema.ts           # MongoDB Token schema
├── guards/
│   └── api-key.guard.ts          # API Key authentication
├── scripts/
│   ├── start-ngrok.js            # Ngrok script
│   └── create-test-token.js      # Test token script
├── test/
│   └── unit/                     # Unit tests
└── app.module.ts                 # Root module
```

## 🐛 Troubleshooting

### Lỗi thường gặp

#### 1. MongoDB connection error
```bash
# Kiểm tra MongoDB đang chạy
mongosh --eval "db.runCommand('ping')"

# Khởi động MongoDB
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

#### 2. OAuth error
- ✅ Kiểm tra CLIENT_ID và CLIENT_SECRET trong `.env`
- ✅ Kiểm tra REDIRECT_URI khớp với Bitrix24
- ✅ Kiểm tra ngrok URL còn hoạt động

#### 3. API Key error
```bash
# Kiểm tra API Key trong header
curl -H "x-api-key: bitrix-oauth-default-key" http://localhost:3000/health
```

#### 4. Token error
- ✅ Kiểm tra token trong MongoDB
- ✅ Kiểm tra token còn hết hạn không
- ✅ Chạy lại OAuth flow để lấy token mới

### Debug logs
```bash
# Xem logs chi tiết
npm run start:dev

# Logs sẽ hiển thị:
# - OAuth flow steps
# - API calls tới Bitrix24
# - Error details
# - Token refresh status
```

### Kiểm tra kết nối
```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Test OAuth (cần token thực tế)
curl -H "x-api-key: bitrix-oauth-default-key" \
  "http://localhost:3000/test/contacts?domain=your-domain.bitrix24.com"

# 3. Test Contact API
curl -H "x-api-key: bitrix-oauth-default-key" \
  "http://localhost:3000/contacts?domain=your-domain.bitrix24.com"
```

## 📝 Changelog

### v1.0.0
- ✅ OAuth 2.0 integration với Bitrix24
- ✅ Contact CRUD operations
- ✅ Bank info management
- ✅ API Key authentication
- ✅ Swagger documentation
- ✅ Unit tests
- ✅ Error handling & logging

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Tạo Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.

---

**🎉 Chúc bạn sử dụng thành công!**