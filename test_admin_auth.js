const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fvnxaksfcftatvxddhpx.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bnhha3NmY2Z0YXR2eGRkaHB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTUzMjk5OCwiZXhwIjoyMTA1MTA4OTk4fQ.a2n_6uHAugC5IeddlGG3wIHoZn4l5Z_lskV-IUrRzQk";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkAdmin() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("List users error:", listError);
    return;
  }
  console.log("Existing users count:", users.users.length);
  users.users.forEach(u => console.log("User:", u.id, u.email));
}

checkAdmin();
