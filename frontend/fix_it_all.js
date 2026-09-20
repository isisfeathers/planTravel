const fs = require('fs');

// File paths
const authStorePath = 'frontend/src/stores/useAuthStore.ts';
const liffProviderPath = 'frontend/src/components/auth/LiffProvider.tsx';
const dashboardPath = 'frontend/src/app/dashboard/page.tsx';
const useItinerariesPath = 'frontend/src/hooks/useItineraries.ts';

// 1. 重構 Auth Store - 確保 Mock 登入後 user state 完整
let authStoreContent = fs.readFileSync(authStorePath, 'utf8');
const authLoginReplacement = `
  login: async () => {
    if (process.env.NEXT_PUBLIC_MOCK_LIFF === 'true') {
      console.log("Executing Mock Login with mock@atrip.app...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'mock@atrip.app',
        password: '123456',
      });

      if (error || !data.user) {
        console.error('Mock login failed:', error?.message);
        set({ status: 'error', error: { code: 'MOCK_LOGIN_FAILED', message: error?.message || 'Unknown login error' } });
        return;
      }

      console.log("Mock user signed in, fetching profile...");
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('line_user_id, display_name, active_itinerary_id')
        .eq('id', data.user.id)
        .single(); // 使用 .single() 確保我們期待的是單一結果

      if (profileError) {
         // 如果是因為查無資料而報錯，我們就給他一個預設的 Profile
        if (profileError.code === 'PGRST116') {
          console.warn('Profile not found for mock user, creating one in state.');
          set({
            status: 'authenticated',
            user: {
              id: data.user.id,
              line_user_id: 'mock-line-id',
              display_name: '開發測試人員',
              active_itinerary_id: null,
            },
            error: null,
          });
        } else {
          console.error('Error fetching profile:', profileError.message);
          set({ status: 'error', error: { code: 'PROFILE_FETCH_FAILED', message: profileError.message } });
          return;
        }
      } else {
        console.log("Profile fetched successfully.");
        set({
          status: 'authenticated',
          user: {
            id: data.user.id,
            line_user_id: profile.line_user_id,
            display_name: profile.display_name,
            active_itinerary_id: profile.active_itinerary_id,
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
authStoreContent = authStoreContent.replace(/login: async \(\) => \{[\s\S]*?liff\.login\(\);\s*\}\s*\},/, authLoginReplacement);
fs.writeFileSync(authStorePath, authStoreContent, 'utf8');
console.log('1. Auth Store 重構完成 (login 流程強化)');


// 2. 徹底簡化 LiffProvider
let liffProviderContent = fs.readFileSync(liffProviderPath, 'utf8');
const liffProviderReplacement = `
export const LiffProvider: React.FC<LiffProviderProps> = ({ children }) => {
  const { status, initLiffAndAuth } = useAuthStore();

  useEffect(() => {
    // We only initialize liff, we DO NOT auto-login here.
    initLiffAndAuth();
  }, [initLiffAndAuth]);

  if (status === 'initializing') {
    return <div>正在初始化認證環境...</div>; // 簡化的讀取畫面
  }

  if (status === 'unauthenticated') {
    return <QrLoginGuide />;
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return <div>請重新整理頁面</div>; // Fallback
};
`;
liffProviderContent = liffProviderContent.replace(/export const LiffProvider:[\s\S]*/, liffProviderReplacement);
fs.writeFileSync(liffProviderPath, liffProviderContent, 'utf8');
console.log('2. LiffProvider 徹底簡化完成');


// 3. 修正 Dashboard 頁面，確保它從 AuthStore 正確取值
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
// 確保導入 useAuthStore
if (!dashboardContent.includes("useAuthStore")) {
    dashboardContent = dashboardContent.replace(
        "import { useItineraries } from '@/hooks/useItineraries';",
        "import { useItineraries } from '@/hooks/useItineraries';\nimport { useAuthStore } from '@/stores/useAuthStore';"
    );
}
// 從 AuthStore 獲取 user，並只在 user.id 存在時才傳給 useItineraries
const dashboardHookReplacement = `
  const { user } = useAuthStore();
  const { 
    activeAndUpcoming, 
    archived, 
    isLoading, 
    error 
  } = useItineraries(user?.id);
`;
dashboardContent = dashboardContent.replace(/[\s\S]*const \{/m, 'export default function DashboardPage() {\n' + dashboardHookReplacement + '\n  const {isLoading: isItineraryLoading, error: itineraryError} = useItineraries(user?.id);\n const {\n');
dashboardContent = dashboardContent.replace(/useItineraries\(currentUserId\)/, 'useItineraries(user?.id)');
fs.writeFileSync(dashboardPath, dashboardContent, 'utf8');
console.log('3. Dashboard 頁面重構完成 (與 AuthStore 對齊)');


// 4. 終極簡化 useItineraries Hook
let useItinerariesContent = fs.readFileSync(useItinerariesPath, 'utf8');
const useItinerariesReplacement = `
export function useItineraries(userId: string | undefined): UseItinerariesReturn {
  const [itineraries, setItineraries] = useState<ItineraryEntity[]>([]);
  const [activeItineraryId, setActiveItineraryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 預設為 true
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return; // 如果沒有 userID，直接停止，不再轉圈
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setItineraries(data || []);

    } catch (err: any) {
      setError("讀取行程時發生錯誤: " + err.message);
    } finally {
      setIsLoading(false); // 無論如何都結束 loading
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 其他函式保持不變...
`;
useItinerariesContent = useItinerariesContent.replace(/export function useItineraries\\(userId: string \\| undefined\\): UseItinerariesReturn \\{[\\s\\S]*?useEffect\(\\(\\) => \{\s*fetchDashboardData\(\);\s*\}, \[fetchDashboardData\]\);/m, useItinerariesReplacement);
fs.writeFileSync(useItinerariesPath, useItinerariesContent, 'utf8');
console.log('4. useItineraries Hook 徹底簡化完成');

EOF

node frontend/patch-final-hook.js
