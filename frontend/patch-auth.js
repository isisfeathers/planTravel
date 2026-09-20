const fs = require('fs');
const file = 'frontend/src/stores/useAuthStore.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
    set({ status: 'initializing', error: null });

    // ==== MOCK LIFF FOR DEVELOPMENT (TRUE SUPABASE LOGIN) ====
    if (process.env.NEXT_PUBLIC_MOCK_LIFF === 'true') {
      console.log('MOCK LIFF IS ENABLED, Logging in via Supabase Email/Password...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'mock@atrip.app',
        password: '123456',
      });

      if (error) {
        console.error("Mock Login Failed (Did you run the SQL seed?)", error);
        set({ status: 'unauthenticated' });
        return;
      }

      set({ 
        isInClient: false, 
        status: 'authenticated', 
        user: { 
          id: data.user.id, 
          line_user_id: 'mock-line-id', 
          display_name: 'Mock User', 
          active_itinerary_id: null 
        } 
      });
      return;
    }
    // ==========================================================

    if (!LIFF_ID) {
`;

// 把之前強行 bypass 的邏輯換成真正拿 token 的邏輯
content = content.replace(/    set\(\{ status: 'initializing', error: null \}\);\s+\/\/ ==== MOCK LIFF FOR DEVELOPMENT ====\s+if \(process.env.NEXT_PUBLIC_MOCK_LIFF === 'true'\) \{\s+console.log\('MOCK LIFF IS ENABLED!'\);\s+set\(\{ \s+isInClient: false, \s+status: 'authenticated', \s+user: \{ id: '11111111-1111-1111-1111-111111111111', line_user_id: 'mock-line-id', display_name: 'Mock User', active_itinerary_id: null \} \s+\}\);\s+return;\s+\}\s+\/\/ ====================================\s+if \(!LIFF_ID\) \{/s, replacement);

fs.writeFileSync(file, content);
console.log('Patched useAuthStore.ts with True Supabase Login');
