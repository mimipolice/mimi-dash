# 後端 API 文件

本文檔詳細說明了後端服務提供的所有 API 端點，包括參數、請求範例和響應格式。

## API 通用設定

- **基礎 URL**: `https://your-backend-api-url.com` 暫時先以 `http://localhost:2000` 為例
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
-   **請求 Body**:
    ```json
    {
      "code": "SUMMER2025" // 優惠券代碼 (string)
    }
    ```
-   **成功回應 (200 OK)**:
    ```json
    {
      "status": "success",
      "added": 50075, // 本次兌換增加的油幣
      "coins": 175025 // 兌換後用戶的總油幣
    }
    ```
-   **錯誤回應 (400 Bad Request / 404 Not Found)**:
    ```json
    {
      "status": "error",
      "errors": [
        "Coupon not found", // 優惠券不存在
        "Coupon already used by this user", // 已使用過
        "Coupon usage limit reached" // 優惠券已達使用上限
      ]
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
- **請求 Body**:
  ```json
  {
    "to": "RECIPIENT_DISCORD_ID", // 接收者的 Discord ID (string)
    "coins": 100.50 // 轉移的金額 (number)
  }
  ```
- **成功回應 (200 OK)**:
  ```json
  {
    "status": "success",
    "from": 115075, // 轉帳後，發送者的餘額
    "to": 25050,   // 轉帳後，接收者的餘額
    "fee": 502,    // 手續費
    "actualTransfer": 10050 // 實際到帳金額
  }
  ```
- **錯誤回應 (400 Bad Request / 404 Not Found)**:
  ```json
  {
    "status": "error",
    "errors": [
      "Receiver not found", // 接收者不存在
      "Insufficient balance", // 餘額不足
      "Transfer amount too low", // 金額過低
      "Same user transfer is not allowed" // 不能轉給自己
    ]
  }
  ```

---

## 5. 使用者資訊

### 5.1 `GET /api/userinfo`

- **方法**: `GET`
- **說明**: 獲取當前登入使用者的詳細資訊。
- **請求參數**:
  - `id` (string, required): 使用者 ID。
- **成功回應 (200 OK)**:
  ```json
  {
    "id": "user-id",
    "name": "John Doe",
    "balance": 500,
    "assets": {
      "oil_ticket": 1250.75,
      "total_card_value": 223178,
      "total_stock_value": 10054712
    },
    "main_statistics": {
      "total_draw": 123,
      "total_game_played": 123,
      "card_collection_rate": 70.35
    },
    "addAt": "2025-09-26T10:00:00Z"
  }
  ```
- **失敗回應 (401 Unauthorized)**:
  ```json
  {
    "error": "Unauthorized"
  }