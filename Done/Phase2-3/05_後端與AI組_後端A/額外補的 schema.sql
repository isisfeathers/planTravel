-- ==============================================================================
-- Atrip Database Migration
-- Ticket: TRACK2-02 (prompt_templates 種子資料與管理機制)
-- 目的：
--   1. [GUARD] 對「單選」分類(accommodation, transit)強制「恰好一組 is_default」，
--      落實工單紅線「每個 category 必須有且僅有一組 is_default = true」。
--      不套用在「多選」分類(interest)，因該分類允許多組預設值同時生效
--      （已與工單負責人確認，對照 PreferenceSnapshot.interests 為陣列型別）。
--   2. [RPC] 提供 get_prompt_directives() 函式，供 n8n 呼叫，取代
--      05-n8n工作流.md 節點 3 原本直接把使用者輸入字串拼接進 SQL 的寫法
--      （屬於 SQL Injection 風險），改用參數化呼叫。
-- ==============================================================================

-- 1. [GUARD] 單選分類 is_default 唯一性保護
-- 若未來新增其他單選分類（例如 enum 已預留但尚未使用的 pace, budget），
-- 只需把該分類名稱加進下方 category IN (...) 清單即可套用同樣保護。
CREATE UNIQUE INDEX IF NOT EXISTS uq_prompt_templates_single_default
    ON public.prompt_templates (category)
    WHERE is_default = true AND category IN ('accommodation', 'transit');

-- 2. [RPC] 動態提示詞查詢函式
-- 完整複刻 05-n8n工作流.md 節點 3 的查詢邏輯：
--   命中使用者選擇的 option_key（多選興趣 + 單選住宿策略 + 單選交通方式）；
--   對「使用者完全沒有命中任何選項」的分類，自動回退該分類的 is_default 選項。
CREATE OR REPLACE FUNCTION public.get_prompt_directives(
    p_interests TEXT[],
    p_accommodation_strategy TEXT,
    p_transit_mode TEXT
)
RETURNS TABLE (
    option_key TEXT,
    prompt_directive TEXT,
    category public.prompt_category,
    priority INT
)
LANGUAGE sql
STABLE
AS $$
    SELECT pt.option_key, pt.prompt_directive, pt.category, pt.priority
    FROM public.prompt_templates pt
    WHERE
        pt.option_key = ANY(p_interests)
        OR pt.option_key = p_accommodation_strategy
        OR pt.option_key = p_transit_mode
        OR (
            pt.is_default = true
            AND pt.category NOT IN (
                SELECT pt2.category
                FROM public.prompt_templates pt2
                WHERE
                    pt2.option_key = ANY(p_interests)
                    OR pt2.option_key = p_accommodation_strategy
                    OR pt2.option_key = p_transit_mode
            )
        )
    ORDER BY pt.priority ASC;
$$;

COMMENT ON FUNCTION public.get_prompt_directives IS
    'TRACK2-02: 供 n8n 動態組裝 Master System Prompt 呼叫，取代直接字串拼接 SQL。'
    '傳入使用者偏好快照，回傳應套用之 prompt_directive 清單（含命中選項與各分類回退預設）。';

-- prompt_templates 本身已對 anon/authenticated 開放 SELECT（見 TRACK2-01 RLS 政策），
-- 此函式以 invoker 權限執行，故一併開放 EXECUTE 權限供前端／n8n 直接呼叫。
GRANT EXECUTE ON FUNCTION public.get_prompt_directives(TEXT[], TEXT, TEXT) TO anon, authenticated;
