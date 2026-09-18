# Atrip 按鈕與標籤元件狀態規範 v1.0

工單：TRACK0-01｜品牌設計系統與 Design Tokens

適用範圍：Primary／Secondary Button、偏好 Chip／Pill、純圖示按鈕與非互動資訊標籤。

依據：`01_Atrip_Color_Brand_Spec_v1.md`（文件內 v1.1）、`02_Atrip_Typography_Layout_Spec_v1.1.md`。本文件使用既有色值，不新增品牌色。

## 1. 元件類型與尺寸

| 元件 | 用途 | 文字 | 最小尺寸／圓角 |
|---|---|---|---|
| Button / Primary | 開始規劃、下一步、儲存 | type.button：16px／24px／600 | 高 52px；radius.full |
| Button / Secondary | 返回、取消等次要操作 | type.button：16px／24px／600 | 高 52px；radius.full |
| PreferenceChip | 可複選的旅行偏好 | type.chip：14px／20px／500 | 高 44px；radius.full |
| IconButton | 收藏、關閉等純圖示操作 | 可讀名稱，不強制顯示文字 | 44 × 44px 點擊範圍；radius.full |
| InfoTag | 日期、分類等唯讀資訊 | type.caption：12px／18px／400 | 依內容增高；radius.sm |

- Button 左右內距 20px、上下 12px，圖示 20px、圖文間距 8px；預留 1px 透明邊框，狀態變化只改邊框顏色。
- PreferenceChip 左右內距 12px、上下 10px，分類圖示 18px、圖文間距 8px；所有狀態預留 2px 邊框。另保留 16px 勾選位置與 8px 間距，未選時該位置留空但不移除。
- 尺寸含內距與邊框，採 border-box。文字換行時允許增高，不設定固定高度裁切文字。
- InfoTag 左右內距 8px、上下 4px，無按鈕點擊熱區要求。

## 2. 共用狀態規則

| 狀態 | 定義 | 適用情境 |
|---|---|---|
| Default | 可操作、未被滑鼠移入或按住 | 所有互動元件 |
| Hover | 滑鼠移入 | 僅支援 hover 的精細指標裝置 |
| Pressed | 滑鼠或手指正在按住，尚未完成操作 | 可操作的按鈕與 Chip |
| Selected | 持續的選取狀態，直到使用者取消 | PreferenceChip、切換型 IconButton |
| Focus | 鍵盤焦點提示，可與其他狀態共存 | 可取得焦點的互動元件 |
| Disabled | 暫時不能操作 | 不執行點擊、鍵盤或提交動作 |
| Loading | 已開始非同步處理，阻止重複送出 | Button；本地偏好切換不使用 |

Pressed 是短暫按下效果，Selected 是持續選取，兩者不可混用。一般 Button 不設 Selected。

狀態優先序：Disabled > Loading > Pressed > Hover > Default；Selected 作為 Chip／切換型 IconButton 的獨立屬性保留。Focus 為額外外框，不取代既有底色或選取標記。

## 3. Button 狀態矩陣

### 3.1 Primary Button

所有文字與圖示採 action.on-primary（#182B36），Disabled 除外。

| 狀態 | 背景 | 邊框 | 陰影／內容 |
|---|---|---|---|
| Default | action.primary #B9E85A | 1px 透明 | shadow.none；操作文字＋可選圖示 |
| Hover | action.primary-hover #ACDD4D | 1px 透明 | shadow.none |
| Pressed | action.primary-hover #ACDD4D | 1px selection.foreground #416519 | shadow.none；不改尺寸、不縮放 |
| Focus | 保留目前狀態 | 保留目前狀態 | 加共用焦點外框 |
| Disabled | surface.subtle #F3F5EF | 1px border.subtle #E4E8E0 | 文字／圖示 text.secondary #52616B；shadow.none |
| Loading | action.primary #B9E85A | 1px 透明 | 進度圖示＋對應動詞，例如「儲存中…」 |

### 3.2 Secondary Button

| 狀態 | 背景 | 文字／圖示 | 邊框／陰影 |
|---|---|---|---|
| Default | surface.card #FFFFFF | text.primary #182B36 | 1px text.secondary #52616B；shadow.none |
| Hover | selection.background #EFF8DA | text.primary #182B36 | 1px selection.foreground #416519；shadow.none |
| Pressed | selection.background #EFF8DA | text.primary #182B36 | 1px selection.foreground #416519；內側再加 1px 同色線，不改尺寸 |
| Focus | 保留目前狀態 | 保留目前狀態 | 加共用焦點外框 |
| Disabled | surface.subtle #F3F5EF | text.secondary #52616B | 1px border.subtle #E4E8E0；shadow.none |
| Loading | surface.card #FFFFFF | text.primary #182B36 | Default 邊框；進度圖示＋操作中文字 |

Pressed 的內側線是狀態描邊，可用 inset box-shadow 實作，不新增浮起陰影 token。

### 3.3 Disabled 與 Loading 行為

- Disabled 的原因以鄰近文字說明，例如「請先選擇出發日期」，並透過 aria-describedby 關聯；不只依賴滑鼠提示。
- 原生 button 的 Disabled 使用 disabled 屬性。不得用透明度降低整個元件的可讀性。
- Loading 保留按鈕位置與寬度；圖示固定 20px，文字換行可增高。填滿容器的按鈕保持填滿；依內容寬度的按鈕預留可容納 Default／Loading 兩種文案的寬度。
- Loading 使用 aria-busy="true" 與 aria-disabled="true"，保留原有鍵盤焦點；事件處理必須阻止滑鼠、Enter、Space 及表單重複送出，不能只改 ARIA 屬性。
- Loading 期間不顯示 Hover／Pressed 效果，且不接受再次送出。完成後恢復可操作狀態；失敗時恢復原操作並顯示錯誤說明與重試入口。
- 以鄰近 role="status" 或 aria-live="polite" 區域通知處理結果。按鈕中的旋轉圖示為裝飾，不重複朗讀。

## 4. PreferenceChip 狀態矩陣

### 4.1 分類底色與文字

| Category | 背景 | 文字／分類圖示 |
|---|---|---|
| Coffee | #F0ECE3 | #6B604B |
| Nature | #EBF1E8 | #446345 |
| Food | #F2ECE5 | #72604F |
| Walk | #F0EFEB | #5D625B |
| Culture | #EAE8F0 | #56566C |
| Photo | #EAF1F3 | #3E6373 |

Category 是視覺屬性，不是 API 欄位定義。

### 4.2 狀態外觀

| 狀態組合 | 背景／文字 | 2px 邊框 | 勾選與陰影 |
|---|---|---|---|
| Unselected / Default | 分類底色／分類文字色 | 透明 | 不顯示勾；shadow.none |
| Unselected / Hover | 保留分類底色／文字色 | text.secondary #52616B | 不顯示勾；shadow.none |
| Unselected / Pressed | 保留分類底色／文字色 | selection.foreground #416519 | 不提前顯示勾；內側加 1px 同色線 |
| Selected / Default | 保留分類底色／文字色 | selection.foreground #416519 | 顯示同色勾；shadow.soft |
| Selected / Hover | 保留分類底色／文字色 | selection.foreground #416519 | 保留勾；shadow.soft；內側加 1px 同色線 |
| Selected / Pressed | 保留分類底色／文字色 | selection.foreground #416519 | 保留勾；取消浮起陰影，內側加 2px 同色線 |
| Focus（選中或未選中） | 保留目前狀態 | 保留目前狀態 | 外加共用焦點外框 |
| Disabled / Unselected | surface.subtle #F3F5EF／text.secondary #52616B | border.subtle #E4E8E0 | 無勾；shadow.none |
| Disabled / Selected | 保留分類底色／文字色 | selection.foreground #416519 | 保留勾；shadow.none；鄰近文字說明「已選取，暫不可變更」 |

Selected Disabled 不自動清除偏好值；是否允許提交該偏好由產品資料規則決定，不由視覺狀態改寫。

### 4.3 切換行為

- 使用 button type="button"，以 aria-pressed="true/false" 表達選取；可複選群組提供可讀名稱。
- 點擊或原生鍵盤操作完成後切換一次。不能同時在 pointerdown、keydown 與 click 重複切換。
- 再次操作已選 Chip 即取消選取；指標移入、移出或取得焦點不改變選取值。
- 勾選標記在原預留位置顯示／隱藏，不改變 Chip 寬度或其他標籤的位置。
- Disabled 使用 disabled，阻止操作；已選值與 aria-pressed 保留。
- 本地選取立即更新，不使用 Loading。資料送出時的等待狀態呈現在送出按鈕。
- 可在群組下方顯示「已選 2 項」，以 aria-live="polite" 更新。選取不強制觸發頁面跳轉。

## 5. IconButton 與 InfoTag

### 5.1 IconButton

| 狀態 | 背景 | 圖示／其他 |
|---|---|---|
| Default | surface.card #FFFFFF | text.secondary #52616B |
| Hover | selection.background #EFF8DA | selection.foreground #416519 |
| Pressed | selection.background #EFF8DA | selection.foreground #416519；內側 1px 同色線 |
| Selected（收藏等切換操作） | selection.background #EFF8DA | selection.foreground #416519；實心圖示 |
| Selected / Hover | 保留 Selected | 加內側 1px selection.foreground 線 |
| Selected / Pressed | 保留 Selected | 加內側 2px selection.foreground 線 |
| Focus | 保留目前狀態 | 加共用焦點外框 |
| Disabled | surface.subtle #F3F5EF | text.secondary #52616B；禁止操作 |
| Disabled / Selected | 同 Disabled | 保留實心圖示與 aria-pressed，鄰近說明不可變更原因 |

IconButton 圖示 20px。每個按鈕提供明確名稱；切換型按鈕使用穩定名稱（例如「收藏京都旅程」）與 aria-pressed；關閉等一般動作不設 aria-pressed。收藏切換使用亮綠系，不加入季節活動色。本規範不提供 IconButton Loading；非同步確認使用帶文字的 Button。

### 5.2 InfoTag

底色 #F0F2EC、文字 #52616B，radius.sm，shadow.none。InfoTag 使用非互動文字元素，不設 Hover、Pressed、Selected、Disabled 或 Loading，不進入鍵盤操作順序。

## 6. Focus、動態與顯示規則

- Focus 使用 focus.ring #277E99 的 3px 實線 outline，outline-offset 為 3px；與選取邊框保持分離。
- 焦點狀態使用 :focus-visible。父容器需留出至少 6px 外框空間，不可裁切焦點外框；標籤間距沿用 8px，取得焦點時外框不覆蓋相鄰元件內容。
- 觸控端不以 Hover 傳達必要資訊。Hover 僅在 hover:hover 且 pointer:fine 下啟用。
- 背景、邊框與陰影過渡 120ms ease-out；不移動、縮放元件。尊重 prefers-reduced-motion，關閉非必要過渡與旋轉，Loading 保留靜態進度圖示及文字。
- 不以動畫、顏色或陰影作為唯一提示；Selected 有勾選，Loading 有文字，Disabled 有原因，Focus 有外框。

## 7. Figma 元件屬性

| Component Set | 屬性與值 |
|---|---|
| Button | Hierarchy=Primary/Secondary；State=Default/Hover/Pressed/Disabled/Loading；FocusVisible=True/False；Icon=None/Leading/Trailing |
| PreferenceChip | Category=Coffee/Nature/Food/Walk/Culture/Photo；Selected=True/False；State=Default/Hover/Pressed/Disabled；FocusVisible=True/False |
| IconButton | Kind=Action/Toggle；Selected=True/False；State=Default/Hover/Pressed/Disabled；FocusVisible=True/False |
| InfoTag | Label 文字屬性；無互動 State |

- Button 的 Label、Chip 的 Label、IconButton 的可讀名稱分別標註；不要把顯示文案當作資料欄位名稱。
- Selected 與 FocusVisible 採獨立屬性，確保 Selected＋Focus 能同時呈現。
- Disabled 不提供 FocusVisible=True；Loading 可保留 FocusVisible=True。
- IconButton Kind=Action 固定 Selected=False；Selected 僅用於 Toggle。
- Loading 圖示取代一般 Button 圖示，不同時疊放兩個圖示。PreferenceChip 不建立 Loading 變體。
- 使用 Auto Layout，文字可換行、元件高度 Hug contents，搭配規定的最小高度。

## 8. 對比檢查

以下為實色組合的 sRGB 相對亮度計算，依工單一般文字至少 4.5:1 的要求判定。分類文字的完整結果依色彩規範；本表補充操作狀態涉及的組合。

| 前景 | 背景 | 比值 | 結果 |
|---|---|---:|---|
| #182B36 | #B9E85A | 10.26:1 | 通過 |
| #182B36 | #ACDD4D | 9.18:1 | 通過 |
| #182B36 | #FFFFFF | 14.61:1 | 通過 |
| #182B36 | #EFF8DA | 13.29:1 | 通過 |
| #52616B | #F3F5EF | 5.83:1 | 通過 |
| #416519 | #EFF8DA | 6.16:1 | 通過 |
| #416519 | 六種分類底色 | 5.58–5.93:1 | 全部通過 |

文字與分類圖示不降低透明度。焦點外框與照片等複雜背景相鄰時，必須另外檢查；本表不代表整體介面或元件庫已完成實機驗收。

## 9. 元件驗收條件

- 各適用狀態均可辨識，且符合矩陣數值；不可互動 InfoTag 不呈現按鈕效果。
- 375px 視口下，Button 至少 52px、Chip 至少 44px、IconButton 至少 44 × 44px；放大文字後不裁切。
- Chip 狀態切換不改尺寸；分類底色持續保留，Selected 使用深綠邊框及勾選。
- Hover／Focus 不更改 Selected；一次啟動只切換一次；Disabled 不觸發動作。
- 鍵盤 Tab 可依序操作可用元件，Enter／Space 可啟動；焦點外框完整可見。
- Loading 阻止重複送出、保留焦點、提供文字與結果通知；失敗後可恢復操作。
- 預設、選取與鍵盤焦點組合均需在 Figma 與實作中檢查；驗收需記錄所用視口與操作結果。
