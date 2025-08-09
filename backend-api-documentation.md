# 後端 API 文件

本文檔詳細說明了後端服務提供的所有 API 端點，包括參數、請求範例和響應格式。

## API 通用設定

- **基礎 URL**: `https://your-backend-api-url.com`
- **認證**: 所有需要授權的請求都必須在標頭中包含 `Authorization: Bearer <API_KEY>`。

---

## 1. 認證

### 1.1 `GET /api/auth/[...nextauth]`

- **方法**: `GET`
- **說明**: 處理 NextAuth.js 的認證回調，用於身份驗證流程。
- **請求參數**: 無
- **成功回應 (200 OK)**:
  ```json
  {
    "message": "Authentication successful"
  }
  ```

### 1.2 `POST /api/auth/[...nextauth]`

- **方法**: `POST`
- **說明**: 處理 NextAuth.js 的 Discord 登入請求。使用者會被引導至 Discord 進行授權。
- **請求參數**: 無 (由 NextAuth.js 自動處理)
- **成功回應 (200 OK)**:
  ```json
  {
    "message": "Authentication callback received, session being created."
  }
  ```
- **失敗回應 (403 AccessDenied)**:
  ```json
  {
    "error": "AccessDenied"
  }
  ```

---


## 2. 兌換

### 2.1 `POST /api/redeem`

- **方法**: `POST`
- **說明**: 兌換優惠碼。
- **請求Body**:
  ```json
  {
    "code": "YOUR_COUPON_CODE"
  }
  ```
- **成功回應 (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Coupon redeemed successfully"
  }
  ```
- **失敗回應 (400 Bad Request)**:
  ```json
  {
    "error": "Missing coupon code"
  }
  ```
- **失敗回應 (401 Unauthorized)**:
  ```json
  {
    "error": "Unauthorized"
  }
  ```
- **失敗回應 (409 Conflict)**:
  ```json
  {
    "error": "Coupon has already been redeemed"
  }
  ```
- **失敗回應 (410 Gone)**:
  ```json
  {
    "error": "Coupon is expired"
  }
  ```



## 3. 狀態

### 3.1 `GET /api/status`

- **方法**: `GET`
- **說明**: 獲取後端服務的運行狀態。
- **請求參數**: 無
- **成功回應 (200 OK)**:
  ```json
  {
    "success": true,
    "status": true
  }
  ```
- **失敗回應 (200 OK)**:
  ```json
  {
    "success": false,
    "status": false,
    "error": "Failed to fetch backend status"
  }
  ```

---

## 4. 轉帳

### 4.1 `POST /api/transfer`

- **方法**: `POST`
- **說明**: 將點數轉移給其他使用者。
- **請求Body**:
  ```json
  {
    "to": "RECIPIENT_DISCORD_ID",
    "coins": 100
  }
  ```
- **成功回應 (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Transfer successful"
  }
  ```
- **失敗回應 (400 Bad Request)**:
  ```json
  {
    "error": "Missing recipient Discord ID"
  }
  ```
- **失敗回應 (401 Unauthorized)**:
  ```json
  {
    "error": "Unauthorized"
  }
  ```

---

## 5. 使用者資訊

### 5.1 `GET /api/userinfo`

- **方法**: `GET`
- **說明**: 獲取當前登入使用者的詳細資訊。
- **請求參數**:
  - `id` (string, required): 使用者 ID。
  - `name` (string, required): 使用者名稱。
  - `email` (string, required): 使用者信箱。
- **成功回應 (200 OK)**:
  ```json
  {
    "id": "user-id",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "coins": 500,
    "servers": [
      {
        "id": "server-id-1",
        "name": "My First Server",
        "status": "Running"
      }
    ]
  }
  ```
- **失敗回應 (401 Unauthorized)**:
  ```json
  {
    "error": "Unauthorized"
  }