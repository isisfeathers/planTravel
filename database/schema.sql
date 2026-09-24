-- ==============================================================================
-- Atrip Production Database Schema
-- Version: 2.0.0
-- Ticket: TRACK2-01 (Supabase DDL & RLS Setup)
-- Source of Truth: Final SPEC/02-資料庫設計與SQL-DDL.md
-- 修補紀錄：
--   [FIX-001] 新增 itinerary_jobs 之 INSERT RLS 政策。
--             原規格書僅定義 SELECT 政策，但 05-n8n工作流.md 之時序圖顯示
--             前端須以使用者 JWT 直接 INSERT itineraries 與 itinerary_jobs
--             （標籤精靈送出時）。若無此政策，前端寫入會被 RLS 拒絕。
--             已與工單負責人（後端工程師 A）確認採用方案 A：
--             比照其他表之擁有者隔離風格，新增 owner-only INSERT 政策。
-- ==============================================================================

-- 1. 啟用必要的 PostgreSQL 延伸套件
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. 定義列舉型別 (Enum Types)
CREATE TYPE public.itinerary_job_status AS ENUM (
    'queued',
    'searching_flight',
    'generating_itinerary',
    'validating',
    'completed',
    'failed'
);

CREATE TYPE public.prompt_category AS ENUM (
    'accommodation',
    'transit',
    'interest',
    'pace',
    'budget'
);

-- ==============================================================================
-- 3. 資料表建立 (Tables)
-- ==============================================================================

-- 3.1 行程主表宣告 (因外鍵循環參照，先宣告 itineraries 再建 profiles)
CREATE TABLE public.itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- 稍後加上外鍵約束
    forked_from_id UUID REFERENCES public.itineraries(id) ON DELETE SET NULL,
    share_token UUID UNIQUE DEFAULT uuid_generate_v4() NOT NULL,
    title TEXT NOT NULL DEFAULT '我的自訂行程',
    destination TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
    is_archived BOOLEAN NOT NULL DEFAULT false,
    version INT NOT NULL DEFAULT 1,
    -- [FIX-003] 原規格書為 DEFAULT true：會導致新建行程預設即公開，
    -- 任何登入用戶或匿名者無需 share_token 即可讀取，破壞擁有者隔離（已實測重現）。
    -- 改為 DEFAULT false，對應 PRD 中「使用者主動點擊分享才公開」之流程。
    is_public BOOLEAN NOT NULL DEFAULT false,
    preference_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    itinerary_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    flight_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    error_message TEXT,
    deleted_at TIMESTAMPTZ DEFAULT NULL, -- 軟刪除標記
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3.2 使用者資料表 (擴充 Supabase Auth Users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    line_user_id TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    active_itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 補齊 itineraries.user_id 外鍵約束
ALTER TABLE public.itineraries
    ADD CONSTRAINT fk_itineraries_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3.3 使用者全域偏好表 (預設標籤按鈕快照)
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_pref UNIQUE (user_id)
);

-- 3.4 動態提示詞範本表 (Prompt Directives Template Table)
CREATE TABLE public.prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category public.prompt_category NOT NULL,
    option_key TEXT UNIQUE NOT NULL,
    display_label TEXT NOT NULL,
    prompt_directive TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    priority INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3.5 非同步生成任務追蹤表 (Itinerary Jobs)
CREATE TABLE public.itinerary_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.itinerary_job_status NOT NULL DEFAULT 'queued',
    attempt INT NOT NULL DEFAULT 0,
    idempotency_key TEXT UNIQUE NOT NULL,
    error_code TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3.6 外連分享記錄與稽核表 (Itinerary Shares)
CREATE TABLE public.itinerary_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    share_token_hash TEXT UNIQUE NOT NULL,
    views_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 4. 預設提示詞種子資料 (Prompt Template Seed Data)
-- 註：此為 DDL 規格書內嵌之基礎種子，與 TRACK2-02 之
--     supabase/seed/prompt_templates_seed.sql 內容一致，供本遷移獨立可執行。
-- ==============================================================================

INSERT INTO public.prompt_templates (category, option_key, display_label, prompt_directive, is_default, priority) VALUES
-- 住宿策略
('accommodation', 'single_hotel', '依推薦連住同一間', '【住宿約束】整趟行程必須以第 1 晚之推薦飯店作為每日出發與返回之固定 Basecamp，每日景點動線以該飯店為圓心規劃，行程中途嚴禁安排 Check-in/out 或更換住宿。', true, 10),
('accommodation', 'switch_hotel', '隨景點分區換宿', '【住宿與行李約束】行程允許隨景點區域更換住宿。更換飯店當日，必須在上午 09:00 前安排「行李寄存於原飯店或轉運車站」，並於 15:00-16:00 強制插入「前往新飯店 Check-in 放置行李」行程節點，前後景點必須順向排列，嚴禁折返跑。', false, 10),

-- 交通方式
('transit', 'public_transit', '大眾運輸優先', '【交通指引規範】所有景點間交通必須優先搭乘地鐵、捷運、公車或鐵路。在 transit_to_next 中必須精確輸出建議路線代碼（如「東京地鐵銀座線」）、搭乘方向、建議進出口名稱，以及預估步行與乘車時間。', true, 20),
('transit', 'self_drive', '租車自駕/包車', '【自駕指引規範】景點間交通以自駕車程為主。請估算行車距離、車程時間、推薦主要幹道或高速交流道，並於 tips 提示各景點周邊停車方便度與收費概況。', false, 20),

-- 主題偏好
('interest', 'gourmet', '喜愛在地美食', '【美食強化】每日午餐與晚餐必須安排當地高評價、具代表性的特色餐飲，避免觀光客陷阱餐廳，每餐停留時間需預留 60-90 分鐘。', true, 30),
('interest', 'shopping', '喜愛逛街購物', '【購物排程】每日下午或傍晚精選 1-2 個核心商圈、特色老街或購物中心（如銀座、澀谷、心齋橋），預留 2-3 小時充裕逛街時間。', false, 30),
('interest', 'sports', '熱血運動賽事', '【運動賽事與球場巡禮】推薦造訪當地知名體育場館（如巨蛋、足球場、歷史博物館）與官方旗艦商品店。若用戶提供特定比賽日期/時間，必須將該賽事設為不可撼動之主要時間錨點 (Anchor Event)，當天其他活動皆圍繞該球場安排。', false, 30),
('interest', 'cultural', '文青古蹟人文', '【文化參訪】優先推薦歷史悠久之神社、寺廟、美術館、博物館或歷史古道，景點描述需包含深度的文化背景導覽。', true, 30);

-- ==============================================================================
-- 5. 高效索引配置 (Indexes)
-- ==============================================================================

-- 軟刪除與活躍行程列表索引
CREATE INDEX idx_itineraries_user_active ON public.itineraries(user_id)
    WHERE deleted_at IS NULL AND is_archived = false;
CREATE INDEX idx_itineraries_share_token ON public.itineraries(share_token);
CREATE INDEX idx_itineraries_status ON public.itineraries(status);
CREATE INDEX idx_itineraries_forked ON public.itineraries(forked_from_id);

-- JSONB GIN 倒排索引
CREATE INDEX idx_itineraries_data_gin ON public.itineraries USING GIN (itinerary_data);
CREATE INDEX idx_itineraries_flight_gin ON public.itineraries USING GIN (flight_data);

-- 提示詞字典索引
CREATE INDEX idx_prompt_templates_key ON public.prompt_templates(option_key);
CREATE INDEX idx_prompt_templates_default ON public.prompt_templates(category) WHERE is_default = true;

-- 任務隊列索引
CREATE INDEX idx_itinerary_jobs_lookup ON public.itinerary_jobs(itinerary_id, status);
CREATE INDEX idx_itinerary_jobs_user ON public.itinerary_jobs(user_id, created_at DESC);

-- 分享過期檢索索引
-- [FIX-002] 原規格書寫法 `WHERE revoked_at IS NULL AND expires_at > NOW()` 會因
-- NOW() 非 IMMUTABLE 函式而導致 Partial Index 建立失敗（實測於 PostgreSQL 16 重現）。
-- 修正為僅以靜態條件 revoked_at IS NULL 作為 predicate，並將 expires_at 併入索引
-- 欄位，查詢時的 `expires_at > NOW()` 條件仍可透過此索引做高效 range scan。
CREATE INDEX idx_itinerary_shares_hash ON public.itinerary_shares(share_token_hash);
CREATE INDEX idx_itinerary_shares_active ON public.itinerary_shares(itinerary_id, expires_at)
    WHERE revoked_at IS NULL;

-- ==============================================================================
-- 6. 自動更新 updated_at 觸發器 (Triggers)
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_pref_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON public.itineraries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 自動將 Supabase Auth 新註冊用戶同步至 public.profiles 表
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, line_user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'line_user_id', NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'LINE 旅行家'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    line_user_id = EXCLUDED.line_user_id,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON public.prompt_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_itinerary_jobs_updated_at BEFORE UPDATE ON public.itinerary_jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 7. 安全性控制：Row Level Security (RLS) 政策
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_shares ENABLE ROW LEVEL SECURITY;

-- 7.1 Profiles
CREATE POLICY "用戶可查看個人 Profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "用戶可新增個人 Profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "用戶可更新個人 Profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 7.2 Preferences
CREATE POLICY "用戶可管理自身偏好"
    ON public.user_preferences FOR ALL
    USING (auth.uid() = user_id);

-- 7.3 Prompt Templates (公開唯讀供前端/n8n 查詢)
CREATE POLICY "所有人皆可查詢提示詞範本"
    ON public.prompt_templates FOR SELECT
    TO anon, authenticated
    USING (true);

-- 7.4 Itineraries
CREATE POLICY "擁有者可檢視未軟刪除之個人行程"
    ON public.itineraries FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "擁有者可新增個人行程"
    ON public.itineraries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "擁有者可更新個人行程"
    ON public.itineraries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "擁有者可軟刪除或刪除個人行程"
    ON public.itineraries FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "外連訪客可唯讀檢視公開未刪除之行程"
    ON public.itineraries FOR SELECT
    TO anon, authenticated
    USING (is_public = true AND share_token IS NOT NULL AND deleted_at IS NULL);

-- 7.5 Itinerary Jobs
CREATE POLICY "用戶可查看個人任務進度"
    ON public.itinerary_jobs FOR SELECT
    USING (auth.uid() = user_id);

-- [FIX-001] 補上擁有者新增任務政策：
-- 標籤精靈送出時前端以使用者 JWT 直接 INSERT itinerary_jobs（見 05-n8n工作流.md 時序圖），
-- 原規格書遺漏此政策會導致寫入被 RLS 攔截。風格與 7.4 之「擁有者可新增個人行程」一致。
CREATE POLICY "擁有者可新增個人任務"
    ON public.itinerary_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 7.6 Itinerary Shares
CREATE POLICY "擁有者可管理個人分享記錄"
    ON public.itinerary_shares FOR ALL
    USING (auth.uid() = created_by);

CREATE POLICY "訪客可依 Token 驗證分享有效性"
    ON public.itinerary_shares FOR SELECT
    TO anon, authenticated
    USING (revoked_at IS NULL AND expires_at > NOW());

-- ==============================================================================
-- 8. 啟用 Realtime 廣播通道
-- ==============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.itineraries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.itinerary_jobs;

-- ==============================================================================
-- 9. TRACK2-02: 提示詞單選預設值保護與動態查詢 RPC 函式
-- ==============================================================================

-- 9.1 [GUARD] 單選分類 is_default 唯一性保護
CREATE UNIQUE INDEX IF NOT EXISTS uq_prompt_templates_single_default
    ON public.prompt_templates (category)
    WHERE is_default = true AND category IN ('accommodation', 'transit');

-- 9.2 [RPC] 動態提示詞查詢函式
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

GRANT EXECUTE ON FUNCTION public.get_prompt_directives(TEXT[], TEXT, TEXT) TO anon, authenticated;

-- ==============================================================================
-- 10. TRACK1-01: LINE LIFF 用戶自動同步與註冊 RPC 函式 (Zero-fail Auto User Provisioning)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_or_create_line_user(
    p_line_user_id TEXT,
    p_display_name TEXT DEFAULT 'LINE 旅行家',
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
BEGIN
    -- 1. 檢查 profiles 是否已存在此 line_user_id
    SELECT id INTO v_user_id
    FROM public.profiles
    WHERE line_user_id = p_line_user_id;

    IF v_user_id IS NOT NULL THEN
        UPDATE public.profiles
        SET 
            display_name = COALESCE(NULLIF(p_display_name, ''), display_name),
            avatar_url = COALESCE(NULLIF(p_avatar_url, ''), avatar_url),
            updated_at = NOW()
        WHERE id = v_user_id;
        
        RETURN v_user_id;
    END IF;

    -- 2. 若不存在，在 auth.users 建立新使用者
    v_user_id := gen_random_uuid();
    v_email := LOWER(p_line_user_id) || '@atrip.app';

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, is_sso_user, created_at, updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        v_email,
        crypt('line-auth-' || p_line_user_id, gen_salt('bf')),
        NOW(),
        '{"provider":"line","providers":["line"]}'::jsonb,
        jsonb_build_object('line_user_id', p_line_user_id, 'display_name', p_display_name, 'avatar_url', p_avatar_url),
        false,
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- 3. 確保 public.profiles 存在該紀錄
    INSERT INTO public.profiles (id, line_user_id, display_name, avatar_url)
    VALUES (v_user_id, p_line_user_id, COALESCE(NULLIF(p_display_name, ''), 'LINE 旅行家'), p_avatar_url)
    ON CONFLICT (id) DO UPDATE SET
        line_user_id = EXCLUDED.line_user_id,
        display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = NOW();

    RETURN v_user_id;
END;
$$;

COMMENT ON FUNCTION public.get_or_create_line_user IS
    '供前端與 n8n 自動建立或取得 LINE 用戶對應之專屬 User UUID，確保外鍵永遠合法且新用戶無感註冊。';

GRANT EXECUTE ON FUNCTION public.get_or_create_line_user(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;



-- ==============================================================================
-- 11. n8n 原子化寫入行程 RPC 函式 (Zero-fail Atomic Itinerary Persistence)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.save_generated_itinerary(
    p_line_user_id TEXT,
    p_itinerary_id UUID,
    p_destination TEXT,
    p_title TEXT,
    p_preference_snapshot JSONB,
    p_itinerary_data JSONB,
    p_flight_data JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_result JSONB;
BEGIN
    -- 1. 取得或自動建立使用者
    v_user_id := public.get_or_create_line_user(p_line_user_id);

    -- 2. 寫入或更新行程
    INSERT INTO public.itineraries (
        id,
        user_id,
        destination,
        title,
        status,
        is_archived,
        is_public,
        preference_snapshot,
        itinerary_data,
        flight_data,
        updated_at
    )
    VALUES (
        p_itinerary_id,
        v_user_id,
        p_destination,
        COALESCE(p_title, p_destination || ' 自由行'),
        'completed',
        false,
        true,
        COALESCE(p_preference_snapshot, '{}'::jsonb),
        COALESCE(p_itinerary_data, '{}'::jsonb),
        COALESCE(p_flight_data, '[]'::jsonb),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        destination = EXCLUDED.destination,
        title = EXCLUDED.title,
        status = 'completed',
        preference_snapshot = EXCLUDED.preference_snapshot,
        itinerary_data = EXCLUDED.itinerary_data,
        flight_data = EXCLUDED.flight_data,
        updated_at = NOW();

    -- 3. 自動更新為當前活躍關注行程 (Active Itinerary)
    UPDATE public.profiles
    SET active_itinerary_id = p_itinerary_id, updated_at = NOW()
    WHERE id = v_user_id;

    -- 4. 回傳精簡結果
    SELECT jsonb_build_object(

-- ==============================================================================
-- 12. 儀表板資料讀取與操作 RPC 函式 (Zero-fail Dashboard RPCs)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_user_dashboard(
    p_user_id UUID DEFAULT NULL,
    p_line_user_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := p_user_id;
    v_active_id UUID := NULL;
    v_itineraries JSONB := '[]'::jsonb;
    v_profile JSONB := NULL;
BEGIN
    -- 1. 若只有 line_user_id，查找對應之 user_id
    IF v_user_id IS NULL AND p_line_user_id IS NOT NULL THEN
        SELECT id INTO v_user_id
        FROM public.profiles
        WHERE line_user_id = p_line_user_id;
    END IF;

    -- 2. 若有 user_id，取得 profile 與 active_itinerary_id
    IF v_user_id IS NOT NULL THEN
        SELECT 
            active_itinerary_id,
            jsonb_build_object(
                'id', id,
                'line_user_id', line_user_id,
                'display_name', display_name,
                'avatar_url', avatar_url,
                'active_itinerary_id', active_itinerary_id
            )
        INTO v_active_id, v_profile
        FROM public.profiles
        WHERE id = v_user_id;

        -- 3. 取得該用戶所有的未軟刪除行程 (依 created_at 降冪排序)
        SELECT COALESCE(jsonb_agg(to_jsonb(i.*) ORDER BY i.created_at DESC), '[]'::jsonb)
        INTO v_itineraries
        FROM public.itineraries i
        WHERE i.user_id = v_user_id
          AND i.deleted_at IS NULL;
    END IF;

    RETURN jsonb_build_object(
        'user_id', v_user_id,
        'active_itinerary_id', v_active_id,
        'profile', v_profile,
        'itineraries', v_itineraries
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_dashboard(UUID, TEXT) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.set_active_itinerary(
    p_user_id UUID,
    p_itinerary_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET active_itinerary_id = p_itinerary_id, updated_at = NOW()
    WHERE id = p_user_id;
    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_active_itinerary(UUID, UUID) TO anon, authenticated, service_role;

-- 13. 更新 RLS 政策以相容 LIFF 前端無 Token (Anon Key) 讀寫
DROP POLICY IF EXISTS "用戶可查看個人 Profile" ON public.profiles;
DROP POLICY IF EXISTS "用戶可新增個人 Profile" ON public.profiles;
DROP POLICY IF EXISTS "用戶可更新個人 Profile" ON public.profiles;
DROP POLICY IF EXISTS "所有人可依ID查看個人 Profile" ON public.profiles;
DROP POLICY IF EXISTS "所有人可依ID更新個人 Profile" ON public.profiles;
DROP POLICY IF EXISTS "所有人可新增個人 Profile" ON public.profiles;

CREATE POLICY "所有人可依ID查看個人 Profile"
    ON public.profiles FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "所有人可依ID更新個人 Profile"
    ON public.profiles FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "所有人可新增個人 Profile"
    ON public.profiles FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "擁有者可檢視未軟刪除之個人行程" ON public.itineraries;
DROP POLICY IF EXISTS "擁有者可新增個人行程" ON public.itineraries;
DROP POLICY IF EXISTS "擁有者可更新個人行程" ON public.itineraries;
DROP POLICY IF EXISTS "擁有者可軟刪除或刪除個人行程" ON public.itineraries;
DROP POLICY IF EXISTS "外連訪客可唯讀檢視公開未刪除之行程" ON public.itineraries;
DROP POLICY IF EXISTS "允許讀取未刪除行程" ON public.itineraries;
DROP POLICY IF EXISTS "允許新增行程" ON public.itineraries;
DROP POLICY IF EXISTS "允許更新個人行程" ON public.itineraries;
DROP POLICY IF EXISTS "允許刪除個人行程" ON public.itineraries;

CREATE POLICY "允許讀取未刪除行程"
    ON public.itineraries FOR SELECT
    TO anon, authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "允許新增行程"
    ON public.itineraries FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "允許更新個人行程"
    ON public.itineraries FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "允許刪除個人行程"
    ON public.itineraries FOR DELETE
    TO anon, authenticated
    USING (true);

        'id', id,
        'user_id', user_id,
        'status', status,
        'title', title,
        'share_token', share_token
    ) INTO v_result
    FROM public.itineraries
    WHERE id = p_itinerary_id;

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_generated_itinerary(TEXT, UUID, TEXT, TEXT, JSONB, JSONB, JSONB) TO anon, authenticated, service_role;

