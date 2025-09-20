# Hướng dẫn Debug Install/Handle Issues

## Vấn đề thường gặp với Install/Handle

### 1. **Bitrix24 không gửi request đến endpoint /install**

**Nguyên nhân:**
- URL cấu hình trong Bitrix24 không đúng
- Ngrok không hoạt động hoặc URL đã thay đổi
- Firewall chặn request

**Cách kiểm tra:**
```bash
# 1. Kiểm tra ngrok
curl https://your-ngrok-domain.ngrok.io/health

# 2. Kiểm tra endpoint debug
curl -X POST https://your-ngrok-domain.ngrok.io/debug/install \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Giải pháp:**
- Cập nhật URL trong Bitrix24 với URL ngrok mới
- Kiểm tra ngrok đang chạy đúng port
- Thử cài đặt lại app trên Bitrix24

### 2. **Request đến nhưng thiếu code hoặc domain**

**Nguyên nhân:**
- Bitrix24 gửi data trong body thay vì query parameters
- Format request không đúng

**Cách kiểm tra:**
```bash
# Test với debug endpoint
POST http://localhost:3000/debug/install
Content-Type: application/json

{
  "code": "test_code",
  "domain": "test-domain.bitrix24.com"
}
```

**Giải pháp:**
- Endpoint đã được cập nhật để xử lý cả body và query parameters
- Kiểm tra logs để xem data được gửi như thế nào

### 3. **Lỗi "Missing OAuth configuration"**

**Nguyên nhân:**
- Thiếu biến môi trường CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
- File .env không được load

**Cách kiểm tra:**
```bash
GET http://localhost:3000/test/config
```

**Giải pháp:**
- Tạo file .env với đầy đủ thông tin:
```env
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REDIRECT_URI=https://your-ngrok-domain.ngrok.io/install
MONGODB_URI=mongodb://localhost:27017/bitrix-oauth
API_KEY=bitrix-oauth-default-key
```

### 4. **Lỗi "Failed to exchange code for token"**

**Nguyên nhân:**
- CLIENT_ID hoặc CLIENT_SECRET sai
- REDIRECT_URI không khớp với cấu hình trong Bitrix24
- Code đã hết hạn hoặc đã sử dụng

**Cách kiểm tra:**
- Kiểm tra logs chi tiết trong console
- So sánh REDIRECT_URI với cấu hình trong Bitrix24

**Giải pháp:**
- Cập nhật CLIENT_ID và CLIENT_SECRET từ Bitrix24
- Đảm bảo REDIRECT_URI khớp chính xác
- Thử cài đặt lại app để lấy code mới

### 5. **Lỗi kết nối MongoDB**

**Nguyên nhân:**
- MongoDB không chạy
- MONGODB_URI sai
- Lỗi kết nối mạng

**Cách kiểm tra:**
```bash
# Kiểm tra MongoDB
mongosh mongodb://localhost:27017/bitrix-oauth
```

**Giải pháp:**
- Khởi động MongoDB
- Kiểm tra MONGODB_URI trong .env
- Kiểm tra kết nối mạng

## Các bước debug chi tiết

### Bước 1: Kiểm tra cấu hình
```bash
GET http://localhost:3000/test/config
```

### Bước 2: Test debug endpoint
```bash
POST http://localhost:3000/debug/install
Content-Type: application/json

{
  "code": "test_code",
  "domain": "test-domain.bitrix24.com"
}
```

### Bước 3: Kiểm tra logs
Xem console logs để xem:
- Request có được nhận không
- Data được gửi như thế nào
- Lỗi xảy ra ở đâu

### Bước 4: Test với Bitrix24 thật
1. Cấu hình app trong Bitrix24 với URL ngrok
2. Cài đặt app
3. Kiểm tra logs để xem request thật

## Cấu hình Bitrix24 đúng

### 1. Tạo Local Application
- **Application name**: Bitrix OAuth API
- **Redirect URI**: `https://your-ngrok-domain.ngrok.io/install`
- **Application scope**: CRM, User

### 2. Lấy thông tin
- **Client ID**: Lấy từ Bitrix24
- **Client Secret**: Lấy từ Bitrix24
- **Domain**: Domain của Bitrix24 (ví dụ: your-domain.bitrix24.com)

### 3. Cập nhật .env
```env
CLIENT_ID=your_client_id_from_bitrix24
CLIENT_SECRET=your_client_secret_from_bitrix24
REDIRECT_URI=https://your-ngrok-domain.ngrok.io/install
MONGODB_URI=mongodb://localhost:27017/bitrix-oauth
API_KEY=bitrix-oauth-default-key
```

## Test với ngrok

### 1. Khởi động ngrok
```bash
npm run start:ngrok
```

### 2. Cập nhật Bitrix24
- Cập nhật Redirect URI với URL ngrok mới
- Cài đặt lại app

### 3. Kiểm tra
- Xem logs trong console
- Kiểm tra database MongoDB
- Test các endpoint API

## Lỗi thường gặp và giải pháp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| "Authorization code is required" | Bitrix24 không gửi code | Kiểm tra cấu hình Bitrix24 |
| "Domain is required" | Bitrix24 không gửi domain | Kiểm tra cấu hình Bitrix24 |
| "Missing OAuth configuration" | Thiếu biến môi trường | Cập nhật file .env |
| "Failed to exchange code for token" | Cấu hình OAuth sai | Kiểm tra CLIENT_ID, CLIENT_SECRET, REDIRECT_URI |
| "Network error" | Lỗi kết nối | Kiểm tra ngrok và mạng |
| "MongoDB connection failed" | Lỗi database | Khởi động MongoDB |

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề, hãy cung cấp:
1. Logs từ console
2. Response từ `/test/config`
3. Response từ `/debug/install`
4. Cấu hình Bitrix24
5. File .env (ẩn thông tin nhạy cảm)
