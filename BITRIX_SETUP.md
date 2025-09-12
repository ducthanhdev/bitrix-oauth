# Hướng dẫn thiết lập Bitrix24 OAuth với NestJS

## 1. Cài đặt MongoDB

### Windows:
1. Tải MongoDB Community Server từ: https://www.mongodb.com/try/download/community
2. Cài đặt và khởi động MongoDB service
3. Hoặc sử dụng MongoDB Atlas (cloud): https://www.mongodb.com/atlas

### Linux/Mac:
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS với Homebrew
brew install mongodb-community
```

## 2. Cấu hình môi trường

Tạo file `.env` trong thư mục gốc của dự án:

```env
# Bitrix24 OAuth Configuration
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
BITRIX24_DOMAIN=your_bitrix24_domain.bitrix24.com
REDIRECT_URI=http://localhost:3000/install

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bitrix-oauth

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 3. Thiết lập Bitrix24 Local Application

1. Đăng nhập vào Bitrix24 của bạn
2. Vào **Ứng dụng** → **Phát triển** → **Ứng dụng của tôi**
3. Tạo **Ứng dụng cục bộ** mới
4. Điền thông tin:
   - **Tên ứng dụng**: Bitrix OAuth App
   - **URL ứng dụng**: `http://localhost:3000/install`
   - **URL cài đặt**: `http://localhost:3000/install`
   - **Quyền truy cập**: Chọn các quyền cần thiết (CRM, Users, etc.)
5. Lưu và lấy **CLIENT_ID** và **CLIENT_SECRET**

## 4. Cài đặt và chạy ngrok

### Cài đặt ngrok:
```bash
# Windows (với Chocolatey)
choco install ngrok

# Hoặc tải từ: https://ngrok.com/download
```

### Chạy ngrok:
```bash
ngrok http 3000
```

Sau khi chạy, ngrok sẽ hiển thị URL public (ví dụ: `https://abc123.ngrok.io`)

## 5. Cập nhật Bitrix24 với ngrok URL

1. Quay lại Bitrix24 Local Application
2. Cập nhật:
   - **URL ứng dụng**: `https://your-ngrok-url.ngrok.io/install`
   - **URL cài đặt**: `https://your-ngrok-url.ngrok.io/install`
3. Cập nhật file `.env`:
   ```env
   REDIRECT_URI=https://your-ngrok-url.ngrok.io/install
   ```

## 6. Chạy ứng dụng

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run start:dev
```

## 7. Test ứng dụng

### Cài đặt ứng dụng trên Bitrix24:
1. Vào **Ứng dụng** → **Phát triển** → **Ứng dụng của tôi**
2. Click **Cài đặt** trên ứng dụng vừa tạo
3. Ứng dụng sẽ redirect đến ngrok URL và xử lý OAuth

### Test API endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Test lấy danh sách contacts
curl "http://localhost:3000/test/contacts?domain=your-domain.bitrix24.com"

# Test lấy thông tin user
curl "http://localhost:3000/test/user?domain=your-domain.bitrix24.com"

# Test lấy danh sách deals
curl "http://localhost:3000/test/deals?domain=your-domain.bitrix24.com"

# Test lấy danh sách leads
curl "http://localhost:3000/test/leads?domain=your-domain.bitrix24.com"
```

## 8. Các endpoint có sẵn

- `POST /install` - Xử lý sự kiện cài đặt ứng dụng
- `GET /install` - Xử lý redirect từ Bitrix24 (backup)
- `GET /health` - Health check
- `GET /test/contacts` - Test API lấy danh sách contacts
- `GET /test/user` - Test API lấy thông tin user
- `GET /test/deals` - Test API lấy danh sách deals
- `GET /test/leads` - Test API lấy danh sách leads

## 9. Xử lý lỗi

Ứng dụng sẽ tự động:
- Làm mới token khi hết hạn
- Xử lý các lỗi mạng và timeout
- Ghi log chi tiết để debug
- Lưu trữ token an toàn trong MongoDB

## 10. Cấu trúc dự án

```
src/
├── config/
│   └── configuration.ts      # Cấu hình môi trường
├── controllers/
│   └── bitrix.controller.ts  # Controller xử lý API
├── schemas/
│   └── token.schema.ts       # Schema MongoDB cho token
├── services/
│   ├── oauth.service.ts      # Service xử lý OAuth
│   └── bitrix-api.service.ts # Service gọi API Bitrix24
└── app.module.ts             # Module chính
```

## 11. Troubleshooting

### Lỗi kết nối MongoDB:
- Kiểm tra MongoDB đang chạy
- Kiểm tra MONGODB_URI trong .env

### Lỗi OAuth:
- Kiểm tra CLIENT_ID và CLIENT_SECRET
- Kiểm tra REDIRECT_URI khớp với Bitrix24
- Kiểm tra ngrok URL còn hoạt động

### Lỗi API Bitrix24:
- Kiểm tra domain có đúng format không
- Kiểm tra quyền truy cập trong Bitrix24
- Kiểm tra token còn hợp lệ không
