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

## 2. Eggs

### 2.1 `GET /api/eggs` (**棄用**)

- **方法**: `GET`
- **說明**: 獲取所有可用的伺服器核心 (Eggs) 列表。
- **請求參數**: 無
- **成功回應 (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "Minecraft (Java)",
      "nest": 1
    },
    {
      "id": 2,
      "name": "Minecraft (Bedrock)",
      "nest": 1
    }
  ]
  ```
- **失敗回應 (500 Internal Server Error)**:
  ```json
  {
    "success": false,
    "error": "Failed to fetch eggs list"
  }
  ```

---

## 3. IP

### 3.1 `GET /api/ip` (**棄用**)

- **方法**: `GET`
- **說明**: 檢查使用者的 IP 地址，並驗證其是否合法。
- **請求參數**:
  - `id` (string, required): 使用者 ID。
  - `ip` (string, required): 使用者 IP 地址。
- **成功回應 (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "ip": "123.123.123.123",
      "is_valid": true
    }
  }
  ```
- **失敗回應 (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "error": "User not authenticated"
  }
  ```
- **失敗回應 (500 Internal Server Error)**:
  ```json
  {
    "success": false,
    "error": "Unknown error"
  }
  ```

---

## 4. 地區

### 4.1 `GET /api/locations`(**棄用**)

- **方法**: `GET`
- **說明**: 獲取所有可用的伺服器地區列表。
- **請求參數**: 無
- **成功回應 (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "Taiwan (TPE)"
    },
    {
      "id": 2,
      "name": "Japan (NRT)"
    }
  ]
  ```
- **失敗回應 (500 Internal Server Error)**:
  ```json
  {
    "success": false,
    "error": "Failed to fetch locations list"
  }
  ```

---

## 5. 價格

### 5.1 `GET /api/pricing` (**棄用**)

- **方法**: `GET`
- **說明**: 獲取伺服器資源的價格資訊。
- **請求參數**: 無
- **成功回應 (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "base": 10,
      "cpu": 5,
      "ram": 2,
      "disk": 1,
      "databases": 3,
      "allocations": 2,
      "backups": 5
    }
  }
  ```
- **失敗回應 (500 Internal Server Error)**:
  ```json
  {
    "success": false,
    "error": "Failed to fetch pricing"
  }
  ```

---

## 6. 兌換

### 6.1 `POST /api/redeem`

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

---

## 7. 續約

### 7.1 `POST /api/renew` (**棄用**)


- **方法**: `POST`
- **說明**: 續約指定的伺服器。
- **請求Body**:
  ```json
  {
    "serverId": "YOUR_SERVER_ID"
  }
  ```
- **成功回應 (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Server renewed successfully"
  }
  ```
- **失敗回應 (400 Bad Request)**:
  ```json
  {
    "error": "Server ID is required"
  }
  ```
- **失敗回應 (401 Unauthorized)**:
  ```json
  {
    "error": "Unauthorized"
  }
  ```
- **失敗回應 (404 Not Found)**:
  ```json
  {
    "error": "Server not found"
  }
  ```

---

## 8. 重設密碼

### 8.1 `PATCH /api/resetpassword` (**棄用**)

- **方法**: `PATCH`
- **說明**: 重設使用者密碼。
- **請求參數**:
  - `id` (string, required): 使用者 ID。
  - `email` (string, required): 使用者信箱。
  - `name` (string, required): 使用者名稱。
- **成功回應 (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password reset email sent"
  }
  ```
- **失敗回應 (401 Unauthorized)**:
  ```json
  {
    "error": "Unauthorized"
  }
  ```

---

## 9. 伺服器

### 9.1 `POST /api/servers` (**棄用**)


- **方法**: `POST`
- **說明**: 創建一個新的伺服器。
- **請求Body**:
  ```json
  {
    "name": "My Awesome Server",
    "locationId": 1,
    "serverType": 1,
    "nestId": 1,
    "cpu": 100,
    "ram": 1024,
    "disk": 5120,
    "databases": 1,
    "allocations": 1,
    "backups": 1,
    "autoRenew": true
  }
  ```
- **成功回應 (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "new-server-id",
      "name": "My Awesome Server"
    }
  }
  ```
- **失敗回應 (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Missing required fields"
  }
  ```
- **失敗回應 (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "error": "Unauthorized"
  }
  ```

### 9.2 `DELETE /api/servers` (**棄用**)


- **方法**: `DELETE`
- **說明**: 刪除指定的伺服器。
- **請求參數**:
  - `id` (string, optional): 單一伺服器 ID。
  - `serverIds` (string, optional): 多個伺服器 ID，以逗號分隔。
- **成功回應 (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Server(s) deleted successfully"
    }
  }
  ```
- **失敗回應 (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Server ID(s) required"
  }
  ```
- **失敗回應 (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "error": "Unauthorized"
  }
  ```

### 9.3 `PATCH /api/servers`

- **方法**: `PATCH`
- **說明**: 修改現有伺服器的設定。
- **請求Body**:
  ```json
  {
    "serverId": "YOUR_SERVER_ID",
    "locationId": 1,
    "serverType": 1,
    "nestId": 1,
    "cpu": 150,
    "ram": 2048,
    "disk": 10240,
    "databases": 2,
    "allocations": 2,
    "backups": 2,
    "autoRenew": false
  }
  ```
- **成功回應 (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "YOUR_SERVER_ID",
      "name": "My Awesome Server"
    }
  }
  ```
- **失敗回應 (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Server ID is required"
  }
  ```
- **失敗回應 (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "error": "Unauthorized"
  }
  ```
- **失敗回應 (404 Not Found)**:
  ```json
  {
    "success": false,
    "error": "Server not found"
  }
  ```

---

## 10. 狀態

### 10.1 `GET /api/status`

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

## 11. 轉帳

### 11.1 `POST /api/transfer`

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

## 12. 使用者資訊

### 12.1 `GET /api/userinfo`

- **方法**: `GET`
- **說明**: 獲取當前登入使用者的詳細資訊。
- **請求參數**:
  - `id` (string, required): 使用者 ID。
  - `name` (string, required): 使用者名稱。
  - `email` (string, required): 使用者信箱。
  - `ip` (string, required): 使用者 IP 地址。
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