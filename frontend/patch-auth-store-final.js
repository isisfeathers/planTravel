const fs = require('fs');

const authStorePath = 'frontend/src/stores/useAuthStore.ts';
let authStoreContent = fs.readFileSync(authStorePath, 'utf8');

// 徹底移除 signInWithPassword 和 fetch profile 的邏輯，改回純前端 Mock
const loginReplacement = `
  login: () => {
    if (process.env.NEXT_PUBLIC_MOCK_LIFF === 'true') {
      console.log("Executing Pure Frontend Mock Login...");
      set({
        status: 'authenticated',
        user: {
          id: '11111111-1111-1111-1111-111111111111',
          line_user_id: 'mock-line-id',
          display_name: 'Mock User',
          active_itinerary_id: null,
        },
        error: null,
      });
    } else {
      if (!liff.isLoggedIn()) {
        liff.login();
      }
    }
  },
`;

authStoreContent = authStoreContent.replace(
  /login: async \(\) => \{[\s\S]*?if \(!liff.isLoggedIn\(\)\) \{\s*liff.login\(\);\s*\}\s*\}\s*\},/,
  loginReplacement
);

// 也要把 useAuthStore 的類型定義改回來，因為不使用 async 了
authStoreContent = authStoreContent.replace(
  "login: () => void;",
  "login: () => void;" 
);

fs.writeFileSync(authStorePath, authStoreContent, 'utf8');
console.log('1. Auth Store (login) 徹底改為純前端 Mock');


const liffProviderPath = 'frontend/src/components/auth/LiffProvider.tsx';
let liffProviderContent = fs.readFileSync(liffProviderPath, 'utf8');

const liffProviderReplacement = `
export const LiffProvider: React.FC<LiffProviderProps> = ({ children }) => {
  const { status, initLiffAndAuth } = useAuthStore();

  useEffect(() => {
    initLiffAndAuth();
  }, [initLiffAndAuth]);

  if (status === 'initializing') {
    return <div>正在初始化...</div>;
  }

  if (status === 'unauthenticated') {
    return <QrLoginGuide />;
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return <div>請重新整理頁面</div>;
};
`;

liffProviderContent = liffProviderContent.replace(/export const LiffProvider:[\s\S]*/, liffProviderReplacement);
fs.writeFileSync(liffProviderPath, liffProviderContent, 'utf8');
console.log('2. LiffProvider 重構完成');

