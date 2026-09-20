const fs = require('fs');

// 1. 重構 Auth Store
const authStorePath = 'frontend/src/stores/useAuthStore.ts';
let authStoreContent = fs.readFileSync(authStorePath, 'utf8');

// 移除所有 Mock 相關的自動登入邏輯，只在 login() 處理
authStoreContent = authStoreContent.replace(
  /\/\/ ==== MOCK LIFF FOR DEVELOPMENT.*?\/\/ ==========================================================/s,
  ''
);

// 改造 login 函數
const loginReplacement = `
  login: async () => {
    if (process.env.NEXT_PUBLIC_MOCK_LIFF === 'true') {
      console.log("Executing Mock Login...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'mock@atrip.app',
        password: '123456',
      });
      if (error) {
        console.error('Mock login failed:', error.message);
        set({ status: 'error', error: { code: 'MOCK_LOGIN_FAILED', message: error.message } });
        return;
      }
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('line_user_id, display_name, active_itinerary_id')
          .eq('id', data.user.id)
          .single();

        set({
          status: 'authenticated',
          user: {
            id: data.user.id,
            line_user_id: profile?.line_user_id || 'mock-line-id',
            display_name: profile?.display_name || 'Mock User',
            active_itinerary_id: profile?.active_itinerary_id || null,
          },
          error: null,
        });
      }
    } else {
      if (!liff.isLoggedIn()) {
        liff.login();
      }
    }
  },
`;

authStoreContent = authStoreContent.replace(
  /login: async \(\) => \{[\s\S]*?if \(!liff.isLoggedIn\(\)\) \{\s*liff.login\(\);\s*\}\s*\},/,
  loginReplacement
);

fs.writeFileSync(authStorePath, authStoreContent, 'utf8');
console.log('1. Auth Store 重構完成');

// 2. 重構 LiffProvider
const liffProviderPath = 'frontend/src/components/auth/LiffProvider.tsx';
let liffProviderContent = fs.readFileSync(liffProviderPath, 'utf8');

// 移除 MOCK 模式下的轉圈圈畫面
liffProviderContent = liffProviderContent.replace(
  /\/\/ 在 MOCK 模式下.*?if \(status === 'unauthenticated'\) \{/s,
  "  if (status === 'unauthenticated') {"
);

fs.writeFileSync(liffProviderPath, liffProviderContent, 'utf8');
console.log('2. LiffProvider 重構完成');

// 3. 重構 Dashboard 頁面
const dashboardPath = 'frontend/src/app/dashboard/page.tsx';
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// 從 useAuthStore 拿 userID
const dashboardLogic = `
  const { user } = useAuthStore();
  const { 
    activeItineraryId, 
    activeAndUpcoming, 
    archived, 
    isLoading, 
    error, 
    setActiveItinerary, 
    archiveItinerary, 
    softDeleteItinerary 
  } = useItineraries(user?.id);
`;

dashboardContent = dashboardContent.replace(
  /const currentUserId = '11111111-1111-1111-1111-111111111111';[\s\S]*?useItineraries\(currentUserId\);/,
  dashboardLogic
);

// 導入 useAuthStore
dashboardContent = dashboardContent.replace(
  "import { useItineraries } from '@/hooks/useItineraries';",
  "import { useItineraries } from '@/hooks/useItineraries';\nimport { useAuthStore } from '@/stores/useAuthStore';"
);

fs.writeFileSync(dashboardPath, dashboardContent, 'utf8');
console.log('3. Dashboard 頁面重構完成');

