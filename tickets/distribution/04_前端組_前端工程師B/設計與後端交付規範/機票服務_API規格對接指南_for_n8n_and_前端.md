# Atrip 機票資料取得服務 (AFS) API 規格與對接指南
> **適用對象**：前端開發組（工程師 A & B）、後端與 AI 組（工程師 B - n8n 串接）
> **資料來源**：機票與數據組（數據工程師已完成實作並部署之 AFS 核心服務）
> **最後更新時間**：2026-09-17

為了讓前端工程師與 n8n 輸送帶工程師能夠精確地串接機票搜尋、快取、驗價與跳轉功能，本指南詳細列出 AFS 服務的 **API 呼叫端點**、**輸入參數**、以及 **JSON 資料結構合約**。

---

## 📡 1. API 呼叫端點 (API Endpoints)

AFS 服務共提供兩個核心端點：**「機票搜尋 (Search)」** 與 **「二次驗價與聯盟轉址 (Price Refresh & Deep Link)」**。

### 端點 A：機票搜尋 (Search Flights)
* **功能**：輸入出發地、目的地與出發區間，進行機票調度、去重並輸出加權評分排序後的航班列表。
* **Method**: `GET`
* **Path**: `/api/v1/flights/search`
* **請求 Query 參數 (SearchParams)**:

| 參數名稱 | 資料型別 | 是否必填 | 範例值 | 參數說明與約束 |
| :--- | :--- | :---: | :--- | :--- |
| `origin` | `string` | **必填** | `TPE` | 出發地機場三字碼 (IATA Code)，例如台北 (TPE/TSA) |
| `destination` | `string` | **必填** | `NRT` | 目的地機場三字碼 (IATA Code)，例如東京成田 (NRT) |
| `departureDate`| `string` | **必填** | `2026-10-15` | 出發日期，格式限制為 `YYYY-MM-DD` |
| `returnDate` | `string` | *選填* | `2026-10-20` | 回程日期，格式限制為 `YYYY-MM-DD`（不填代表單程） |
| `adults` | `number` | **必填** | `1` | 乘客人數 |
| `cabin` | `string` | **必填** | `ECONOMY` | 艙等，限制為：`'ECONOMY' \| 'PREMIUM_ECONOMY' \| 'BUSINESS' \| 'FIRST'` |

---

### 端點 B：二次驗價與聯盟轉址 (Price Refresh)
* **功能**：在使用者準備點擊「前往訂票」時發動。驗證快取中的航班價格是否發生異動（漲幅 $\le 5\%$ 允許放行並警告；漲幅 $> 5\%$ 或機位售罄則阻擋），並自動注入官方聯盟 Tracking ID 產出跳轉結帳的 Deep Link。
* **Method**: `POST`
* **Path**: `/api/v1/flights/refresh`
* **請求 Body (JSON)**:
```json
{
  "offerId": "flight_offer_sample_12345"
}
```

* **回傳 Response (JSON)**:
  * **狀況 1：價格不變 (100% 正常放行)**:
    ```json
    {
      "valid": true,
      "current_price": 14500,
      "deep_link": "https://gds-provider.com/checkout?atrip_track_id=atrip-affiliate-2026&utm_source=atrip_flight_service&utm_medium=affiliate_redirect"
    }
    ```
  * **狀況 2：微幅漲價 (漲幅 $\le 5\%$ 允許放行，帶有警告訊息)**:
    ```json
    {
      "valid": true,
      "current_price": 14935,
      "deep_link": "https://gds-provider.com/checkout?atrip_track_id=atrip-affiliate-2026&utm_source=atrip_flight_service&utm_medium=affiliate_redirect",
      "warning": "提示：票價已有微幅上調，請儘速完成結帳。"
    }
    ```
  * **狀況 3：大變價 (漲幅 $> 5\%$ 觸發阻擋，要求重新搜尋)**:
    ```json
    {
      "valid": false,
      "reason": "PRICE_CHANGED",
      "new_price": 16200
    }
    ```
  * **狀況 4：機位售罄 (Sold Out)**:
    ```json
    {
      "valid": false,
      "reason": "SOLD_OUT"
    }
    ```

---

## 📦 2. 實體資料結構與 TypeScript 型別定義

前端工程師在建立 Zustand 狀態管理或進行切版時，請嚴格遵守以下由數據工程師宣告之型別：

```typescript
export interface FlightSegment {
  airline_code: string;       // 航空公司二字碼 (例如: "BR")
  airline_name: string;       // 航空公司中文名稱 (例如: "長榮航空")
  flight_number: string;      // 航班編號 (例如: "BR198")
  aircraft?: string;          // 執飛機型 (選填)
  departure: {
    airport_code: string;     // 出發機場三字碼 (例如: "TPE")
    airport_name: string;     // 出發機場名稱
    time: string;             // 出發時間 (ISO 8601 格式)
  };
  arrival: {
    airport_code: string;     // 起飛機場三字碼 (例如: "NRT")
    airport_name: string;     // 起飛機場名稱
    time: string;             // 降落時間 (ISO 8601 格式)
  };
  duration_minutes: number;   // 飛行時間 (分鐘)
}

export interface FlightOfferItem {
  id: string;                 // 唯一報價 ID (供 /refresh 驗價使用)
  provider: string;           // 資料供應商，例如 "Apify-GoogleFlights"
  outbound: {
    departure_time: string;   // 去程出發時間
    arrival_time: string;     // 去程降落時間
    duration: string;         // 去程總時間 (例如: "3h 15m")
    stops: number;            // 轉機次數 (0 代表直飛)
    segments: FlightSegment[];// 航段明細 (用於渲染轉機詳情與航司資訊)
  };
  inbound?: {                 // 回程資訊 (單程機票時此欄位為 undefined)
    departure_time: string;
    arrival_time: string;
    duration: string;
    stops: number;
    segments: FlightSegment[];
  };
  price_total_twd: number;    // 含稅總票價 (新台幣)
  baggage_included: string;   // 行李額度說明文字 (例如: "包含 1 件 23kg 托運行李")
  deep_link_url: string;      // 轉址結帳 URL
  checked_at: string;         // 查詢時間戳記
  expires_at: string;         // 20 分鐘快取失效時間 (ISO 8601)
}
```

---

## 📥 3. 真實機票回傳 JSON 資料範例 (n8n & 前端對接使用)

以下為 `/api/v1/flights/search` 回傳之 `FlightOfferItem[]` 真實 JSON 範例：

```json
[
  {
    "id": "flight:offer:TPE-NRT:20261015:BR198",
    "provider": "Apify-GoogleFlights",
    "outbound": {
      "departure_time": "2026-10-15T08:30:00.000Z",
      "arrival_time": "2026-10-15T12:45:00.000Z",
      "duration": "3h 15m",
      "stops": 0,
      "segments": [
        {
          "airline_code": "BR",
          "airline_name": "長榮航空",
          "flight_number": "BR198",
          "departure": {
            "airport_code": "TPE",
            "airport_name": "桃園國際機場",
            "time": "2026-10-15T08:30:00.000Z"
          },
          "arrival": {
            "airport_code": "NRT",
            "airport_name": "成田國際機場",
            "time": "2026-10-15T12:45:00.000Z"
          },
          "duration_minutes": 195
        }
      ]
    },
    "inbound": {
      "departure_time": "2026-10-20T14:15:00.000Z",
      "arrival_time": "2026-10-20T17:30:00.000Z",
      "duration": "4h 15m",
      "stops": 0,
      "segments": [
        {
          "airline_code": "BR",
          "airline_name": "長榮航空",
          "flight_number": "BR197",
          "departure": {
            "airport_code": "NRT",
            "airport_name": "成田國際機場",
            "time": "2026-10-20T14:15:00.000Z"
          },
          "arrival": {
            "airport_code": "TPE",
            "airport_name": "桃園國際機場",
            "time": "2026-10-20T17:30:00.000Z"
          },
          "duration_minutes": 255
        }
      ]
    },
    "price_total_twd": 14500,
    "baggage_included": "包含 1 件 23kg 托運行李",
    "deep_link_url": "https://atrip.app/redirect?offer_id=flight:offer:TPE-NRT:20261015:BR198",
    "checked_at": "2026-09-17T10:14:14.266Z",
    "expires_at": "2026-09-17T10:34:14.266Z"
  }
]
```

---

## 🛠️ 4. 對接核心考量與注意紅線 (Hard Red-Lines)

1. **快取失效機制**：機票為 20 分鐘短期快取。前端或 n8n 寫入行程的 `flight_data` 時，必須存入 `checked_at` 與 `expires_at`，過期後不顯示舊報價，引導使用者重新搜尋。
2. **無障礙對話框 (Dialog)**：前端工程師 A 實作訂票按鈕時，若 `/refresh` 回傳 `valid: true` 但帶有 `warning` 警告（微變價），必須先彈出 Toast 告知使用者「機票價格略有上浮」再跳轉；若回傳 `valid: false`（大變價或售罄），必須彈出 Modal 並阻擋跳轉，引導使用者於畫布上重新一鍵搜尋最新機票。
3. **n8n 原子性寫入**：後端 B 串接 n8n `TRACK2-06` 時，請將此 `FlightOfferItem` 的陣列整包寫入 `public.itineraries.flight_data` JSONB 欄位。
