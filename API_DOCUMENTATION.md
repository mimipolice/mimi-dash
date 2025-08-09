# API 對接文件

本文檔旨在為後端開發團隊提供與前端應用程式對接所需的 API 規範。

## 概述

本系統是一個基於 Next.js 的儀表板，用於管理遊戲伺服器和用戶資源（油幣 Droplets）。後端需要提供一系列 RESTful API 端點來支持前端的功能。

## 身份驗證

所有需要用戶身份的 API 請求都將通過 NextAuth.js 進行驗證。前端在發起請求時，會在 `Authorization` 標頭中攜帶一個 `Bearer Token`。

後端需要：
1.  驗證此 Token 的有效性。
2.  從 Token 中解析出用戶的唯一標識符（例如 Discord User ID）。

**所有 API 端點都應假設請求已經過身份驗證，並且可以從請求上下文中獲取到當前用戶的 ID。**

---

## 核心功能 API

### 1. 用戶資訊

#### `GET /api/userinfo` (**修改內容**)

獲取當前登入用戶的詳細資訊，包括油幣餘額和伺服器列表。

-   **請求參數**: 無
-   **成功回應 (200 OK)**:
    ```json
    {
      "userinfo": [
        {
          "balance": 125075, //油幣餘額整數
          "assets": {
            "oil_ticket": 1250.75, //浮點數
            "total_card_value": 223178, //整數
            "total_stock_value": 10054712, //整數
          },
          "main_statistics": {
            "total_draw": 123,
            "total_game_played": 123,
            "card_collection_rate": 70.35,
          },
          "addAt": "2025-09-26T10:00:00Z"
        }
      ]
    }
    ```
-   **錯誤回應 (401 Unauthorized)**:
    ```json
    { "error": "Unauthorized" }
    ```

---

### 2. 油幣 (Droplets) 管理

#### `POST /api/transfer`

將油幣從當前用戶轉移給另一位用戶。

-   **請求 Body**:
    ```json
    {
      "to": "RECIPIENT_DISCORD_ID", // 接收者的 Discord ID (string)
      "coins": 100.50 // 轉移的金額 (number)
    }
    ```
-   **成功回應 (200 OK)**:
    ```json
    {
      "status": "success",
      "from": 115075, // 轉帳後，發送者的餘額
      "to": 25050,   // 轉帳後，接收者的餘額
      "fee": 502,    // 手續費
      "actualTransfer": 10050 // 實際到帳金額
    }
    ```
-   **錯誤回應 (400 Bad Request / 404 Not Found)**:
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

#### `POST /api/redeem`

兌換優惠券代碼以獲取油幣。

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

---

### 3. 伺服器管理  (**更改**) 用戶資訊管理

#### `POST /api/servers` (**棄用**)

創建一個新的遊戲伺服器。

-   **請求 Body**:
    ```json
    {
      "name": "My New Server",
      "locationId": 1,
      "serverType": 5, // Egg ID
      "nestId": 1,
      "cpu": 100, // %
      "ram": 2048, // MB
      "disk": 10240, // MB
      "databases": 1,
      "allocations": 2,
      "backups": 1,
      "autoRenew": true
    }
    ```
-   **成功回應 (200 OK)**:
    ```json
    { "success": true }
    ```
-   **錯誤回應 (400 Bad Request)**:
    ```json
    {
      "success": false,
      "error": "Insufficient balance" // 或其他錯誤訊息，如 "NoViableNodeException"
    }
    ```

#### `PATCH /api/servers` (**棄用**)

修改現有伺服器的資源配置。

-   **請求 Body**:
    ```json
    {
      "serverId": 101,
      "serverType": 6, // 可選
      "nestId": 1,     // 可選
      "cpu": 150,
      "ram": 4096,
      "disk": 20480,
      "databases": 2,
      "allocations": 3,
      "backups": 2,
      "autoRenew": false
    }
    ```
-   **成功回應 (200 OK)**:
    ```json
    { "success": true }
    ```
-   **錯誤回應 (400 Bad Request)**:
    ```json
    { "success": false, "error": "Error message" }
    ```

#### `DELETE /api/servers` (**棄用**)

刪除一個或多個伺服器。

-   **請求 Query 參數**:
    -   單一刪除: `?id=101`
    -   批量刪除: `?serverIds=101,102,103`
-   **成功回應 (200 OK)**:
    ```json
    { "success": true }
    ```
-   **錯誤回應 (400 Bad Request)**:
    ```json
    { "success": false, "error": "Error message" }
    ```

#### `POST /api/renew` (**棄用**)

續費指定的伺服器。

-   **請求 Body**:
    ```json
    {
      "serverId": 101
    }
    ```
-   **成功回應 (200 OK)**:
    ```json
    { "status": "success" }
    ```
-   **錯誤回應 (400 Bad Request)**:
    ```json
    { "status": "error", "message": "Insufficient balance" }
    ```

---

### 4. 靜態數據 API (無需身份驗證)

#### `GET /api/pricing` (**棄用**)

獲取各項資源的定價。

-   **成功回應 (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "base": 5.0, // 基礎費用
        "cpu": 0.1,  // 每 1% CPU 的費用
        "ram": 0.05, // 每 1MB RAM 的費用
        "disk": 0.01,
        "databases": 1.0,
        "backups": 2.0,
        "allocations": 0.5
      }
    }
    ```

#### `GET /api/eggs` (**棄用**)

獲取所有可用的伺服器類型（遊戲類型）。

-   **成功回應 (200 OK)**:
    ```json
    {
      "status": "success",
      "data": [
        {
          "nestId": 1,
          "nestName": "Minecraft",
          "eggs": [
            { "eggId": 5, "eggName": "Paper" },
            { "eggId": 6, "eggName": "Forge" }
          ]
        }
      ]
    }
    ```

#### `GET /api/locations`  (**棄用**)

獲取所有可用的伺服器地區。

-   **成功回應 (200 OK)**:
    ```json
    {
      "status": "success",
      "data": [
        {
          "object": "location",
          "attributes": {
            "id": 1,
            "short": "TW-TPE",
            "long": "Taiwan, Taipei"
          }
        }
      ]
    }
    ```

#### `GET /api/status`

獲取伺服器創建服務的當前狀態。

-   **成功回應 (200 OK)**:
    ```json
    {
      "status": true // true: 可用, false: 暫停服務
    }