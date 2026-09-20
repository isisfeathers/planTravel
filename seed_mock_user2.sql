-- 確保 public.profiles 內存在假用戶
INSERT INTO public.profiles (id, line_user_id, display_name, active_itinerary_id)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'mock-line-id', 
  '開發測試人員', 
  NULL
)
ON CONFLICT (id) DO NOTHING;
