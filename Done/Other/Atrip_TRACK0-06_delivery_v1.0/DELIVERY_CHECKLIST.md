# 原工單交付清單對照

依 TRACK0-06 原工單 §6；13 項全數具備。這是檔案齊備判定，不是平台驗收通過。

| # | 交付檔 | 狀態 |
|---|---|---|
| 1 | `01_LINE_JSON/richmenu_bounds_v2.json` | 已交付 |
| 2 | `01_LINE_JSON/line_welcome_message.json` | 已交付 |
| 3 | `01_LINE_JSON/flex_message_no_itinerary.json` | 已交付 |
| 4 | `01_LINE_JSON/flex_message_itinerary_generating.json` | 已交付 |
| 5 | `01_LINE_JSON/flex_message_my_itinerary.json` | 已交付 |
| 6 | `01_LINE_JSON/quick_reply_help_menu.json` | 已交付 |
| 7 | `01_LINE_JSON/help_topic_messages.json` | 已交付 |
| 8 | `02_Copy_and_Handoff/line_message_copy_spec.md` | 已交付 |
| 9 | `02_Copy_and_Handoff/line_chat_flow_handoff.md` | 已交付 |
| 10 | `03_Previews/flex_preview_no_itinerary.png` | 已交付 |
| 11 | `03_Previews/flex_preview_itinerary_generating.png` | 已交付 |
| 12 | `03_Previews/flex_preview_my_itinerary.png` | 已交付 |
| 13 | `03_Previews/line_chat_flow_overview.png` | 已交付（本次補製） |

## 原工單 acceptance

| 項目 | 狀態與證據 |
|---|---|
| 情境、文案、Action、動態欄位、缺值政策 | 文件／模板已交付，詳 handoff |
| 熱區覆蓋與指定 JSON 結構 | 前輪本地 32/32 通過；不等於 LINE 驗證 |
| 三份新增 Flex Simulator | Pending；04_QA 提供測試用輸入 |
| iOS／Android 顯示與點擊 | Pending；現有 PNG 為本地預覽 |
| Runtime 與正式 routes | Pending；Owner 與結案条件見 handoff |
| 聊天流程總覽 | 本次補製 PNG；S08／A06 缺件關閉 |

不能將測試 JSON、QA expected cases 或本地預覽當作正式執行證據。
