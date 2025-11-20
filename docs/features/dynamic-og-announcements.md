# 動態 Open Graph - 公告功能

## 功能概述

公告頁面支援動態 Open Graph 圖片生成，讓分享連結時能顯示精美的預覽卡片。

## 使用方式

### 分享整個公告頁面

```
https://your-domain.com/announcements
```

顯示通用的公告列表 OG 圖片。

### 分享特定公告

```
https://your-domain.com/announcements#123
```

其中 `123` 是公告的 ID。這會：
1. 自動展開該公告
2. 滾動到該公告位置
3. 動態更新頁面的 OG meta tags
4. 生成該公告專屬的 OG 圖片

## 技術實現

### URL Hash 定位

- 使用 `#id` 格式作為 anchor
- 點擊公告展開時自動更新 URL hash
- 頁面載入時自動檢測 hash 並展開對應公告
- 使用 `scrollIntoView` 平滑滾動到目標公告

### 動態 OG 圖片

**API Endpoint:** `/api/og/announcement?id={id}`

圖片優先順序：
1. **後端上傳的圖片** - 如果公告有 `image_url`，直接使用
2. **預設 OG 圖片** - 使用 `/public/OG/Murasame_25-10-9.jpg`
3. **錯誤回退** - 發生錯誤時也返回預設圖片

這樣設計的好處：
- 管理員上傳的圖片會被優先展示
- 沒有圖片的公告也有統一的品牌形象
- 簡單高效，不需要動態生成

### 客戶端 Meta 更新

`DynamicOGUpdater` 組件監聽 hash 變化，動態更新：
- `og:title`
- `og:description`
- `og:image`
- `og:type`
- `twitter:card` 相關 tags
- 頁面標題

## 範例

### 分享效果

當用戶分享 `https://your-domain.com/announcements#42` 時：

**Discord/Twitter/Facebook 會顯示：**
- 標題：公告的實際標題
- 描述：公告內容前 150 字
- 圖片：動態生成的精美卡片，包含標題、摘要、作者資訊

### 用戶體驗

1. 用戶點擊分享連結
2. 頁面載入並自動展開該公告
3. 平滑滾動到公告位置
4. 可以繼續瀏覽其他公告

## 配置

確保環境變數設定正確：

```env
NEXTAUTH_URL=https://your-domain.com
BACKEND_API_URL=https://your-backend-api.com
BACKEND_API_KEY=your-api-key
```

## Preview 頁面 vs Hash Anchor

### 一般用戶分享（已發布公告）
使用 hash anchor 方式：
```
/announcements#123
```
- 所有公告在同一頁
- 支援動態 OG
- URL 簡潔易分享

### 管理員預覽（未發布公告）
使用獨立 preview 頁面：
```
/announcements/preview/123
```
- 可以預覽未來發布的公告
- 顯示「預覽模式」警告
- 僅管理員可訪問

管理後台會自動判斷：已發布的用 hash，未發布的用 preview 頁面。

## 注意事項

- OG 圖片使用 Edge Runtime，響應速度快
- 圖片會被社交平台快取，更新可能需要時間
- Hash 變化不會觸發頁面重新載入，只更新 meta tags
- 首次分享時社交平台會抓取 OG 圖片並快取
- Preview 頁面不會被搜尋引擎索引（僅供管理員使用）
