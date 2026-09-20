INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES 
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'mock@example.com', '', NOW(), NULL, NOW(), '{"provider": "email", "providers": ["email"]}', '{"line_user_id": "mock-line-id"}', NOW(), NOW(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, line_user_id, display_name, active_itinerary_id)
VALUES ('11111111-1111-1111-1111-111111111111', 'mock-line-id', 'Mock User', NULL)
ON CONFLICT (id) DO NOTHING;
