# Quick Start Guide - Bitrix24 OAuth

## 🚀 Bước 1: Cài đặt MongoDB
```bash
# Windows: Tải từ https://www.mongodb.com/try/download/community
# Hoặc sử dụng MongoDB Atlas (cloud)

# Linux/Mac
sudo apt-get install mongodb  # Ubuntu
brew install mongodb-community  # macOS
```

## 🔧 Bước 2: Cấu hình môi trường
Tạo file `.env`:
```env
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
BITRIX24_DOMAIN=your-domain.bitrix24.com
REDIRECT_URI=http://localhost:3000/install
MONGODB_URI=mongodb://localhost:27017/bitrix-oauth
PORT=3000
NODE_ENV=development
```

## 🏃‍♂️ Bước 3: Chạy ứng dụng
```bash
# Terminal 1: Chạy NestJS
npm run start:dev

# Terminal 2: Chạy ngrok
npm run start:ngrok
```

## 🔗 Bước 4: Cấu hình Bitrix24
1. Vào Bitrix24 → Ứng dụng → Phát triển → Ứng dụng của tôi
2. Tạo "Ứng dụng cục bộ"
3. URL ứng dụng: `https://your-ngrok-url.ngrok.io/install`
4. Lấy CLIENT_ID và CLIENT_SECRET
5. Cập nhật file `.env`

## ✅ Bước 5: Test
```bash
# Health check
curl http://localhost:3000/health

# Test contacts (thay your-domain.bitrix24.com)
curl "http://localhost:3000/test/contacts?domain=your-domain.bitrix24.com"
```

## 📋 Các endpoint có sẵn
- `POST /install` - Cài đặt ứng dụng
- `GET /install` - Cài đặt ứng dụng (backup)
- `GET /health` - Health check
- `GET /test/contacts` - Test lấy contacts
- `GET /test/user` - Test lấy user info
- `GET /test/deals` - Test lấy deals
- `GET /test/leads` - Test lấy leads

## 🐛 Troubleshooting
- **MongoDB error**: Kiểm tra MongoDB đang chạy
- **OAuth error**: Kiểm tra CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
- **ngrok error**: Kiểm tra ngrok URL còn hoạt động
- **API error**: Kiểm tra domain và quyền truy cập
