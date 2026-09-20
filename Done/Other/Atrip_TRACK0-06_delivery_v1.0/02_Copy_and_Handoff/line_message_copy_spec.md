# TRACK0-06 LINE Message Copy Spec

## 1. Scope

This file defines short LINE chat copy and rendering rules for states that do not need a large Flex Message:
- account not linked / not logged in
- draft itinerary
- unknown user input / unknown action

It also records the copy and route decisions used by the Welcome Message and Help flows.

---

## 2. Welcome Message

**Trigger:** LINE `follow` event

**Copy**

> 歡迎使用 Atrip 👋  
> 選擇目的地、旅行天數與喜好，就能快速產生你的專屬自由行行程。你也可以從下方選單隨時查看目前行程。

**Quick Replies**
1. `開始規劃` → URI `https://liff.line.me/{{LIFF_ID}}/wizard`
2. `查看使用說明` → Postback `action=help_menu`

---

## 3. Help Menu

**Trigger:** `action=help_menu`

**Copy**

> 嗨！想了解哪一項功能呢？請選擇下方項目 👇

| Label | Postback data |
|---|---|
| 開始規劃 | `action=help&topic=create` |
| 調整行程 | `action=help&topic=edit` |
| 分享行程 | `action=help&topic=share` |
| 生成失敗 | `action=help&topic=retry` |

---

## 4. Help Topic Messages

### 4.1 開始規劃
**Trigger:** `action=help&topic=create`

> 點擊下方「開始規劃」，選擇目的地、旅行天數與偏好，就能讓 Atrip 為你產生專屬行程。

CTA: `開始規劃` → `/wizard`

### 4.2 調整行程
**Trigger:** `action=help&topic=edit`

> 開啟行程後，可以長按景點卡片右側把手調整順序，系統會儲存更新後的安排。

CTA: `開啟我的行程` → `/dashboard`

### 4.3 分享行程
**Trigger:** `action=help&topic=share`

> 在行程主畫布點擊「分享」，即可建立去識別化分享頁；分享內容不會顯示個人資料、偏好快照與預算。

CTA: `查看我的行程` → `/dashboard`

### 4.4 生成失敗
**Trigger:** `action=help&topic=retry`

> 若行程生成失敗，可以保留原本設定重新嘗試，或修改條件後再次送出。

CTA: `查看我的行程` → `/dashboard`

**Route decision:** Generic Help does not assume a current `ITINERARY_ID`; therefore edit/share/retry topics go to `/dashboard` instead of a trip-specific route. If TRACK3-01 later guarantees a current itinerary ID for these contexts, the engineer may replace the CTA target with the confirmed trip-specific LIFF route without changing the copy hierarchy.

---

## 5. Account Not Linked / Not Logged In

**Condition:** LINE user cannot be resolved to an authenticated Atrip account.

**Copy**

> 尚未完成 Atrip 登入，請重新開啟 Atrip 完成登入。

**Quick Reply**
- `開啟 Atrip` → URI `https://liff.line.me/{{LIFF_ID}}/dashboard`

**Rendering:** text message + one Quick Reply. Do not use a large Flex Message.

**Fallback:** If the final login-entry route differs from `/dashboard`, TRACK3-01 should replace the URI. Keep the CTA label `開啟 Atrip`.

---

## 6. Draft Itinerary

**Condition:** A current itinerary exists but is still a draft / setup is incomplete.

**Copy**

> 這趟行程尚未完成設定，可以繼續填寫旅行條件。

**Quick Reply**
- `繼續設定` → URI `https://liff.line.me/{{LIFF_ID}}/trips/{{ITINERARY_ID}}/edit`

**Dynamic field**
- `{{ITINERARY_ID}}`

**Rendering:** text message + one Quick Reply. Do not use a large Flex Message.

**Fallback:** If `ITINERARY_ID` is missing, route the CTA to `/dashboard` rather than emitting a broken trip URL.

---

## 7. Unknown Input / Unknown Action

**Condition:** No supported command, action, or postback matches the incoming input.

**Copy**

> 我目前還無法理解這段訊息。你可以使用下方選單開始規劃、查看行程或開啟使用說明。

**Rendering:** plain text only. Do not add a large Flex Message.

**Product boundary**
- Do not say「AI 正在思考」.
- Do not imply that the LINE bot supports free-form travel Q&A.
- Do not imply live weather, flight-change monitoring, or human customer service.
- The Rich Menu remains the primary recovery path.

---

## 8. Dynamic Fields

| Placeholder | Used in |
|---|---|
| `{{LIFF_ID}}` | Welcome, Help CTAs, Login, Draft |
| `{{ITINERARY_ID}}` | Draft edit route only |

---

## 9. CTA Vocabulary

Use stable action language across the LINE experience:

| User intent | CTA |
|---|---|
| Create a trip | `開始規劃` |
| Open account/app | `開啟 Atrip` |
| Open current trips | `開啟我的行程` / `查看我的行程` |
| Continue draft | `繼續設定` |
| Open full completed trip | `開啟完整行程` |
| View generation progress | `查看處理進度` |

Avoid vague labels such as `確定`, `下一步`, `查看`, or raw engineering action strings.
