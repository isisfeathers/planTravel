# TRACK0-06-5｜Engineering Handoff + Cross-TRACK Final QA

日期：2026-09-18｜版本：v1.3（交付包版）｜範圍：TRACK0-01～06，及其 Final SPEC／TRACK3-01 串接契約。

**TRACK0-06-5｜LINE Engineering Handoff 已完成；Cross-track audit 已完成；Final QA overall status = Pending。**

LINE artwork／JSON／Action mapping 的交接資訊已完成整理，本輪僅更新交接文件，未修改既有定稿素材。以下涉及跨模組契約、工程實作與平台驗收，請接手的 LINE 負責人依 Owner 協調處理，再進行 Final QA closing。交接文件完成不代表 runtime 或整體產品驗收已通過；也不代表所有交付素材均已齊備（流程圖仍見 S08）。

## 本次打包補充｜2026-09-18

**素材交付：13/13 齊備；工程交接與跨 TRACK audit：Completed；Final QA：Pending。**

本次依已定稿 mapping 補製 `../03_Previews/line_chat_flow_overview.png`，涵蓋 follow、Rich Menu、六種行程情境、Help、非同步通知及未知輸入。S08／A06 的「流程圖尚缺」已在本交付包關閉；以下原稽核文字保留作歷程，其缺件描述不再代表本包現況。圖中保留既有 B01／S05 未決事項，未自行裁定。

只補流程文件，未更動正式 artwork／JSON。本版新增物為流程總覽、交付對照清單、README、封裝檢查紀錄；沒有新增平台測試通過紀錄。06-4 audit 是歷史檢查，若其狀態與本文件不同，以本文件為準。

## 交接注意事項｜給 LINE／n8n 接手負責人

本節將既有問題集中成可分派清單；後文 B01～B05、S01～S08 的證據與技術細節仍保留。Owner 為建議責任角色，接手時由團隊指定實際人員；不是已完成指派的紀錄。交付者負責本輪素材整理與稽核，跨模組裁定及補實作由對應 Owner 承接；Track 0 自身尚缺素材也保留追蹤。

### Decision Required｜需裁定

| ID／對應問題 | 需裁定事項 | Owner／協作 | 結案條件 |
|---|---|---|---|
| D01／B01 | 確認唯一 canonical itinerary route：現有 `/canvas/...` 與預定 `/trips/...` 的關係；一併確認 Progress、Draft、登入入口及登入後返回目標頁 | Frontend／Track 1 主責；LINE/n8n／TRACK3-01 串接 | 提供 route manifest 與正式 LIFF 設定；Ready、My Itinerary、Draft、Progress、Login 點擊均抵達正確頁面；LINE URL builder 與 mapping 同步 |
| D02／B03 | PDF 從 LINE 取得的正式方式：既有「直接 PDF 附件推播」契約需改為平台可支援的交付方式；下載連結為建議方案，尚待確認 | Product/Spec＋PDF 匯出服務主責；LINE/n8n 協作 | 確認交付方式、存取權與到期行為，更新契約；實測可從 LINE 取得對應 PDF |

### Action Required｜需實作／同步

| ID／對應問題 | 交接動作 | Owner／協作 | 結案條件 |
|---|---|---|---|
| A01／§9.2–9.3、B05 | 工程 adapter 統一 `{{FIELD_NAME}}` 約定；處理 04 裸 placeholder 及 Ready 未標記的示例文字；用 JSON object 賦值後序列化 | LINE/n8n／TRACK3-01 | 留存 input→rendered message；無殘留 placeholder、示例圖或空 URI；另用非東京案例驗證標題、目的地、天數、標籤均已替換；通過平台驗證 |
| A02／B02 | 公開分享資料契約沿用既定遮蔽要求，補伺服器端 DTO 白名單與 API／資料層同步；不重新裁定是否公開預算 | Backend／分享 API／資料層主責；Frontend 協作，Product/Spec 確認規格一致 | 實際未登入回應不含禁止欄位，直接查詢亦不可繞過；有效、失效與刪除分享案例通過 |
| A03／B04 | 同步 `is_time_anchor`、`anchor_start_at`、`anchor_end_at`、`anchor_reason` 至型別、Schema、n8n 輸出與 fixture | Schema／資料層＋n8n 主責；Frontend／PDF 協作 | 有／無錨點資料均通過驗證；LIFF 拖曳限制及 PDF 呈現一致 |
| A04／S04、S05、S07 | 同步既定 fallback、主表／job 狀態與 Action routing；補 active 指標例外及 retry 保護 | LINE/n8n 主責；資料層／Frontend 協作 | 依 §6 與 §9.3 產出分支結果；缺值不送空 URI；Dashboard fallback 同步 CTA；異常指標不擅自挑最新行程；重試不越權、不重複建任務 |
| A05／S01–S03、S06、B05 | 前端套用 Final Tokens；補 responsive、長文字、component states、Header／Card／Typography／Icon／Navigation 與 PDF 分頁驗收 | Frontend＋PDF 工程师＋QA；LINE/n8n 負責 LINE 平台項目 | 依 §7、§9.4 提交實際頁面／裝置紀錄；PDF 符合 Final 邊界、頁碼與多頁分組要求；LINE Simulator、API、iOS／Android 驗收留存 |
| A06／S08 | 補交 `line_chat_flow_overview.png` 或可驗證 Figma 流程圖連結 | Track 0 交付者 | 接手者可開啟且內容與 Action／Route／State mapping 一致；表格不能代替指定素材 |

### QA Status｜完成範圍與關閉方式

| 範圍 | 狀態 |
|---|---|
| LINE Engineering Handoff 文件與資訊整理 | **Completed** |
| Cross-track consistency audit | **Completed** |
| 既有本地 JSON 語法與指定結構檢查 | **PASS：32/32**；沿用前輪紀錄，本次文字修訂未重跑平台測試 |
| 完整素材齊備 | **Pending**：S08 流程圖仍待補交 |
| Runtime／平台／跨模組 Final QA | **Pending** |

**Final QA closing：**對應 Owner 完成裁定、實作與文件同步後，提交「問題 ID、處理結果、版本／測試環境、驗證證據」。QA 依 B01～B05 及 §7 必要 acceptance 重新驗證；必要 Should Fix 也須完成，或由規格／驗收負責人記錄具理由的例外與影響。只有裁定完成、沒有實測證據，不可將 Final QA 改為 Passed。Nice to Have 不作為本輪必需結案條件。

LINE 接手者先協調 D01／D02，再完成 A01／A04 與平台驗證；A02／A03／A05 分派對應模組，A06 回交 Track 0 補件。所有進度回填同一份問題清單，避免跨模組項目無人承接。

## 1. Source of truth 與實際覆核範圍

| 代號 | 實際讀取來源 | 本次採用方式 |
|---|---|---|
| S01 | `TRACK0-01-design-system-and-tokens_FINAL_v1.1.md` | 色彩、共用元件、字體、RWD 最終規範；明文取代舊工單 |
| S02 | `TRACK0-02-dashboard-wizard_FINAL_v1.1.md`；`Atrip_TRACK0-02_delivery_v1(1).zip` | Final v1.1 優先；包內 handoff／SVG／PNG 作交付比對 |
| S03 | `Atrip_TRACK0-03_delivery-20260918T055122Z-1-001.zip`，內含 `TRACK0-03_handoff_spec.md` v2.1 | 時間軸／拖曳／行李功能定稿；共用樣式衝突依 S01 |
| S04 | `Atrip_TRACK0-04_delivery-20260918T075237Z-1-001.zip`，交件說明 v1.1 | 原 Rich Menu 圖、Ready／Error Flex 保留；僅 Rich Menu Action 被 06 v2 取代 |
| S05 | `TRACK0-05-print-pdf_FINAL_v1.1.md`；`Atrip_TRACK0-05_delivery_v1(1).zip` | Final v1.1 優先；包內 CSS／HTML／v1.0 規格核對差異 |
| S06 | `TRACK0-06-line-chat-experience-supplementary-assets.md`；06-2～4 現有 JSON、文案、QA cases、預覽 | 已核准 LINE 專用呈現與 fallback 沿用 |
| S07 | `Final SPEC-20260918T053119Z-1-001(1).zip` | 產品、DDL、型別／Schema、API 與非同步工作流的契約依據 |
| S08 | `TRACK3-01-line-bot-webhook-and-push-service(1).md` | Bot 上下文、簽章、推播與重試責任 |
| S09 | `Atrip_Track0_to_Track1_Frontend_Handoff_v1.0.md`／Frontend Handoff Pack | 跨畫面交接與版本追溯 |

本輪直接讀取 04／06 的 18 份 JSON（包含範本、Simulator、契約及稽核檔），重跑語法與關鍵結構檢查。視覺覆核包括 02 mockup board、03 主畫布、My Itinerary 三張邊界 QA 圖，以及原 PDF 的唯一一頁。其餘既有預覽的先前驗收記錄不視為本輪真機驗證。另已讀取 Design Tokens ZIP 內 atrip.tokens.json、atrip.component-states.json 與 tailwind.config.js；配置載入結果見第9節。

版本判斷採文件明確 supersede 與功能責任，**不因 ZIP 上傳較晚就把裡面的 v1.0 當新定稿**。Final SPEC 內部若互相矛盾，以更具體 DDL／API 識別可執行契約並記錄差異；不宣稱已修改資料庫。

本次為交付檔稽核，沒有前端／Webhook 執行程式、已部署資料庫、正式 LIFF 設定或真機結果。PNG 是設計預覽，不能證明 LINE 原生排版或響應式實作通過。已將原 PDF 的唯一一頁渲染後實際檢視；未更動或重新產生原 PDF，未執行多頁壓力案例。PDF 的單頁可讀性與多頁分頁 acceptance 分開判定。

## 2. 已由既有規格解決的事項（不再要求重新決策）

| 項目 | 沿用結論 | 依據 |
|---|---|---|
| 當前關注行程 | 使用 `profiles.active_itinerary_id`；不自行挑最新建立／最近修改行程 | S08 §1；S07 API §2.5 |
| Primary CTA | `#B9E85A`＋`#182B36`；舊橘色不回用 | S01 §2；S02 §2 |
| Rich Menu | 2500×843；三區 834／833／833；圖不改，Action 使用 v2 | S04；S06 §4 |
| 行程狀態 | `draft / generating / completed / failed` | S07 DDL、DATA_STRUCTURES、Schema |
| Job 狀態 | `queued / searching_flight / generating_itinerary / validating / completed / failed` | S07 DDL、Schema；S06 §3.3 |
| 行李分類 | `essentials / clothing / electronics / toiletries` | S03 §5；S07 Schema |
| 行程費用幣別 | 依 `meta.currency`；不自行換成日圓符號 | S03 §0；S05 v1.0 §8 |
| Help CTA | create→`/wizard`；edit/share/retry→`/dashboard` | S06 Copy Spec §4 |
| LINE 摘要長標題 | 依 06 核准 `wrap:true,maxLines:2`；完整內容由 LIFF 查看 | S06 正式 JSON＋conditional contract |
| 無圖／無標籤 | 移除 Hero；零 tag 同時移除 separator＋tag row | S06 conditional contract |

LINE Flex 使用平台文字級距、可點擊 box CTA、14px 圓角；不機械套用 Web 的 52px/full-rounded button。此為既有 TRACK0-04／06 平台呈現，非本次要求重新設計。Web 的 200% 文字驗收仍必須另做。

## 3. Blocking（4 項契約衝突＋1 項驗收關卡）

### B01｜路由契約尚未一致，無法完成 LINE→LIFF 點擊驗收

- **證據：**S04 Ready JSON 的 Hero／CTA 為 `/canvas/ITINERARY_ID`；S06 §2.1 是「預定路由」`/trips/{ITINERARY_ID}`。S06 `PROGRESS_URL` 未定具體頁面；Copy Spec 將 `/dashboard` 當登入入口假設。S07 已查內容未給可裁定這兩條 UI path 的 canonical route；REST API path 不等於 LIFF route。
- **影響：**完成推播、我的行程、Draft、等待頁與未登入跳轉無法保證抵達正確畫面。
- **負責：**Track 1 路由擁有者＋TRACK3-01。
- **處理：**沿用实际前端已存在的 canonical route（取得實作證據後），集中 URL builder；舊 `/canvas` 若仍需支援則映射／redirect。先保留原設計檔，runtime 指定正確 URL。
- **結案：**提供 route manifest、正式 LIFF ID 設定及 Ready／Completed／Draft／Progress／Login 的點擊證據。不可把 `/trips` 自行宣告為已實作。

### B02｜分享文案承諾與公開資料契約不完整一致

- **證據：**S06 Help share 承諾不顯示個資、偏好快照、預算。S07 PRD 畫面6也要求遮蔽花費預算與偏好快照；API §3.1 卻允許整個 `itinerary_data`／`flight_data`，僅點名遮蔽 `preference_snapshot.budget_level`。Schema 的 `itinerary_data.meta.budget_level`、活動 `cost_estimate` 等仍含相關資料。DDL 的公開 SELECT policy 是列存取條件，所交付 SQL 未見相應欄位投影／巢狀遮蔽。
- **影響：**按所交付 API／DDL 直接實作，不能證明回應符合去識別化承諾；此處是文件／契約缺口，不是已確認线上洩漏。
- **負責：**分享 API／資料層工程師＋Track 1。
- **處理：**沿用 PRD 保護要求，建立伺服器端公開 DTO 白名單；依 S07《07-安全運維驗收與開發排程》§1.2 既有定稿排除 budget_level／cost_estimate，不只在畫面隱藏；無需重新討論是否可公開預算。維持已核准 Help 文案。
- **結案：**未登入分享實際回應不含被禁止欄位；直接查詢路徑也不能繞過保護；補有效／失效／刪除分享案例。

### B03｜「LINE 直接推送 PDF 附件」與 Messaging API 能力不符

- **證據：**S07 API §5.1 定義 PDF 上傳後直接推送檔案至聊天室；LINE 官方可發送 message types 未提供任意 PDF/file attachment message。
- **影響：**阻擋宣稱「實體 PDF 附件直接送入聊天室」的匯出端到端驗收；不阻擋 A4 PDF 本身的排版工作。
- **負責：**PDF 匯出服務＋TRACK3-01／產品規格擁有者。
- **建議修正（尚非既有定稿）：**沿用現有 PDF renderer，推送下載連結或具 URI 的訊息；定義存取權與到期行為，同步 API 回應文案。本次沒有新增 PDF 通知設計或更改既有 Flex。
- **結案：**修正交付通道契約，實測使用者可從 LINE 取得同一份 PDF。
- **官方依據：**[LINE Message types](https://developers.line.biz/en/docs/messaging-api/message-types/)，查核日 2026-09-18。

### B04｜時間錨點定稿未同步至 Final SPEC Schema／型別

- **證據：**S03 v2.1 §0／§3.5 要求直接綁定 `is_time_anchor`、`anchor_start_at`、`anchor_end_at`、`anchor_reason`，禁止依 category／description 推斷；S07 `ActivityItem` 及相應 JSON Schema／DATA_STRUCTURES 未含這四欄。
- **影響：**Track 1 時間錨點與拖曳限制、Track 0-05 列印保留資訊缺共同資料契約；不能因設計稿顯示正常便宣稱資料串接完成。
- **負責：**Schema／n8n 資料輸出工程師＋Track 1。
- **處理：**沿用 S03 的錨點設計，將既有定義補入型別／Schema／fixture；日期時區、nullable 與驗證條件由資料契約擁有者同步。禁止用文字推論替代欄位。
- **結案：**含／不含錨點資料均通過 Schema，且 LIFF 拖曳與 PDF 讀取一致。所提供 S03 包未附其提及的 mock JSON／data mapping 檔，需補可追溯版本。

### B05｜最終平台驗收證據尚未取得（驗收關卡，不是已知 JSON 語法錯誤）

- S06 明列 Simulator 與 iOS／Android 驗收；現有 local PNG／QA cases 不等於實際 LINE 測試結果。
- 32/32 本地靜態通過不涵蓋 LINE schema validation、正式圖片載入、動態 renderer、資料查詢、深連結、Webhook 或真機操作。
- **負責：**TRACK3-01＋QA；Track 1 負責 LIFF RWD；PDF 工程師負責分頁。
- **結案：**補 Simulator、Messaging API 驗證、iOS／Android、正式 route 點擊、320／375／390／430 Web QA、200% 文字與 PDF 頁尾壓力案例的實際紀錄。

## 4. Should Fix（8 項）

| ID | 衝突／缺漏與來源 | 處理方式／結案條件 | 負責 |
|---|---|---|---|
| S01 | S03 §3.2 卡片 radius18、title17/800，預覽一般卡有陰影；S01 共用卡片 radius20、h2 16/24/600、一般卡 shadow.none；S03 僅寫360–430 RWD；Checkbox Disabled40% 與 Final 可讀性原則需一致 | 共用樣式採 Final Tokens，補320驗收與可讀 Disabled；不重排畫面。卡片選取高亮2px與鍵盤 Focus3px是不同狀態，不要混為同一問題；Button 不縮放也不能直接推論禁止專用 drag scale | Track 1／Design System |
| S02 | S05 Final 為四邊15mm／base10pt；包內 v1.0、CSS為上12／左右15／下11mm，`@page margin:0`；頁尾離底5.2mm | print implementation 同步 Final；避免 page margin＋sheet padding 重複累加；同步舊範例註記；原 PDF 頁尾只有 Day 2，缺 Final 要求的頁碼，需於正式 renderer 補齊 | PDF 工程師 |
| S03 | S05 CSS `.segment-with-destination{display:contents}`；整組不拆頁缺實際 box 保證；目前單頁範例不足以證明頁尾行為 | 使用既有 v1.0 §6 建議的實際 block grouping，跑長卡片、Transit＋下一卡、Day Header 壓力測試；不得僅憑 break-inside 宣稱通過 | PDF 工程師 |
| S04 | S06 conditional contract 有 Dashboard fallback，但漏寫 CTA 改「開啟 Atrip」；QA cases 已有正確規則；Generating QA cases 也已定義缺 title/job/progress 的 fallback，先前 handoff 漏整合 | 交接採 QA cases 正確 CTA；沿用既有 cases：缺title→你的 Atrip 旅程、缺status→正在準備行程、缺progress URL→隱藏整個CTA。補 renderer 執行證據。Missing URL 不可輸出空字串、# 或殘留 placeholder | TRACK3-01 |
| S05 | S08 舊描述任意文字回摘要；S06 已改 Unknown Input；active_itinerary_id 空值但仍有行程、指向刪除／封存資料、未知 job／過期 retry 尚缺完整回覆契約 | Action routing 以 S06 具體規格為準；補異常資料分支，不將「未選取」說成「從未建立」，不擅自挑最新行程。retry需驗身分／擁有權、任務狀態與重複請求保護 | TRACK3-01／資料層 |
| S06 | 五張正式 Flex 均未設定 `scaling`；部分 CTA text 未 wrap；tags maxLines1；本地預覽另含頂端藍線、陰影、占位圖與大留白，並非逐項對應 JSON | 保留核准布局；補 LINE 字級放大、長tag、CTA換行驗收並記錄平台例外。預覽加註 illustrative；不得把本地PNG當LINE實際輸出。是否統一scaling需在平台驗收落定 | TRACK3-01／QA |
| S07 | S07 SPEC.md部分敘述／驗收、工作流圖把 itineraries 與 jobs 一起寫 queued；DDL與API明確主表generating／job queued | 以DDL／API既有有效值為準，修正文案與圖；LINE Job status僅控制生成階段文字，不新增主表 queued enum | 資料層／n8n |
| S08 | S06 §6 要求 line_chat_flow_overview.png 或 Figma 流程圖連結；本次取得的交付與檔名搜尋未找到此項，現有 handoff 是文字／表格 | 補交既有流程圖或可驗證連結；不得將 mapping 表直接計為 PNG／Figma deliverable 已完成 | Track 0 |

補充：S03 Figma 交件檔明確寫「沒有可驗證 Figma URL」，改附 SVG；本次不得把 Figma Master／元件綁定說成已驗證。**已找到且成功載入 token／Tailwind 檔；撤回舊版「未取得」的缺口。** 配置 require 成功不等於前端已引用或 Tailwind CSS 已建置。

## 5. Nice to Have（2 項）

| ID | 建議 | 範圍 |
|---|---|---|
| N01 | 補 Figma 正式 URL與畫面→component 對照，減少查找時間 | 不以重建 Figma 作本次交接前提；SVG及Final規格仍有效 |
| N02 | 將人工 QA cases 升為固定測試 fixture：記錄 input、rendered JSON、平台／裝置、截圖及時間 | 現有cases是expected outcome，不是執行結果 |

## 6. Engineering Handoff Summary

### 6.1 事件 → 範本 → Action 對照

| 入口／事件 | 条件 | 輸出 | 後續 |
|---|---|---|---|
| `follow` | 加入好友 | `line_welcome_message.json` | 開始規劃→wizard；使用說明→help_menu |
| Rich Menu 左 | 點 Atrip | URI | `https://liff.line.me/{{LIFF_ID}}/wizard` |
| Rich Menu 中 | 點我的行程 | `action=my_itinerary` | 查帳號→active_itinerary_id→下列狀態 |
| Rich Menu 右 | 點使用說明 | `action=help_menu` | `quick_reply_help_menu.json` |
| my_itinerary | 帳號未綁定 | Copy Spec §5 text＋Quick Reply | 開啟 Atrip→登入入口；現稿dashboard，B01驗證 |
| my_itinerary | 確認沒有行程 | `flex_message_no_itinerary.json` | 開始規劃→wizard |
| my_itinerary | draft | Copy Spec §6 text＋Quick Reply | 繼續設定→trips/{id}/edit；缺ID→dashboard |
| my_itinerary | generating | `flex_message_itinerary_generating.json` | 查看處理進度→PROGRESS_URL |
| my_itinerary | completed | `flex_message_my_itinerary.json` | 開啟完整行程→ITINERARY_URL |
| my_itinerary | failed | S04 `flex_message_error_retry.json` | retry_itinerary＋itinerary_id |
| help | topic=create/edit/share/retry | `help_topic_messages[topic].message` | create→wizard；其餘→dashboard |
| retry_itinerary | 已驗證指定行程可重試 | 工程端重排任務；使用既有狀態呈現 | 不將help retry視作真正重試指令 |
| 未知輸入／action／topic | 無支持路由 | Copy Spec §7 純文字 | Rich Menu 回復操作 |
| job完成／失敗通知 | n8n非同步事件 | S04 Ready／Error | push；使用事件的itinerary_id，而非改推當前關注行程 |

查詢時用已驗證 LINE user 對應帳號，再查其 active 行程與關聯 job；需檢查擁有權／deleted_at。空 active 指標不等同沒有任何行程；該例外待 S05 結案。封存是 `is_archived`，不是第五個 itinerary status。

### 6.2 Payload 邊界

- 正式 `flex_message_*.json` 已是 `{type:"flex",altText,contents:{type:"bubble",...}}` message object。
- Messaging API 使用 `messages:[message]`，另帶 replyToken 或 push target；不得重複包成 flex-of-flex。
- 使用只接受 bubble 的節點／Simulator 欄位時，傳 `.contents`；不要假設整份message object與bubble可互換。
- `help_topic_messages.json` 是 lookup bundle；只選 `[topic].message`，不是把四個topic物件當messages。
- `richmenu_bounds_v2.json` 是 Rich Menu 建立資料，不是聊天 message。
- conditional contract／QA cases／audit／route mapping 都是工程參考資料，不得送 LINE API。
- S04 裸 `LIFF_ID`／`ITINERARY_ID` 与 S06 `{{FIELD}}` 都需 runtime 正規化。以 JSON object 欄位賦值後序列化，避免全檔字串置換導致引號／換行破壞JSON。
- Simulator JSON 含測試資料，不能當 production；送出前攔截 unresolved placeholder、example.com／測試ID、空URI／圖片URL。

### 6.3 Runtime 欄位與 fallback

| 欄位 | 資料來源／型別 | 既定呈現與限制 |
|---|---|---|
| LIFF_ID | 環境設定字串 | 正式設定；非使用者輸入 |
| ITINERARY_ID | 查詢由profiles選定；push/retry用事件所指ID | 驗擁有權；不可產生 `/trips//edit` |
| TRIP_TITLE | 行程title；push契約trip_title | My Itinerary與Generating缺值均→「你的 Atrip 旅程」，沿用各自QA cases |
| DESTINATION | 行程destination | 缺值移除該項 |
| DAYS | `total_days` 經格式化 | display-ready；示例「5 天 4 夜」不是要求Flex自行運算；夜數規則不足時不捏造 |
| TAG_1／TAG_2 | tags顯示字串 | 取前兩個非空值並compact，template加#；0tag移除分隔線＋整列 |
| JOB_STATUS_TEXT | 關聯job.status映射 | queued=已收到規劃需求；searching_flight=正在查詢航班資訊；generating_itinerary=正在安排每日行程；validating=正在進行最後檢查 |
| HERO_IMAGE_URL | 公開HTTPS目的地圖 | 缺圖移除hero；資料來源／失效處理需工程補齊，不使用測試圖冒充正式目的地 |
| ITINERARY_URL | 集中URL builder | 缺值移除hero.action；有dashboard則CTA改「開啟 Atrip」；無fallback則移除CTA並記錄錯誤 |
| PROGRESS_URL | 同一行程／job之等待頁URL | B01確認route；依Generating QA cases缺值→隱藏整個CTA，不發空URI |

metadata兩項→兩欄；單項→左對齊；全缺→移除整列。若單剩DAYS，除刪除destination外還要將原本 `align:end` 改為左對齊。Hero存在而行程URL缺失仍可保留圖片，但不能讓Hero誤連dashboard。

缺CTA時應移除空footer（若已無其他內容），避免空白容器；此為工程清理要求，不新增視覺。對tags與title的長字串，應保留已核准顯示政策並用真機驗收，不以縮字掩蓋問題。

### 6.4 責任分工與交接順序

1. **Track 1**：沿用Final Tokens與02／03布局；提供canonical route、登入後返回目標頁、active itinerary維護。
2. **資料／n8n**：主表與job分離；補錨點契約；公開分享DTO；正確關聯job與retry保護。
3. **TRACK3-01**：簽章驗證、event／postback routing、讀取正確使用者資料、render／置換／fallback、LINE驗證與推送錯誤記錄。
4. **PDF工程師**：Final15mm規格與分頁實作；與Bot協調可用的PDF交付通道。
5. **QA**：以下證據通過後才簽Final QA；不重做已定稿視覺。

## 7. 本次 QA 實測與未測項目

| 檢查 | 本次結果 | 證據／邊界 |
|---|---|---|
| JSON parse | 18/18 通過 | 15份06 JSON＋3份04 JSON；包含simulator與工程參考檔，不能稱為18份正式訊息 |
| Rich Menu bounds／canvas／coverage／action | 5/5 通過 | 與04座標完全一致；2500×843；三區無gap／overlap；URI＋2 postbacks |
| Welcome／Help Menu count及label | 4/4 通過 | Quick Reply為2／4；label≤20 |
| Help topics keys／message形狀 | 2/2 通過 | create/edit/share/retry，各1個CTA |
| 三張新增Flex envelope | 3/3 通過 | type:flex、bubble與非空altText |
| **本地靜態合計** | **32/32 通過** | 自本次讀取檔案重算；不是沿抄06-4分數 |
| 共用主要色彩／CTA語意 | 符合核准方向 | 04／06綠底深墨字；02／03／05主要品牌語言一致，局部規格差異見Should Fix |
| 06本地視覺 | 本輪My Itinerary三張QA圖已檢視 | 顯示無圖、0/1/2tags、metadata／URLfallback安排；與原生JSON排版非完全等價 |
| Dynamic conditional renderer | 未執行 | 沒有實作程式；QA cases只列預期 |
| LINE Simulator／API驗證 | 未執行 | 需要實際平台測試資料／紀錄 |
| iOS／Android與deep link | 未執行 | 不以本地PNG代替 |
| Web 320／375／390／430、200%字級 | 未執行 | 靜態SVG／PNG不能證明RWD |
| PDF原件／多頁壓力 | 單頁已檢視；多頁未執行 | A4 595.28×841.89pt；現頁卡片完整，缺頁碼；不能據此簽多頁通過 |
| Figma Master／tokens載入 | Figma未驗證；配置本地載入成功 | primary、h2、radius與Final一致；前端實際套用仍待驗證 |

### 最終簽核用案例

| 案例 | 必看結果 | 目前 |
|---|---|---|
| follow→wizard／help | 兩個入口正確，未登入可完成登入 | Pending |
| 三個Rich Menu區域 | 圖與熱區對上；我的行程／help返回正確訊息 | Pending |
| 六個my_itinerary情境 | 未綁定、無行程、draft、generating、completed、failed | Pending |
| active指標例外 | 有行程但active空、刪除、封存、非本人／過期資料 | Pending：先補Should Fix S05 |
| generating四階段 | 每階段文案正確；完成／失敗不顯示卡住的進度 | Pending |
| My Itinerary缺值組合 | 無圖、0/1/2tags、metadata四組、URL三組、缺title | Pending runtime；local預覽已存在 |
| 長文與放大 | 320／375基準、長tag／title／CTA、LINE大字級 | Pending |
| retry重複／過期／非本人 | 不重複建立不必要任務、不操作別人的行程 | Pending |
| 公开分享 | 未登入可讀允許內容；不暴露禁止欄位 | Pending：B02 |
| PDF匯出 | A4、15mm、頁碼、整卡／錨點／交通分組與下載路徑 | Pending：B03／S02／S03 |

## 8. 交付判定

- **TRACK0-06-5 Engineering Handoff／跨TRACK檔案稽核文件：完成。Final QA與完整素材驗收仍待結案。** 本文件即所需 `line_chat_flow_handoff.md`，包含事件、範本、欄位、fallback、責任與驗收表。
- **不簽「所有Final QA已通過」：**4項契約Blocking與1項驗收關卡待關閉。
- 保留原Rich Menu圖、Ready／Error與06正式JSON；本輪沒有重新設計或寫入生產環境。
- 下一步由各責任人按B01～B05逐項提供實作／驗收證據；已有定稿事項依第2節直接沿用。

外部平台參考（2026-09-18查核）：[LINE Message types](https://developers.line.biz/en/docs/messaging-api/message-types/)、[Flex layout與scaling](https://developers.line.biz/en/docs/messaging-api/flex-message-layout/)、[Flex Simulator](https://developers.line.biz/en/docs/messaging-api/using-flex-message-simulator/)。官方文件只用來核對平台能力，不取代Project產品規格。

## 9. 本輪覆核補充與可執行交接邊界

### 9.1 Canonical route：完成查核，仍待實作證據

| 用途 | 現有檔案值 | 本輪結論 |
|---|---|---|
| Ready Hero／CTA | `/canvas/ITINERARY_ID` | 04 保留原檔；runtime URL builder須對齊正式路由 |
| Completed | `{{ITINERARY_URL}}` | 不自行選定 `/canvas` 或 `/trips` |
| 06預定完整行程 | `/trips/{ITINERARY_ID}` | 工單明寫「預定」，不能當作已實作證據 |
| Draft | `/trips/{{ITINERARY_ID}}/edit` | 文案契約沿用，深連結待測 |
| Progress | `{{PROGRESS_URL}}` | 無正式path證據；缺值沿用隱藏CTA |
| 登入／通用Help | `/dashboard` | Help已定稿；登入入口仍需完成實際登入後跳轉測試 |

沒有前端 router／部署設定可裁定 B01。本輪不新增路由，也不以 REST API `/rest/v1/itineraries` 作 UI route。需提供同一行程從 Ready、My Itinerary、Dashboard 開啟的最終 URL／route manifest 後結案。

### 9.2 Placeholder convention：文件統一，原JSON保留

交接一律使用 `{{FIELD_NAME}}`；此為模板符號，**不是 n8n 可直接執行的 expression**。04 裸字串 `LIFF_ID`、`ITINERARY_ID` 透過工程 adapter 對應同名欄位；不重寫已定稿 JSON。使用 JSON object 賦值並 serialize，避免引號、換行或使用者文字破壞結構。

04 Ready 另外有「未以 placeholder 標示的示例內容」，不能靠 `{{...}}` 正則置換完成：

| JSON位置 | runtime資料 |
|---|---|
| `contents.hero.url` | HERO_IMAGE_URL，替換 example.com 示意圖 |
| `contents.hero.action.uri` | ITINERARY_URL |
| `contents.body.contents[0].text` | TRIP_TITLE，替換東京示例標題 |
| `contents.body.contents[1].contents[0].text` | 目的地顯示字串，替換「📍 東京」 |
| `contents.body.contents[1].contents[1].text` | 天數顯示字串，替換「🗓 5 天 4 夜」 |
| `contents.body.contents[3].contents[0].contents[0].text` | 第一個顯示標籤，替換 #在地老饕 |
| `contents.body.contents[3].contents[1].contents[0].text` | 第二個顯示標籤，替換 #大眾捷運 |
| `contents.footer.contents[0].action.uri` | 同一 ITINERARY_URL |

04 Error 的 `contents.footer.contents[0].action.data` 帶入指定 itinerary ID；`contents.footer.contents[1].action.uri` 帶入正式Dashboard URL。06欄位依各模板既有位置處理；Help取 `[topic].message`。04的可選資料缺漏政策不可因共用外觀就假定等於06；需工程測試並記錄，原檔保持不變。

### 9.3 Runtime replacement檢查結果與送出關卡

**目前判定：模板輸入與置換位置已確認；正式 renderer／送出結果未提供，不能判定 runtime PASS。**

工程須在送出前留存可重現案例：

1. 綁定正確帳號、指定行程及其job；query用active ID，push用事件ID。
2. 先套用既有缺值規則，再生成字串／URI。My Itinerary的Days-only需左對齊；零tag同步刪除separator；Dashboard fallback同時更新可見CTA文字及action label為「開啟 Atrip」。
3. Generating依既有QA cases：缺標題→「你的 Atrip 旅程」；缺／未知階段→「正在準備行程」；缺PROGRESS_URL→移除整個CTA。completed／failed應由state router切換範本，不列為未知進度繼續等待。
4. 序列化後，檢查所有文字／URI／postback／image URL：不得殘留 `{{FIELD}}`、裸 LIFF_ID／ITINERARY_ID、example.com示例圖、空URI。Ready示例內容須用另一個目的地fixture驗證確實已替换，不能只測東京。
5. 驗證 message envelope與LINE schema；再測實際點擊、圖片載入與回覆。用引號、換行、長中文標題及非ASCII標籤作輸入，確認serialize後仍可解析。
6. 留存 input、rendered message、檢查結果、平台／裝置及時間；不把QA cases中的expected欄位當作execution log。

本輪未呼叫真實LINE發送或使用任何Channel Token；也未新增Webhook／n8n實作，符合06工單範圍。

### 9.4 跨TRACK視覺與文件對照

| 項目 | 核對結果 | Acceptance |
|---|---|---|
| Header | 02白底字標／wizard返回；03白底品牌圖形＋行程標題，職責不同，不能要求完全同一排版；字體、色彩由Final規範控制 | 方向一致；共用元件實作待測 |
| Card | 02 radius20、一般卡無shadow；03文件radius18且預覽帶shadow，與Final有明確差異 | Should Fix S01；原artwork不改 |
| Typography | 02與tokens字階一致；03 card17/800與Final h2 16/24/600不同；LINE採平台字階及核准2行摘要政策 | Web差異記錄；LINE不機械套Web字級 |
| Icon | 02以線性圖示為主，03有飛機品牌圖形／三點把手；LINE metadata使用emoji，而QA圖是向量模擬 | 類型差異不等於需重畫；icon family與真機emoji仍待驗證 |
| Navigation | 02 Dashboard有底部導覽、Wizard固定CTA；03 Day Tabs橫滑有規格依據；LINE Rich Menu採v2 postback | 有意的頁面差异；safe-area、返回與焦點待實機 |
| 長文字 | 06圖有320等效長標題，JSON有maxLines；02／03 SVG為固定示例 | 不能以縮放靜態圖宣告Web RWD PASS |
| Component states | Final要求Default/Hover/Pressed/Focus/Disabled/Loading；03另有拖曳／Checkbox狀態 | 文案／規則已定；互動、keyboard、Selected+Focus、200%待測 |
| PDF | 原檔1頁A4，三張活動卡和錨點可讀，無可見半張卡；頁尾為Day 2，沒有第n頁 | 單頁視覺部分通過；頁碼缺漏、15mm衝突及多頁壓力未結案 |

原PDF只示範Day 2；不能推論完整5日都已匯出。PDF版移除拖曳／操作控制符合print目的。依既有Final仍須用長地址、長備註、Day Header、Transit＋下一卡及時間錨點逼近頁尾的資料實際驗收。

### 9.5 Tokens證據與版本校正

本輪使用 `04_Atrip_Design_Tokens_v1(2).zip` 內的：

- `atrip.tokens.json`：meta.version `1.0.0`；基底16px，primary `#B9E85A`、h2 `1rem / 1.5rem / 600`、radius.xl `20px`，與Final v1.1對應值一致。
- `atrip.component-states.json`：已提供狀態資料，不能再列「缺token交付」；實際元件接線仍待驗收。
- `tailwind.config.js`：本地Node require成功，輸出同一primary／h2／radius；未執行真實前端build，不宣稱已套用CSS。

同時校正前版統計：本輪04／06共有18份JSON，非17份；18項parse＋14項結構檢查＝32/32本地通過。此數字不包含官方平台驗證、runtime fixture、真機或PDF多頁測試。

### 9.6 Acceptance status（簽核摘要）

| 範圍 | 狀態 | 尚需證據／負責方 |
|---|---|---|
| 原artwork／JSON保持不變 | 完成 | 本輪只更新handoff文件 |
| Engineering Handoff、placeholder統一約定 | 完成 | 本文件；不代表工程已套用 |
| 04／06 JSON語法及指定結構 | PASS：32/32 | 限上述本地檢查 |
| canonical route | OPEN：B01 | Track 1＋TRACK3-01路由實作與點擊記錄 |
| runtime replacement／state routing | NOT RUN | TRACK3-01 renderer及fixtures |
| Simulator／iOS／Android | NOT RUN | QA平台截圖與結果 |
| 320／375／390／430與200% | NOT RUN | Track 1實際頁面 |
| PDF原單頁可讀性 | PARTIAL PASS | 已檢視，但缺頁碼且與Final邊界規格有差異 |
| PDF多頁分頁與LINE取得方式 | OPEN | PDF工程師＋TRACK3-01 |
| 流程圖交付 | 尚未取得 | 06要求的PNG或Figma連結；不能標素材全數完成 |
| 整體Final QA | **Pending（待整合驗收結案）** | 關閉Blocking並補必要acceptance證據 |
