# TRACK0-04｜LINE Rich Menu 與 Flex Message 交件說明

版本：v1.1 品牌規範同步版

## 色彩與品牌依據

本交件包以 `01_Atrip_Color_Brand_Spec_v1(色彩與品牌規範).md` 為唯一色彩真理來源：

- 品牌藍青與航線：`#277E99`
- 主要行動：`#B9E85A` 背景＋`#182B36` 文字
- 暖白頁面：`#FFFDFA`
- 卡片：`#FFFFFF`
- 次要區塊：`#F3F5EF`
- 主要／次要文字：`#182B36`／`#52616B`
- 在地美食標籤：`#F2ECE5` 背景＋`#72604F` 文字
- 一般資訊標籤：`#F0F2EC` 背景＋`#52616B` 文字

Flex Message 的主要 CTA 使用可點擊 `box`，避免 LINE 原生 primary button 強制套用白字，確保符合亮綠底深墨字規範。

## 交付檔案

1. `richmenu_atrip_2500x843.png`：LINE Rich Menu 正式 PNG，2500 × 843 px。
2. `richmenu_bounds.json`：三個完整覆蓋且不重疊的點擊熱區。
3. `flex_message_itinerary_ready.json`：行程完成通知 Bubble Flex Message。
4. `flex_message_error_retry.json`：行程生成異常與重試 Bubble Flex Message。
5. `flex_preview_itinerary_ready.png`：完成通知視覺預覽。
6. `flex_preview_error_retry.png`：異常重試視覺預覽。

## Rich Menu 熱區

| 功能 | x | y | width | height | 動作 |
| --- | ---: | ---: | ---: | ---: | --- |
| Atrip 智慧自由行 | 0 | 0 | 834 | 843 | LIFF `/wizard` |
| 我的行程 | 834 | 0 | 833 | 843 | LIFF `/dashboard` |
| 使用說明 | 1667 | 0 | 833 | 843 | LIFF `/help` |

三區寬度合計 2500 px，高度皆為 843 px；彼此相接且沒有空隙。

## 串接前必須替換

- `LIFF_ID`：LINE Developers Console 建立的 LIFF ID。
- `ITINERARY_ID`：推播時對應的行程識別碼。
- `https://example.com/assets/destination-cover.jpg`：公開 HTTPS 目的地封面圖。
- 完成通知內的目的地、標題、天數、標籤與說明文字。

## 動態欄位建議

後端不應直接以字串取代整份 JSON；建議先載入 JSON，再針對以下欄位賦值：

- `contents.hero.url`
- `contents.hero.action.uri`
- `contents.body.contents[0].text`
- `contents.body.contents[1].contents[0].text`
- `contents.body.contents[1].contents[1].text`
- `contents.footer.contents[0].action.uri`

## 驗證紀錄

- Rich Menu PNG：2500 × 843 px，檔案小於 1 MB。
- Rich Menu 熱區：座標涵蓋完整畫布，無重疊、無漏空。
- JSON：已通過本地 JSON 語法與必要欄位檢查。
- URI：皆採 `https://` LIFF 格式占位網址。
- Flex 預覽：完成通知與錯誤重試皆完成視覺檢查，主要文字已設定換行或限制行數。

## 上線前最後檢查

1. 替換所有占位值。
2. 將兩份 Flex Message 放入 LINE Flex Message Simulator，分別檢查 iOS 與 Android 預覽。
3. 使用 Messaging API 的訊息驗證端點檢查實際 push request body；此步驟需要專案的 Channel Access Token。
4. 在測試帳號點擊三個 Rich Menu 區域與兩張 Flex Message 按鈕，確認 LIFF 路由正確。
