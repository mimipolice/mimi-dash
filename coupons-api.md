## `/api/admin`

所有 `/api/admin` 路徑下的端點 (endpoint) 都需要 API 金鑰 (API key) 進行驗證。您必須在請求的標頭 (header) `X-Mimi-Api-Token` 中提供此金鑰。

### GET `/coupons`

獲取所有優惠券的列表。

**成功回應 (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",                 // 優惠券的唯一 ID
      "code": "...",               // 優惠碼
      "reward_amount": "...",      // 獎勵金額
      "usage_limit": "...",        // 使用次數上限
      "expires_at": "...",         // 到期時間
      "is_active": true,           // 是否啟用
      "created_at": "...",         // 建立時間
      "updated_at": "...",         // 更新時間
      "actual_used_count": "..."   // 實際已使用次數
    }
  ]
}
```

**失敗回應 (500 內部伺服器錯誤)**

```json
{
  "success": false,
  "error": {
    "message": "Failed to fetch coupons", // 獲取優惠券失敗
    "status": 500
  }
}
```

### POST `/coupons`

建立一張新的優惠券。

**請求主體 (Request Body)**

```json
{
  "code": "...",           // 優惠碼
  "reward_amount": "...",  // 獎勵金額
  "usage_limit": "...",    // 使用次數上限
  "expires_at": "..."      // 到期時間
}
```

**成功回應 (201 Created)**

```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": "...",
      "code": "...",
      "reward_amount": "...",
      "usage_limit": "...",
      "expires_at": "...",
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    }
  },
  "status": 201
}
```

**失敗回應**

*   **400 錯誤請求** (缺少參數)
    ```json
    {
      "success": false,
      "error": {
        "message": "Code and reward amount are required", // 必須提供優惠碼和獎勵金額
        "status": 400
      }
    }
    ```
*   **400 錯誤請求** (優惠碼已存在)
    ```json
    {
      "success": false,
      "error": {
        "message": "Coupon code already exists", // 優惠碼已存在
        "status": 400
      }
    }
    ```
*   **500 內部伺服器錯誤**
    ```json
    {
      "success": false,
      "error": {
        "message": "Failed to create coupon", // 建立優惠券失敗
        "status": 500
      }
    }
    ```

### PUT `/coupons`

更新現有的優惠券。

**請求主體 (Request Body)**

```json
{
  "id": "...",             // 優惠券 ID (必需)
  "code": "...",           // 優惠碼
  "reward_amount": "...",  // 獎勵金額
  "usage_limit": "...",    // 使用次數上限
  "expires_at": "...",     // 到期時間
  "is_active": true        // 是否啟用
}
```

**成功回應 (200 OK)**

```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": "...",
      "code": "...",
      "reward_amount": "...",
      "usage_limit": "...",
      "expires_at": "...",
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    }
  }
}
```

**失敗回應**

*   **400 錯誤請求** (缺少優惠券 ID)
    ```json
    {
      "success": false,
      "error": {
        "message": "Coupon ID is required", // 必須提供優惠券 ID
        "status": 400
      }
    }
    ```
*   **404 找不到**
    ```json
    {
      "success": false,
      "error": {
        "message": "Coupon not found", // 找不到優惠券
        "status": 404
      }
    }
    ```
*   **500 內部伺服器錯誤**
    ```json
    {
      "success": false,
      "error": {
        "message": "Failed to update coupon", // 更新優惠券失敗
        "status": 500
      }
    }
    ```

### DELETE `/coupons/:id`

刪除一張優惠券。

**成功回應 (200 OK)**

```json
{
  "success": true,
  "data": {
    "message": "Coupon deleted successfully" // 優惠券刪除成功
  }
}
```

**失敗回應**

*   **400 錯誤請求** (缺少優惠券 ID)
    ```json
    {
      "success": false,
      "error": {
        "message": "Coupon ID is required", // 必須提供優惠券 ID
        "status": 400
      }
    }
    ```
*   **400 錯誤請求** (優惠券已被使用)
    ```json
    {
      "success": false,
      "error": {
        "message": "Cannot delete coupon that has been used", // 無法刪除已被使用過的優惠券
        "status": 400
      }
    }
    ```
*   **404 找不到**
    ```json
    {
      "success": false,
      "error": {
        "message": "Coupon not found", // 找不到優惠券
        "status": 404
      }
    }
    ```
*   **500 內部伺服器錯誤**
    ```json
    {
      "success": false,
      "error": {
        "message": "Failed to delete coupon", // 刪除優惠券失敗
        "status": 500
      }
    }
    ```

### GET `/coupons/:id/usage`

獲取特定優惠券的使用詳情。

**成功回應 (200 OK)**

```json
{
  "success": true,
  "data": {
    "coupon": { ... },           // 優惠券詳細資料 (同 GET /coupons)
    "usage_details": [
      {
        "id": "...",             // 使用紀錄的 ID
        "user_id": "...",        // 使用者 ID
        "used_at": "...",        // 使用時間
        "user_name": "..."       // 使用者名稱
      }
    ],
    "statistics": {
      "total_used": "...",       // 總使用次數
      "unique_users": "...",     // 不重複使用者數
      "first_used": "...",       // 首次使用時間
      "last_used": "...",        // 最後使用時間
      "remaining_uses": "..."    // 剩餘可使用次數
    }
  }
}
```

**失敗回應**

*   **401 未經授權**
    ```json
    { "success": false, "error": { "message": "Unauthorized", "status": 401 } }
    ```
*   **404 找不到**
    ```json
    { "success": false, "error": { "message": "Coupon not found", "status": 404 } }
    ```
*   **500 內部伺服器錯誤**
    ```json
    { "success": false, "error": { "message": "Failed to fetch coupon usage", "status": 500 } } // 獲取優惠券使用情況失敗
    ```