-- ==============================================================================
-- Atrip Seed Data
-- Ticket: TRACK2-02 (動態提示詞範本庫種子資料與管理機制)
-- 用途：
--   獨立、可重複執行的種子資料腳本。可在 Supabase Studio SQL Editor 隨時貼上
--   重新執行以「熱更新」內容（修改 prompt_directive 文案、調整 priority 等），
--   不會產生重複資料，也不需要停機或重跑整個 migration。
--
-- 執行方式：
--   本地開發：supabase db reset（會自動套用 migrations 後執行本檔案，
--             若專案有設定 supabase/config.toml 的 seed 路徑）
--   正式環境：直接於 Supabase SQL Editor 貼上執行，或透過 CI/CD pipeline 執行。
--
-- 前置依賴：
--   TRACK2-01（prompt_templates 表與 RLS 已建立）
--   本檔案對應之 migration（20260916021900_prompt_templates_default_guard_and_rpc.sql）
--   已套用單選分類 is_default 唯一性保護。
-- ==============================================================================

INSERT INTO public.prompt_templates
    (category, option_key, display_label, prompt_directive, is_default, priority)
VALUES
    -- ── 住宿策略（單選，恰好 1 組 is_default）────────────────────────────
    (
        'accommodation', 'single_hotel', '依推薦連住同一間',
        '【住宿約束】整趟行程必須以第 1 晚之推薦飯店作為每日出發與返回之固定 Basecamp，每日景點動線以該飯店為圓心規劃，行程中途嚴禁安排 Check-in/out 或更換住宿。',
        true, 10
    ),
    (
        'accommodation', 'switch_hotel', '隨景點分區換宿',
        '【住宿與行李約束】行程允許隨景點區域更換住宿。更換飯店當日，必須在上午 09:00 前安排「行李寄存於原飯店或轉運車站」，並於 15:00-16:00 強制插入「前往新飯店 Check-in 放置行李」行程節點，前後景點必須順向排列，嚴禁折返跑。',
        false, 10
    ),

    -- ── 交通方式（單選，恰好 1 組 is_default）────────────────────────────
    (
        'transit', 'public_transit', '大眾運輸優先',
        '【交通指引規範】所有景點間交通必須優先搭乘地鐵、捷運、公車或鐵路。在 transit_to_next 中必須精確輸出建議路線代碼（如「東京地鐵銀座線」）、搭乘方向、建議進出口名稱，以及預估步行與乘車時間。',
        true, 20
    ),
    (
        'transit', 'self_drive', '租車自駕/包車',
        '【自駕指引規範】景點間交通以自駕車程為主。請估算行車距離、車程時間、推薦主要幹道或高速交流道，並於 tips 提示各景點周邊停車方便度與收費概況。',
        false, 20
    ),

    -- ── 主題興趣（多選，允許多組 is_default 同時生效，見 GUARD 說明）────
    (
        'interest', 'gourmet', '喜愛在地美食',
        '【美食強化】每日午餐與晚餐必須安排當地高評價、具代表性的特色餐飲，避免觀光客陷阱餐廳，每餐停留時間需預留 60-90 分鐘。',
        true, 30
    ),
    (
        'interest', 'shopping', '喜愛逛街購物',
        '【購物排程】每日下午或傍晚精選 1-2 個核心商圈、特色老街或購物中心（如銀座、澀谷、心齋橋），預留 2-3 小時充裕逛街時間。',
        false, 30
    ),
    (
        'interest', 'sports', '熱血運動賽事',
        '【運動賽事與球場巡禮】推薦造訪當地知名體育場館（如巨蛋、足球場、歷史博物館）與官方旗艦商品店。若用戶提供特定比賽日期/時間，必須將該賽事設為不可撼動之主要時間錨點 (Anchor Event)，當天其他活動皆圍繞該球場安排。',
        false, 30
    ),
    (
        'interest', 'cultural', '文青古蹟人文',
        '【文化參訪】優先推薦歷史悠久之神社、寺廟、美術館、博物館或歷史古道，景點描述需包含深度的文化背景導覽。',
        true, 30
    )
ON CONFLICT (option_key) DO UPDATE SET
    category         = EXCLUDED.category,
    display_label    = EXCLUDED.display_label,
    prompt_directive = EXCLUDED.prompt_directive,
    is_default       = EXCLUDED.is_default,
    priority         = EXCLUDED.priority,
    updated_at       = TIMEZONE('utc'::text, NOW());
