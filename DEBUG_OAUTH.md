# Hướng dẫn Debug OAuth Install

## Vấn đề đã sửa

1. **Xung đột routing**: Đã xóa controller trùng lặp trong `src/controllers/`
2. **Cải thiện error handling**: Thêm logging chi tiết và xử lý lỗi tốt hơn
3. **Thêm test endpoint**: `/test/config` để kiểm tra cấu hình OAuth

## Các endpoint hiện có

### OAuth Endpoints
- `GET /health` - Health check
- `GET /test/config` - Kiểm tra cấu hình OAuth
- `GET /install` - Cài đặt app (GET method)
- `POST /install` - Cài đặt app (POST method)

### Test Endpoints
- `GET /test/contacts` - Test API contacts
- `GET /test/user` - Test API user
- `GET /test/deals` - Test API deals
- `GET /test/leads` - Test API leads

## Cách debug

### 1. Kiểm tra cấu hình OAuth
```bash
GET http://localhost:3000/test/config
```

Response sẽ cho biết:
- `clientId`: configured/missing
- `clientSecret`: configured/missing  
- `redirectUri`: URL hoặc not configured

### 2. Kiểm tra endpoint install
```bash
# Test GET method
GET http://localhost:3000/install?domain=your-domain.bitrix24.com&code=test123

# Test POST method
POST http://localhost:3000/install?domain=your-domain.bitrix24.com&code=test123
Content-Type: application/json
{}
```

### 3. Kiểm tra logs
Khi gọi endpoint `/install`, kiểm tra console logs để xem:
- Request có được nhận không
- Code và domain có được truyền đúng không
- Có lỗi gì trong quá trình exchange token không

### 4. Các lỗi thường gặp

#### Lỗi "Missing OAuth configuration"
- Kiểm tra file `.env` có đầy đủ:
  - `CLIENT_ID=your_client_id`
  - `CLIENT_SECRET=your_client_secret`
  - `REDIRECT_URI=http://localhost:3000/install`

#### Lỗi "Authorization code is required"
- Kiểm tra URL có chứa parameter `code` không
- Kiểm tra Bitrix24 có redirect đúng không

#### Lỗi "Failed to exchange code for token"
- Kiểm tra `CLIENT_ID` và `CLIENT_SECRET` có đúng không
- Kiểm tra `REDIRECT_URI` có khớp với cấu hình trong Bitrix24 không
- Kiểm tra domain có đúng format không (ví dụ: `your-domain.bitrix24.com`)

## Cấu hình Bitrix24

1. **Tạo ứng dụng** trong Bitrix24
2. **Cấu hình Redirect URI**: `http://localhost:3000/install`
3. **Lấy Client ID và Client Secret**
4. **Cập nhật file .env**:
   ```
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   REDIRECT_URI=http://localhost:3000/install
   MONGODB_URI=mongodb://localhost:27017/bitrix-oauth
   API_KEY=bitrix-oauth-default-key
   ```

## Test với ngrok

Nếu test với Bitrix24 thật, sử dụng ngrok:

```bash
npm run start:ngrok
```

Sau đó cập nhật `REDIRECT_URI` trong Bitrix24 với URL ngrok.

## Kiểm tra database

Sau khi install thành công, kiểm tra MongoDB:
```javascript
db.tokens.find()
```

Sẽ thấy document với:
- `domain`: domain Bitrix24
- `accessToken`: access token
- `refreshToken`: refresh token
- `expiresAt`: thời gian hết hạn
- `status`: "active"
