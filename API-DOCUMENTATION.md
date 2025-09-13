# API Documentation - Bitrix24 OAuth Integration

## 📋 Tổng quan

Tài liệu này mô tả chi tiết tất cả các API endpoints của ứng dụng Bitrix24 OAuth Integration với NestJS.

## 🔗 Base URL

- **Local**: `http://localhost:3000`
- **ngrok**: `https://your-ngrok-domain.ngrok-free.app`

## 🔐 Authentication

### API Key Authentication
Tất cả endpoints (trừ OAuth) yêu cầu API key trong header:

```http
x-api-key: bitrix-oauth-default-key
```

### OAuth 2.0
Sử dụng OAuth 2.0 để tích hợp với Bitrix24:
- **Client ID**: Lấy từ Bitrix24 Application
- **Client Secret**: Lấy từ Bitrix24 Application
- **Redirect URI**: `https://your-ngrok-domain.ngrok-free.app/install`

## 📚 API Endpoints

### 1. OAuth Endpoints

#### `POST /install`
Cài đặt ứng dụng và nhận OAuth token từ Bitrix24.

**Request:**
```http
POST /install
Content-Type: application/json

{
  "code": "authorization_code_from_bitrix24",
  "domain": "your-domain.bitrix24.vn"
}
```

**Response:**
```json
{
  "message": "OAuth token saved successfully",
  "domain": "your-domain.bitrix24.vn",
  "accessToken": "access_token_here",
  "expiresIn": 3600
}
```

**Error Responses:**
```json
// Missing authorization code
{
  "message": "Authorization code is required",
  "error": "Bad Request",
  "statusCode": 400
}

// Invalid domain
{
  "message": "Invalid domain",
  "error": "Bad Request",
  "statusCode": 400
}

// OAuth token exchange failed
{
  "message": "OAuth token exchange failed",
  "error": "Bad Request",
  "statusCode": 400
}
```

#### `GET /install`
Backup method cho OAuth (GET request).

**Request:**
```http
GET /install?code=authorization_code&domain=your-domain.bitrix24.vn
```

**Response:** Tương tự như POST /install

#### `GET /health`
Kiểm tra trạng thái ứng dụng.

**Request:**
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-19T17:30:00.000Z"
}
```

### 2. Bitrix24 Test Endpoints

#### `GET /test/contacts`
Test API lấy danh sách contacts từ Bitrix24.

**Request:**
```http
GET /test/contacts?domain=your-domain.bitrix24.vn
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID": "123",
      "NAME": "Nguyễn Văn A",
      "PHONE": [
        {
          "VALUE": "0123456789",
          "VALUE_TYPE": "WORK"
        }
      ],
      "EMAIL": [
        {
          "VALUE": "nguyenvana@example.com",
          "VALUE_TYPE": "WORK"
        }
      ]
    }
  ],
  "total": 1
}
```

**Error Responses:**
```json
// No active token
{
  "message": "No active token found for domain: your-domain.bitrix24.vn",
  "error": "Unauthorized",
  "statusCode": 401
}

// Bitrix24 API error
{
  "message": "Bitrix24 API error: Token is invalid",
  "error": "Bad Request",
  "statusCode": 400
}
```

#### `GET /test/user`
Test API lấy thông tin user hiện tại.

**Request:**
```http
GET /test/user?domain=your-domain.bitrix24.vn
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ID": "1",
    "NAME": "Admin User",
    "EMAIL": "admin@example.com",
    "ACTIVE": true
  }
}
```

#### `GET /test/deals`
Test API lấy danh sách deals.

**Request:**
```http
GET /test/deals?domain=your-domain.bitrix24.vn
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID": "456",
      "TITLE": "Deal Title",
      "STAGE_ID": "NEW",
      "OPPORTUNITY": 1000000
    }
  ],
  "total": 1
}
```

#### `GET /test/leads`
Test API lấy danh sách leads.

**Request:**
```http
GET /test/leads?domain=your-domain.bitrix24.vn
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID": "789",
      "TITLE": "Lead Title",
      "STATUS_ID": "NEW",
      "SOURCE_ID": "WEB"
    }
  ],
  "total": 1
}
```

### 3. Contact Management API

#### `GET /contacts`
Lấy danh sách tất cả contacts.

**Request:**
```http
GET /contacts?domain=your-domain.bitrix24.vn
x-api-key: bitrix-oauth-default-key
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
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
  ],
  "total": 1
}
```

#### `GET /contacts/:id`
Lấy thông tin contact theo ID.

**Request:**
```http
GET /contacts/123?domain=your-domain.bitrix24.vn
x-api-key: bitrix-oauth-default-key
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
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
}
```

**Error Responses:**
```json
// Contact not found
{
  "message": "Contact not found",
  "error": "Not Found",
  "statusCode": 404
}
```

#### `POST /contacts`
Tạo contact mới.

**Request:**
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
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
}
```

**Error Responses:**
```json
// Validation error
{
  "message": [
    "name should not be empty",
    "email must be an email"
  ],
  "error": "Bad Request",
  "statusCode": 400
}

// Bitrix24 API error
{
  "message": "Failed to create contact in Bitrix24",
  "error": "Bad Request",
  "statusCode": 400
}
```

#### `PUT /contacts/:id`
Cập nhật contact.

**Request:**
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Nguyễn Văn B",
    "phone": "0987654321",
    "email": "nguyenvanb@example.com"
  }
}
```

**Error Responses:**
```json
// Contact not found
{
  "message": "Contact not found",
  "error": "Not Found",
  "statusCode": 404
}

// Validation error
{
  "message": [
    "email must be an email"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

#### `DELETE /contacts/:id`
Xóa contact.

**Request:**
```http
DELETE /contacts/123?domain=your-domain.bitrix24.vn
x-api-key: bitrix-oauth-default-key
```

**Response:**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

**Error Responses:**
```json
// Contact not found
{
  "message": "Contact not found",
  "error": "Not Found",
  "statusCode": 404
}

// Bitrix24 API error
{
  "message": "Failed to delete contact from Bitrix24",
  "error": "Bad Request",
  "statusCode": 400
}
```

## 📝 Data Transfer Objects (DTOs)

### ContactDto
```typescript
{
  name: string;                    // Required
  address?: {
    ward?: string;
    district?: string;
    city?: string;
  };
  phone?: string;
  email?: string;                  // Must be valid email format
  website?: string;                // Must be valid URL format
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
  };
}
```

### ContactResponseDto
```typescript
{
  id: string;
  name: string;
  address?: {
    ward?: string;
    district?: string;
    city?: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
  };
}
```

## 🔍 Error Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## 📊 Rate Limiting

- **OAuth endpoints**: Không giới hạn
- **Test endpoints**: 100 requests/minute
- **Contact API**: 1000 requests/minute

## 🔒 Security

### API Key Security
- API key được lưu trong environment variable
- Tất cả requests phải có header `x-api-key`
- API key có thể được thay đổi trong file `.env`

### OAuth Security
- OAuth tokens được lưu trữ an toàn trong MongoDB
- Tokens được tự động refresh khi hết hạn
- Domain validation để đảm bảo security

### Input Validation
- Tất cả input được validate với class-validator
- Email format validation
- URL format validation
- Required field validation

## 🧪 Testing

### Test Files
- `test-api.http`: Test cơ bản các endpoints
- `test-contact-api.http`: Test Contact Management API
- `src/test/unit/`: Unit tests cho services

### Test Commands
```bash
# Chạy unit tests
npm run test

# Chạy tests với coverage
npm run test:cov

# Chạy e2e tests
npm run test:e2e
```

## 📚 Examples

### cURL Examples

#### Health Check
```bash
curl http://localhost:3000/health
```

#### OAuth Install
```bash
curl -X POST http://localhost:3000/install \
  -H "Content-Type: application/json" \
  -d '{"code":"test123","domain":"your-domain.bitrix24.vn"}'
```

#### Get Contacts
```bash
curl http://localhost:3000/contacts?domain=your-domain.bitrix24.vn \
  -H "x-api-key: bitrix-oauth-default-key"
```

#### Create Contact
```bash
curl -X POST http://localhost:3000/contacts?domain=your-domain.bitrix24.vn \
  -H "x-api-key: bitrix-oauth-default-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "phone": "0123456789",
    "email": "nguyenvana@example.com"
  }'
```

### PowerShell Examples

#### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health"
```

#### Get Contacts
```powershell
$headers = @{
    "x-api-key" = "bitrix-oauth-default-key"
}
Invoke-RestMethod -Uri "http://localhost:3000/contacts?domain=your-domain.bitrix24.vn" -Headers $headers
```

## 🔄 Webhook Integration

### Bitrix24 Webhooks
Ứng dụng hỗ trợ nhận webhooks từ Bitrix24:

- **Install App**: `POST /install`
- **Uninstall App**: `POST /uninstall` (planned)
- **Update App**: `POST /update` (planned)

### Webhook Security
- Domain validation
- Signature verification (planned)
- Rate limiting

## 📈 Monitoring

### Health Check
- **Endpoint**: `GET /health`
- **Response**: Application status và timestamp
- **Use case**: Load balancer health checks

### Logging
- **Level**: INFO, WARN, ERROR
- **Format**: JSON
- **Output**: Console và file (planned)

### Metrics
- **Response time**: < 200ms
- **Memory usage**: ~50MB
- **Database connections**: Pooled
- **API calls**: Rate limited

## 🤝 Support

Nếu gặp vấn đề với API:

1. Kiểm tra file `README.md` để biết hướng dẫn chi tiết
2. Kiểm tra file `test-results.md` để biết kết quả kiểm thử
3. Kiểm tra logs của ứng dụng
4. Tạo issue trên GitHub với thông tin chi tiết
5. Liên hệ qua email với thông tin:
   - API endpoint
   - Request/Response
   - Error message
   - Logs
   - Steps to reproduce
