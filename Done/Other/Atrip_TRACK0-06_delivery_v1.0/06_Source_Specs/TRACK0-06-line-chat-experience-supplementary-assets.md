# TRACK0-06: LINE 聊天室互動流程與補充訊息素材設計

* **工單編號**：TRACK0-06
* **所屬軌道**：Track 0 - 視覺 UI/UX 設計組
* **建議負責人**：1 人（互動／通訊 UI/UX 設計師）
* **優先級**：High (P1)
* **前置依賴 (Dependencies)**：`TRACK0-01`、`TRACK0-04`、`TRACK3-01`
* **狀態**：ready-for-agent

---

## 0. 開工前確認檢查清單 (Pre-Execution Sign-off / 執行者自檢)
> ⚠️ **執行者開工前必讀・問詢門檻**：動工前請確認以下項目皆已就緒並手動勾選，未確認前置產出前切勿盲目施工：
- [ ] **既有素材確認**：已取得 TRACK0-04 的 Rich Menu、完成通知 Flex、失敗重試 Flex、視覺預覽與交件說明。
- [ ] **品牌規範確認**：已依 TRACK0-01 使用品牌藍青 `#277E99`、主要行動亮綠 `#B9E85A`、深墨文字 `#182B36` 與指定背景色。
- [ ] **工程流程確認**：已閱讀 TRACK3-01，理解 `follow`、`my_itinerary`、`help_menu`、`help topic` 與 `retry_itinerary` 的用途。
- [ ] **產品邊界確認**：LINE 聊天室只負責快速入口、狀態摘要、功能說明與非同步通知；複雜操作一律導向 LIFF。
- [ ] **紅線與禁止事項確認**：不得設計目前資料庫與 API 無法支援的今日行程、即時天氣、航班異動、真人客服或自由對話型 AI 功能。
- [ ] **執行者開工簽核**：我已完全理解本任務之驗收標準與前置交付物，確認無缺漏並正式開工。

---

## 1. 任務說明 (What to Build)
補足 Atrip LINE 聊天室在 TRACK0-04 之後仍缺少的互動素材，使使用者從加入好友、點擊 Rich Menu、查詢目前行程、查看使用說明，到收到完成或失敗通知，都有一致且可直接交付 LINE Bot 工程師串接的訊息畫面與 JSON 範本。

本工單不重做既有 Rich Menu 主視覺，也不重做完成通知與失敗重試 Flex；僅補充尚未設計的聊天狀態、Quick Reply、文案與更新後 Action 規格。

---

## 2. 輸入與輸出資料規格 (Data Specification)

### 2.1 輸入規格
* TRACK0-04 既有素材：
  * `richmenu_atrip_2500x843.png`
  * `richmenu_bounds.json`
  * `flex_message_itinerary_ready.json`
  * `flex_message_error_retry.json`
* TRACK3-01 LINE Bot Action：
  * `action=my_itinerary`
  * `action=help_menu`
  * `action=help&topic=create`
  * `action=help&topic=edit`
  * `action=help&topic=share`
  * `action=help&topic=retry`
  * `action=retry_itinerary&itinerary_id={ITINERARY_ID}`
* LIFF 預定路由：
  * `/wizard`
  * `/dashboard`
  * `/trips/{ITINERARY_ID}`
  * `/trips/{ITINERARY_ID}/edit`

### 2.2 輸出規格
* **加入好友歡迎訊息**：說明 Atrip 能做什麼，提供「開始規劃」與「查看使用說明」。
* **我的行程補充狀態**：無行程、生成中、已完成三種主要畫面。
* **草稿／未登入狀態文案**：以簡潔文字訊息或按鈕卡呈現，不另製作大型 Flex。
* **使用說明 Quick Reply**：開始規劃、調整行程、分享行程、生成失敗。
* **四段操作說明訊息**：每段含一句說明及一個明確 LIFF 行動按鈕。
* **未知輸入防呆文案**：引導使用者使用下方 Rich Menu。
* **更新後 Rich Menu Action JSON**：將「我的行程」及「使用說明」改為 Postback。
* **聊天流程總覽**：標示觸發事件、訊息範本名稱與工程 Action。

---

## 3. 必須補齊的聊天室畫面 (Required Message States)

### 3.1 加入好友歡迎訊息

**觸發條件**：使用者加入 LINE 官方帳號，收到 `follow` event。

**建議文案**：

> 歡迎使用 Atrip 👋  
> 選擇目的地、旅行天數與喜好，就能快速產生你的專屬自由行行程。你也可以從下方選單隨時查看目前行程。

**操作按鈕**：
* `開始規劃`：URI 開啟 LIFF `/wizard`。
* `查看使用說明`：Postback `action=help_menu`。

**呈現形式**：簡潔文字＋Quick Reply，避免首次加入就出現過大的 Flex Message。

### 3.2 我的行程：尚未建立

**建議文案**：

> 目前還沒有行程喔！  
> 現在就讓 Atrip 幫你規劃下一趟旅行。

**操作按鈕**：`規劃新旅程` → LIFF `/wizard`。

**呈現形式**：小型 Flex Message，保留品牌色與單一主要 CTA。

### 3.3 我的行程：正在生成

**動態欄位**：`{{TRIP_TITLE}}`、`{{JOB_STATUS_TEXT}}`、`{{PROGRESS_URL}}`。

**建議內容**：

> {{TRIP_TITLE}}  
> 正在安排你的專屬行程……  
> 目前進度：{{JOB_STATUS_TEXT}}

**Job 狀態顯示文字**：

| 系統狀態 | 使用者看到的文字 |
| --- | --- |
| `queued` | 已收到規劃需求 |
| `searching_flight` | 正在查詢航班資訊 |
| `generating_itinerary` | 正在安排每日行程 |
| `validating` | 正在進行最後檢查 |

**操作按鈕**：`查看處理進度` → LIFF 等待頁。

### 3.4 我的行程：已完成

**動態欄位**：`{{HERO_IMAGE_URL}}`、`{{TRIP_TITLE}}`、`{{DESTINATION}}`、`{{DAYS}}`、`{{TAG_1}}`、`{{TAG_2}}`、`{{ITINERARY_URL}}`。

**建議內容**：
* 標示「當前關注行程」。
* 顯示目的地、行程名稱、天數與最多兩個特色標籤。
* 保留一個主要 CTA「開啟完整行程」。

**呈現形式**：Bubble Flex Message。第一版不顯示今日行程、行李完成度或即時狀態，避免依賴尚未穩定的資料欄位。

### 3.5 未完成登入／草稿狀態

| 狀態 | 建議文案 | 按鈕 |
| --- | --- | --- |
| 尚未綁定帳號 | 尚未完成 Atrip 登入，請重新開啟 Atrip 完成登入。 | 開啟 Atrip |
| 行程為草稿 | 這趟行程尚未完成設定，可以繼續填寫旅行條件。 | 繼續設定 |

**呈現形式**：文字訊息＋Quick Reply，不需另外製作 Hero 圖或大型卡片。

### 3.6 使用說明 Quick Reply

**主訊息**：

> 嗨！想了解哪一項功能呢？請選擇下方項目 👇

| 顯示名稱 | Postback Data | 後續內容 |
| --- | --- | --- |
| 開始規劃 | `action=help&topic=create` | 說明如何進入標籤精靈 |
| 調整行程 | `action=help&topic=edit` | 說明在 LIFF 拖曳調整 |
| 分享行程 | `action=help&topic=share` | 說明去識別化分享流程 |
| 生成失敗 | `action=help&topic=retry` | 說明重新嘗試與修改條件 |

### 3.7 四段使用說明文案

**開始規劃**
> 點擊下方「開始規劃」，選擇目的地、旅行天數與偏好，就能讓 Atrip 為你產生專屬行程。

**調整行程**
> 開啟行程後，可以長按景點卡片右側把手調整順序，系統會儲存更新後的安排。

**分享行程**
> 在行程主畫布點擊「分享」，即可建立去識別化分享頁；分享內容不會顯示個人資料、偏好快照與預算。

**生成失敗**
> 若行程生成失敗，可以保留原本設定重新嘗試，或修改條件後再次送出。

### 3.8 未知輸入與未知 Action

**建議文案**：

> 我目前還無法理解這段訊息。你可以使用下方選單開始規劃、查看行程或開啟使用說明。

不得使用「AI 正在思考」或暗示 Bot 能自由回答旅遊問題的文案。

---

## 4. Rich Menu Action 更新規格

Rich Menu 圖片維持原版，不需重新繪製；僅更新 `richmenu_bounds.json` 的 Action：

| 選單區塊 | Action Type | 設定值 |
| --- | --- | --- |
| Atrip 智慧自由行 | `uri` | `https://liff.line.me/{{LIFF_ID}}/wizard` |
| 我的行程 | `postback` | `action=my_itinerary` |
| 使用說明 | `postback` | `action=help_menu` |

如使用 `displayText`，建議分別設定為「查看我的行程」與「查看使用說明」，不得顯示程式用 Action 字串。

---

## 5. 詳細執行步驟 (Step-by-Step Checklist)
- [ ] 盤點 TRACK0-04 既有素材，不重做完成通知與失敗重試 Flex。
- [ ] 繪製「尚未建立行程」小型 Flex Message。
- [ ] 繪製「正在生成」小型 Flex Message，保留狀態文字動態欄位。
- [ ] 繪製「當前關注行程已完成」摘要 Flex Message。
- [ ] 建立加入好友歡迎訊息 JSON 與 Quick Reply。
- [ ] 建立使用說明主選單 Quick Reply JSON。
- [ ] 建立開始規劃、調整行程、分享行程、生成失敗四段說明 JSON。
- [ ] 整理未登入、草稿與未知輸入的簡短文字規格。
- [ ] 更新 `richmenu_bounds.json`，將「我的行程」與「使用說明」改為 Postback。
- [ ] 製作三張新增 Flex Message 的手機預覽圖。
- [ ] 製作一張 LINE 聊天流程總覽，標示事件、訊息範本與工程 Action。
- [ ] 在 LINE Flex Message Simulator 驗證新增 JSON，確認文字換行、圖片比例與按鈕可點擊。
- [ ] 將所有動態欄位、Action、LIFF 路由與設計說明交付 TRACK3-01 工程師。

---

## 6. 交付檔案 (Deliverables)
1. `richmenu_bounds_v2.json`
   - 原三格座標不變，更新 URI／Postback Action。
2. `line_welcome_message.json`
   - 加入好友歡迎文字與兩個 Quick Reply。
3. `flex_message_no_itinerary.json`
   - 尚未建立行程的小型 Flex Message。
4. `flex_message_itinerary_generating.json`
   - 行程生成中狀態與進度文字 Flex Message。
5. `flex_message_my_itinerary.json`
   - 已完成之當前關注行程摘要 Flex Message。
6. `quick_reply_help_menu.json`
   - 使用說明四個主題按鈕。
7. `help_topic_messages.json`
   - 四段使用說明訊息與對應 LIFF 按鈕。
8. `line_message_copy_spec.md`
   - 未登入、草稿、未知輸入及全部動態欄位文案規格。
9. `line_chat_flow_handoff.md`
   - 事件、Action、範本檔名、動態欄位與工程串接對照。
10. `flex_preview_no_itinerary.png`
11. `flex_preview_itinerary_generating.png`
12. `flex_preview_my_itinerary.png`
13. `line_chat_flow_overview.png` 或 Figma 流程圖連結

---

## 7. 動態欄位交接規格

| 占位值 | 資料用途 |
| --- | --- |
| `{{LIFF_ID}}` | 正式 LIFF 應用 ID |
| `{{ITINERARY_ID}}` | 目前關注行程 ID |
| `{{TRIP_TITLE}}` | 行程名稱 |
| `{{DESTINATION}}` | 目的地 |
| `{{DAYS}}` | 行程天數 |
| `{{TAG_1}}`、`{{TAG_2}}` | 最多兩個特色標籤 |
| `{{JOB_STATUS_TEXT}}` | 已轉為使用者語言的生成階段 |
| `{{HERO_IMAGE_URL}}` | 公開 HTTPS 目的地圖片 |
| `{{ITINERARY_URL}}` | 完整行程 LIFF URL |
| `{{PROGRESS_URL}}` | 等待畫面 LIFF URL |

設計師只定義欄位位置、文字長度與空值呈現方式；真實資料查詢與置換由 TRACK3-01 工程師負責。

---

## 8. 驗收條件 (Acceptance Criteria)
- [ ] 新增素材完整涵蓋加入好友、無行程、生成中、已完成、使用說明與未知輸入情境。
- [ ] `richmenu_bounds_v2.json` 的三個熱區完整覆蓋 2500 × 843 px，無重疊、無漏空。
- [ ] 「我的行程」與「使用說明」均使用正確 Postback，Atrip 智慧自由行保留 URI。
- [ ] 三份新增 Flex JSON 通過 LINE Flex Message Simulator 驗證。
- [ ] Flex Message 於 iOS／Android 預覽無文字截斷、圖片變形或按鈕超出畫面。
- [ ] 所有主要 CTA 文案為清楚動作詞，例如「開始規劃」「查看處理進度」「開啟完整行程」。
- [ ] Quick Reply 的顯示名稱不超過 LINE 限制，且與實際回覆主題一致。
- [ ] 已定義長標題、無圖片、標籤不足兩個及動態資料缺漏時的替代呈現。
- [ ] 設計稿未暗示聊天室可以直接拖曳、編輯、即時查天氣或自由詢問 AI。
- [ ] 交接文件能讓 TRACK3-01 工程師明確找到每個 Action 對應的 JSON 範本及動態欄位。

---

## 9. 不在本工單範圍 (Out of Scope)
* 重畫原有 2500 × 843 Rich Menu 主視覺。
* 重做既有 `flex_message_itinerary_ready.json` 與 `flex_message_error_retry.json`。
* 撰寫 n8n、Webhook、Supabase 查詢或 LINE API 程式。
* 在 LINE 聊天室內直接編輯行程、拖曳景點或勾選行李。
* 設計客服工單、真人即時客服、自由對話 AI、天氣或航班異動服務。

