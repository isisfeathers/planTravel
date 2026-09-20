# TRACK0-06-4｜LINE JSON 整合檢查

## 結論

- JSON 解析：PASS
- Rich Menu 熱區：8/8 PASS
- 整合檢查：17/20 項直接 PASS
- Blocking failures：0
- Route confirmation：1
- Engineering / handoff notes：2

## Rich Menu v2

原 2500 × 843 圖片與三個 bounds 完全不變。

1. Atrip 智慧自由行 → URI `https://liff.line.me/{{LIFF_ID}}/wizard`
2. 我的行程 → Postback `action=my_itinerary`, displayText `查看我的行程`
3. 使用說明 → Postback `action=help_menu`, displayText `查看使用說明`

## 已通過的主要串接

- `follow` → Welcome → `/wizard` / `action=help_menu`
- `action=my_itinerary` → no itinerary / generating / completed / failed / draft / login state router
- `action=help_menu` → 四個 help topic
- `action=help&topic=create|edit|share|retry` 均有對應訊息
- `action=retry_itinerary&itinerary_id=…` 仍存在於 TRACK0-04 Error Flex
- 新三張 Flex 的 CTA 與動態欄位完整

## Final handoff 前仍需確認

### 1. Canonical itinerary route
TRACK0-04 Ready Flex 仍為：
`/canvas/ITINERARY_ID`

TRACK0-06 規格定義：
`/trips/{{ITINERARY_ID}}`

這是唯一明顯的 route contract 差異。請由 TRACK3-01 決定正式 route；TRACK0-06 新模板已用 `{{ITINERARY_URL}}` 避免寫死。

### 2. Placeholder syntax
TRACK0-04 使用 `LIFF_ID` / `ITINERARY_ID`；
TRACK0-06 新模板使用 `{{LIFF_ID}}` / `{{ITINERARY_ID}}`。

建議工程端在最終串接前統一 replacement convention。

### 3. Help topic JSON 用法
`help_topic_messages.json` 是 lookup bundle，不是可整包直接送 LINE 的單一 message payload。
工程端應依 topic 取出對應的 `message` object 再送出。

### 4. URI placeholder 必須先替換
所有 `{{LIFF_ID}}`、`{{PROGRESS_URL}}`、`{{ITINERARY_URL}}` 等設計 placeholder 必須在送 LINE API 前完成置換。

## 判定

TRACK0-06-4 本身沒有 Blocking issue。
剩餘項目屬工程 route / placeholder contract，應在 TRACK0-06-5 Handoff + Final QA 明確簽核。
