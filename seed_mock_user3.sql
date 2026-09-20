-- 在 Supabase 建立一個可用的 auth.users 測試帳號與對應的 profiles，並設定密碼為 "123456"
-- 如果已經有同樣 email 的就更新密碼
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, is_sso_user
)
VALUES (
    '00000000-0000-0000-0000-000000000000', 
    '11111111-1111-1111-1111-111111111111', 
    'authenticated', 'authenticated', 'mock@atrip.app', 
    crypt('123456', gen_salt('bf')), -- 這是讓密碼變成 123456 的關鍵
    NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"line_user_id":"mock-line-id"}',
    false, false
)
ON CONFLICT (id) DO UPDATE SET 
    encrypted_password = EXCLUDED.encrypted_password,
    email = EXCLUDED.email;

INSERT INTO public.profiles (id, line_user_id, display_name, active_itinerary_id)
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    'mock-line-id', 
    '開發測試人員', 
    NULL
)
ON CONFLICT (id) DO NOTHING;
