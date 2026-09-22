import { supabase } from "@/lib/supabaseClient";

export function getSupabaseBrowserClient() {
  return supabase;
}

