import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const isConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url_here');

// Graceful fallback to avoid throwing error on startup if environment variables are not pasted yet
export const supabase = createClient(
  isConfigured ? supabaseUrl! : 'https://mock-project.supabase.co',
  isConfigured ? supabaseAnonKey! : 'mock-anon-key'
);

export const isSupabaseConfigured = () => isConfigured;

if (!isConfigured) {
  console.log('[Supabase Service] Run in MOCK mode (SUPABASE_URL / SUPABASE_ANON_KEY not set).');
} else {
  console.log('[Supabase Service] Configured successfully and ready.');
}
