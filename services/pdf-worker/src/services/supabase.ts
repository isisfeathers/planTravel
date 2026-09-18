import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Prefer Service Role Key to bypass RLS and upload directly to Storage
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const isConfigured = !!(supabaseUrl && supabaseServiceKey && supabaseUrl !== 'your_supabase_url_here');

export const supabase = createClient(
  isConfigured ? supabaseUrl! : 'https://mock-project.supabase.co',
  isConfigured ? supabaseServiceKey! : 'mock-anon-key'
);

export const isSupabaseConfigured = () => isConfigured;

if (!isConfigured) {
  console.log('[Supabase Service] Run in MOCK mode (SUPABASE_URL or keys not set).');
} else {
  console.log('[Supabase Service] Configured successfully for PDF Worker.');
}
