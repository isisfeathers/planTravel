import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fvnxaksfcftatvxddhpx.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_token, line_user_id, display_name, picture_url } = body;

    if (!line_user_id) {
      return NextResponse.json({ error: "Missing line_user_id" }, { status: 400 });
    }

    const email = `${line_user_id.toLowerCase()}@atrip.line`;
    const password = `line-auth-${line_user_id}-${process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10)}`;

    // 1. 確保 Supabase auth.users 中存在此使用者
    let userId: string;
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userFound = existingUser?.users?.find(u => u.email === email);

    if (userFound) {
      userId = userFound.id;
      // 更新密碼以保證登入一致性
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
        user_metadata: { line_user_id, display_name, picture_url }
      });
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { line_user_id, display_name, picture_url }
      });

      if (createError || !newUser.user) {
        console.error("Create auth user error:", createError);
        return NextResponse.json({ error: "Failed to create user in Supabase" }, { status: 500 });
      }
      userId = newUser.user.id;
    }

    // 2. 同步 profiles 表
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      line_user_id: line_user_id,
      display_name: display_name || "LINE 旅行家",
      avatar_url: picture_url || null,
      updated_at: new Date().toISOString()
    });

    // 3. 取得使用者的真實 Session (JWT Token)
    const { data: authSession, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (signInError || !authSession.session) {
      console.error("Sign in error:", signInError);
      return NextResponse.json({ error: "Failed to generate session" }, { status: 500 });
    }

    return NextResponse.json({
      access_token: authSession.session.access_token,
      refresh_token: authSession.session.refresh_token,
      user: {
        id: userId,
        line_user_id: line_user_id,
        display_name: display_name || "LINE 旅行家",
        avatar_url: picture_url || null,
        active_itinerary_id: null
      }
    });

  } catch (error: any) {
    console.error("Auth-line error:", error);
    return NextResponse.json({ error: "Internal Auth Error", message: error.message }, { status: 500 });
  }
}
