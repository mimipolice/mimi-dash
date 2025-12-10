# Backend API 文檔

本文檔詳細介紹了專案後端提供的所有 API 端點，旨在為前端開發人員提供清晰的調用指南。

---

## 總覽

所有 API 都遵循 RESTful 設計原則，並使用 JSON 格式進行數據交換。

**標準響應格式：**
- **成功：** `{ "success": true, "data": ... }`
- **失敗：** `{ "success": false, "error": { "message": "...", "status": ... } }`

---

## 認證

需要認證的 API 端點分為兩類：

1. **管理員 API (`/api/admin/*`)：** 需要在請求標頭 `X-Mimi-Api-Token` 中提供有效的 API 金鑰
2. **用戶 API：** 需要在請求標頭 `X-User-ID` 中提供用戶 ID
3. **公開 API：** 無需認證

---

## 公告與 Banner API

### 公告 (Announcements)

公告是顯示在 `/announcements` 頁面的完整內容公告。

#### 獲取所有公告 (公開)

- **端點：** `GET /api/announcements`
- **認證：** 無需認證
- **成功響應 (200 OK)：**
  ```json
  [
    {
      "id": "2025-11-08-new-dashboard",
      "title": "New Feature Launch!",
      "author": { "name": "Amamiya", "avatarUrl": "/images/amamiya.jpg" },
      "content": "We are excited to announce...",
      "imageUrl": "/images/announcements/dashboard.png",
      "severity": "info",
      "publishedAt": "2025-11-08"
    }
  ]
  ```

#### 創建公告 (管理員)

- **端點：** `POST /api/admin/announcements`
- **認證：** 管理員
- **請求體：**

| 欄位 | 類型 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| `title` | `string` | 是 | 公告標題 |
| `content` | `string` | 是 | Markdown 格式的完整內容 |
| `severity` | `string` | 是 | 嚴重程度：`info`, `warning`, `alert` |
| `imageUrl` | `string` | 否 | 圖片 URL |
| `publishedAt` | `string` | 否 | 發布日期 (YYYY-MM-DD)，預設為當前日期 |

- **成功響應 (201 Created)：** 返回創建的公告對象

#### 更新公告 (管理員)

- **端點：** `PUT /api/admin/announcements/[id]`
- **認證：** 管理員
- **請求體：** 同創建公告，所有欄位可選
- **成功響應 (200 OK)：** 返回更新後的公告對象

#### 刪除公告 (管理員)

- **端點：** `DELETE /api/admin/announcements/[id]`
- **認證：** 管理員
- **成功響應 (200 OK)：**
  ```json
  { "message": "Announcement deleted successfully" }
  ```

---

### Banner

Banner 是顯示在 Dashboard 頂部的簡短通知，可設定顯示時間範圍。

#### 獲取活躍 Banner (公開)

- **端點：** `GET /api/banners/active`
- **認證：** 無需認證
- **說明：** 返回當前時間範圍內活躍的 banner
- **成功響應 (200 OK)：**
  ```json
  [
    {
      "id": "c2a8c9a8-3d1f-4f6d-9b3d-2e1b3e3a4c1b",
      "title": "Scheduled Maintenance",
      "shortDescription": "Services will be temporarily unavailable this Sunday.",
      "url": "/docs/status",
      "severity": "warning",
      "displayFrom": "2025-11-10T00:00:00.000Z",
      "displayUntil": "2025-11-16T23:59:59.999Z"
    }
  ]
  ```

#### 獲取所有 Banner (管理員)

- **端點：** `GET /api/admin/banners`
- **認證：** 管理員
- **成功響應 (200 OK)：** 返回所有 banner（包含未啟用的）

#### 創建 Banner (管理員)

- **端點：** `POST /api/admin/banners`
- **認證：** 管理員
- **請求體：**

| 欄位 | 類型 | 必填 | 說明 |
| :--- | :--- | :--- | :--- |
| `title` | `string` | 是 | Banner 標題 |
| `severity` | `string` | 是 | 嚴重程度：`info`, `warning`, `alert` |
| `shortDescription` | `string` | 否 | 簡短描述 |
| `url` | `string` | 否 | 點擊後跳轉的 URL |
| `displayFrom` | `string` | 否 | 開始顯示時間 (ISO 8601) |
| `displayUntil` | `string` | 否 | 結束顯示時間 (ISO 8601) |

- **成功響應 (201 Created)：** 返回創建的 banner 對象

#### 更新 Banner (管理員)

- **端點：** `PUT /api/admin/banners/[id]`
- **認證：** 管理員
- **請求體：** 同創建 banner，所有欄位可選
- **成功響應 (200 OK)：** 返回更新後的 banner 對象

#### 刪除 Banner (管理員)

- **端點：** `DELETE /api/admin/banners/[id]`
- **認證：** 管理員
- **成功響應 (200 OK)：**
  ```json
  { "message": "Banner deleted successfully" }
  ```

---

## 優惠券 API

### 獲取所有優惠券 (管理員)

- **端點：** `GET /api/admin/coupons`
- **認證：** 管理員
- **成功響應 (200 OK)：**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "...",
        "code": "WELCOME2024",
        "reward_amount": 100,
        "usage_limit": 1000,
        "expires_at": "2025-12-31T23:59:59.999Z",
        "is_active": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z",
        "actual_used_count": 50
      }
    ]
  }
  ```

### 創建優惠券 (管理員)

- **端點：** `POST /api/admin/coupons`
- **認證：** 管理員
- **請求體：**
  ```json
  {
    "code": "WELCOME2024",
    "reward_amount": 100,
    "usage_limit": 1000,
    "expires_at": "2025-12-31T23:59:59.999Z"
  }
  ```
- **成功響應 (201 Created)：**
  ```json
  {
    "success": true,
    "data": {
      "coupon": { /* 優惠券對象 */ }
    },
    "status": 201
  }
  ```
- **失敗響應：**
  - **400：** 缺少必填欄位或優惠碼已存在
  - **500：** 伺服器錯誤

### 更新優惠券 (管理員)

- **端點：** `PUT /api/admin/coupons`
- **認證：** 管理員
- **請求體：**
  ```json
  {
    "id": "...",
    "code": "WELCOME2024",
    "reward_amount": 150,
    "usage_limit": 2000,
    "expires_at": "2025-12-31T23:59:59.999Z",
    "is_active": true
  }
  ```
- **成功響應 (200 OK)：** 返回更新後的優惠券對象
- **失敗響應：**
  - **400：** 缺少優惠券 ID
  - **404：** 找不到優惠券
  - **500：** 伺服器錯誤

### 刪除優惠券 (管理員)

- **端點：** `DELETE /api/admin/coupons/:id`
- **認證：** 管理員
- **成功響應 (200 OK)：**
  ```json
  {
    "success": true,
    "data": { "message": "Coupon deleted successfully" }
  }
  ```
- **失敗響應：**
  - **400：** 缺少優惠券 ID 或優惠券已被使用
  - **404：** 找不到優惠券
  - **500：** 伺服器錯誤

### 獲取優惠券使用詳情 (管理員)

- **端點：** `GET /api/admin/coupons/:id/usage`
- **認證：** 管理員
- **成功響應 (200 OK)：**
  ```json
  {
    "success": true,
    "data": {
      "coupon": { /* 優惠券對象 */ },
      "usage_details": [
        {
          "id": "...",
          "user_id": "123456789012345678",
          "used_at": "2025-11-10T10:30:00.000Z",
          "user_name": "User123"
        }
      ],
      "statistics": {
        "total_used": 50,
        "unique_users": 45,
        "first_used": "2025-11-01T08:00:00.000Z",
        "last_used": "2025-11-10T10:30:00.000Z",
        "remaining_uses": 950
      }
    }
  }
  ```

### 兌換優惠碼 (用戶)

- **端點：** `POST /api/redeem`
- **認證：** 需要 `X-User-ID` 標頭
- **請求體：**
  ```json
  {
    "code": "WELCOME2024"
  }
  ```
- **成功響應 (200 OK)：**
  ```json
  {
    "success": true,
    "message": "Coupon redeemed successfully.",
    "reward_amount": 100
  }
  ```

---

## 資金轉帳 API

### 執行轉帳 (管理員)

- **端點：** `POST /api/admin/transfer`
- **認證：** 管理員
- **請求體：**
  ```json
  {
    "sender_id": "123456789012345678",
    "receiver_id": "876543210987654321",
    "amount": 500
  }
  ```
- **成功響應 (200 OK)：**
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

### 獲取轉帳歷史 (管理員)

- **端點：** `GET /api/admin/transfer`
- **認證：** 管理員
- **查詢參數：**
  - `user_id` (可選)：篩選特定用戶的轉帳記錄
  - `limit` (可選)：每頁數量，預設 50
  - `offset` (可選)：偏移量，預設 0
- **成功響應 (200 OK)：**
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

## 用戶 API

### 獲取用戶信息

- **端點：** `GET /api/userinfo`
- **認證：** API 金鑰
- **查詢參數：**
  - `id` (必填)：用戶 ID
- **成功響應 (200 OK)：**
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

## 系統 API

### 獲取後端狀態

- **端點：** `GET /api/status`
- **認證：** 無需認證
- **成功響應 (200 OK)：**
  ```json
  {
    "success": true,
    "status": true
  }
  ```

### 認證 API

- **端點：** `/api/auth/*`
- **說明：** 由 NextAuth.js 自動處理 Discord OAuth 認證流程
- **使用方式：** 前端使用 NextAuth 客戶端庫與之交互

---

## 錯誤處理

所有 API 在發生錯誤時都會返回統一格式：

```json
{
  "success": false,
  "error": {
    "message": "錯誤描述",
    "status": 400
  }
}
```

**常見 HTTP 狀態碼：**
- `200` - 成功
- `201` - 創建成功
- `400` - 請求錯誤（參數缺失或無效）
- `401` - 未授權
- `404` - 資源不存在
- `500` - 伺服器內部錯誤
