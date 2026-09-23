import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { id_token, line_user_id, display_name, picture_url } = await req.json();

    if (!line_user_id) {
      return new Response(JSON.stringify({ error: "Missing line_user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const email = `${line_user_id.toLowerCase()}@atrip.line`;
    const password = `line-auth-${line_user_id}-${(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").slice(0, 10)}`;

    // 1. 查找或建立 Supabase auth.users
    let userId: string;
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userFound = existingUsers?.users?.find((u) => u.email === email);

    if (userFound) {
      userId = userFound.id;
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
        user_metadata: { line_user_id, display_name, picture_url },
      });
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { line_user_id, display_name, picture_url },
      });
      if (createError || !newUser.user) throw createError || new Error("User creation failed");
      userId = newUser.user.id;
    }

    // 2. 同步 profiles 表
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      line_user_id: line_user_id,
      display_name: display_name || "LINE 旅行家",
      avatar_url: picture_url || null,
      updated_at: new Date().toISOString(),
    });

    // 3. 簽發用戶專屬 JWT Session
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: authSession, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !authSession.session) throw signInError || new Error("Sign in failed");

    return new Response(
      JSON.stringify({
        access_token: authSession.session.access_token,
        refresh_token: authSession.session.refresh_token,
        user: {
          id: userId,
          line_user_id,
          display_name: display_name || "LINE 旅行家",
          avatar_url: picture_url || null,
          active_itinerary_id: null,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
