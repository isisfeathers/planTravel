# Atrip TRACK0-06 完整素材與工程交接包 v1.0

日期：2026-09-18

## 交付判定

原工單 §6 指定的 **13 項交付物已齊備**。此前缺少流程總覽，本次依定稿 mapping 補製 PNG。設計素材與 handoff 可交接；**原工單 §5／§8 要求的 Simulator 與 iOS／Android 驗收尚未完成，不能宣稱整張工單所有工作均已驗收通過**。

- 素材交付：Completed（13/13）。
- Engineering Handoff／Cross-track audit：Completed。
- Simulator、真機、runtime、deep links、跨模組 Final QA：Pending。
- 本包未重設計或修改既有 LINE JSON／artwork，也不含 n8n／Webhook 實作。

## 接手閱讀順序

1. `DELIVERY_CHECKLIST.md`：13 項對照與驗收狀態。
2. `02_Copy_and_Handoff/line_chat_flow_handoff.md`：v1.3 交付包版；優先閱讀 Decision／Action Required、Owner、結案條件。
3. `03_Previews/line_chat_flow_overview.png`：事件→範本→Action。
4. `01_LINE_JSON/`：7 份正式模板；置換 runtime 資料後才能用。
5. `02_Copy_and_Handoff/line_message_copy_spec.md`：未登入／草稿／未知輸入等文案。
6. `04_QA_and_Integration/`：測試版 JSON、預期案例、本地視覺與歷史整合稽核；不是正式平台驗收證明。

## 版本與依賴

- Rich Menu 建立使用 `01_LINE_JSON/richmenu_bounds_v2.json`；配 `05_TRACK0-04_Reference/richmenu_atrip_2500x843.png`。
- `05_TRACK0-04_Reference/richmenu_bounds.json` 為舊版追溯資料，**不要作本次部署設定**。
- 04 Ready／Error 原檔保留；其 literal 示例文字及裸 placeholder 必須由 adapter 處理。
- Help topics bundle 只取選定 topic 的 message；Simulator 檔只供測試。
- Canonical route 尚待 Frontend 裁定；不要把 /trips 預定值當成已部署頁面。
- `06_Source_Specs/` 附原工單、Final Design System 及 TRACK3-01 供串接查閱。
- 跨 TRACK0-01～06 的稽核摘要包含在 handoff；本包是 TRACK0-06 交付，不重複收納所有其他 TRACK 的大型交付 ZIP。
- 原本 06-4 audit 的判定屬歷史，與 v1.3 handoff 不同時依 v1.3；S08 流程圖缺件本次已補齊。

## 工程與驗收注意

先取得路由及 PDF 通道裁定，再完成 placeholder、fallback、state routing、分享遮蔽及 Schema 同步。每個 owner 與 closing 條件詳見 handoff。Simulator／真機仍是原工單 acceptance，交接給 LINE／QA 承接不等於已通過。

`PACKAGE_VALIDATION.json` 只記錄本次檔案齊備、JSON parse、原檔一致及 PNG 可解碼檢查。`SHA256SUMS.txt` 用於完整性校驗，不包含自身。
