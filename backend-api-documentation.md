# API 專案文檔

本文檔詳細介紹了專案後端提供的所有 API 端點，旨在為前端開發人員提供清晰的調用指南。

---

## 總覽

所有 API 都遵循 RESTful 設計原則，並使用 JSON 格式進行數據交換。成功的響應將包含 `success: true`，而失敗的響應將包含 `success: false` 和一個描述錯誤的 `message` 或 `error` 字段。

---

## 認證

需要認證的 API 端點分為兩類：

1.  **進階 API:** 需要在請求標頭的 `Authorization` 字段中提供有效的 API 金鑰，格式為 `Bearer YOUR_API_KEY`。
2.  **用戶 API:** 需要在請求標頭中包含 `X-User-ID` 來識別當前用戶。

---

## API 端點詳解

### 進階 API


#### 4. 資金轉帳 

- **端點:** `/api/admin/transfer`
- **描述:** 執行的用戶間資金轉帳。
- **認證:** 需要 API 金鑰。

  - **執行轉帳 (POST):**
    - **請求體:**
      ```json
      {
        "sender_id": "123456789012345678",
        "receiver_id": "876543210987654321",
        "amount": 500
      }
      ```
    - **成功響應 (200):**
      ```json
      {
        "success": true,
        "message": "Transfer completed successfully",
        "transfer_details": {
          "sender_id": "123456789012345678",
          "receiver_id": "876543210987654321",
          "gross_amount": 500,
          "fee_amount": 15,
          "net_amount": 485,
          "sender_balance_after": 9500,
          "receiver_balance_after": 1485
        }
      }
      ```

  - **獲取轉帳歷史 (GET):**
    - **查詢參數:** `user_id`, `limit`, `offset`
    - **成功響應 (200):**
      ```json
      {
        "success": true,
        "data": {
          "transfers": [
            {
              "id": 1,
              "sender_id": "123456789012345678",
              "receiver_id": "876543210987654321",
              "transaction_type": "OIL_TRANSFER",
              "gross_amount": 500,
              "fee_amount": 15,
              "net_amount": 485,
              "sender_balance_after": 9500,
              "receiver_balance_after": 1485,
              "created_at": "2024-12-03T14:30:00Z",
              "sender_name": "SenderUser",
              "receiver_name": "ReceiverUser"
            }
          ],
          "pagination": {
            "limit": 50,
            "offset": 0,
            "total": 1
          }
        }
      }
      ```

---

### 公共 API

#### 1. 兌換優惠碼

- **端點:** `POST /api/redeem`
- **認證:** `X-User-ID` 標頭。
- **請求體:**
  ```json
  {
    "code": "WELCOME2024"
  }
  ```
- **成功響應 (200):**
  ```json
  {
    "success": true,
    "message": "Coupon redeemed successfully.",
    "reward_amount": 100
  }
  ```

#### 2. 獲取後端狀態

- **端點:** `GET /api/status`
- **成功響應 (200):**
  ```json
  {
    "success": true,
    "status": true
  }
  ```

#### 4. 獲取用戶信息

- **端點:** `GET /api/userinfo`
- **認證:** API 金鑰。
- **查詢參數:** `id` (必填, `string`)
- **成功響應 (200):**
  ```json
  {
    "id": "123456789012345678",
    "name": "User 12345",
    "balance": 5000,
    "assets": {
      "oil_ticket": 10.5,
      "total_card_value": 223178,
      "total_stock_value": 10054712
    },
    "main_statistics": {
      "total_draw": 150,
      "total_game_played": 123,
      "card_collection_rate": 70.35
    },
    "addAt": "2023-01-15T10:30:00.000Z"
  }
  ```


---

### 認證 API

- **端點:** `/api/auth/...`
- **描述:** 由 `NextAuth.js` 庫自動處理，用於實現 OAuth 用戶認證。前端應使用 NextAuth 的客戶端庫與之交互。