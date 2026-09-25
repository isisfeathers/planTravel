import { create } from 'zustand';
import liff from '@line/liff';
import { supabase } from '@/lib/supabaseClient';
import type {
  AuthUser,
  AuthStatus,
  AuthErrorState,
} from '@/types/auth';

interface AuthStoreState {
  status: AuthStatus;
  user: AuthUser | null;
  error: AuthErrorState | null;
  isInClient: boolean;
  initLiffAndAuth: (force?: boolean) => Promise<void>;
  login: () => Promise<void>;
  mockLogin: () => void;
  logout: () => Promise<void>;
  setActiveItineraryId: (itineraryId: string | null) => void;
  clearError: () => void;
}

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || '2011659983-aQFWuWxE';

// 嘗試由本地快取預熱使用者資訊，避免頁面重整瞬間空白
const getCachedUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (sessionStorage.getItem('atrip_explicit_logout') === 'true') {
      return null;
    }
    const raw = localStorage.getItem('atrip_auth_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.display_name === 'string') {
      parsed.display_name = parsed.display_name.replace(/\s*\(Demo\)/g, '').trim();
    }
    return parsed;
  } catch (e) {
    return null;
  }
};

const initialCachedUser = getCachedUser();

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  status: initialCachedUser ? 'authenticated' : 'idle',
  user: initialCachedUser,
  error: null,
  isInClient: false,

  mockLogin: async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('atrip_explicit_logout');
    }
    // 優先沿用本地固定的 Mock 帳號，避免每次重整 UUID 變動導致查無行程
    let mockUser: AuthUser | null = null;
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('atrip_mock_user');
        if (cached) {
          mockUser = JSON.parse(cached);
          if (mockUser && typeof mockUser.display_name === 'string') {
            mockUser.display_name = mockUser.display_name.replace(/\s*\(Demo\)/g, '').trim();
          }
        }
      } catch (e) {}
    }

    if (!mockUser) {
      const guestId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `guest-${Date.now()}`;

      mockUser = {
        id: guestId,
        line_user_id: `guest-${guestId.slice(0, 8)}`,
        display_name: '訪客旅人',
        avatar_url: null,
        active_itinerary_id: null,
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('atrip_mock_user', JSON.stringify(mockUser));
        } catch (e) {}
      }
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('atrip_auth_user', JSON.stringify(mockUser));
      } catch (e) {}
    }

    try {
      await supabase.auth.signOut();
    } catch (e) {}

    set({
      status: 'authenticated',
      user: mockUser,
      error: null,
    });
  },

  initLiffAndAuth: async (force = false) => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('atrip_explicit_logout') === 'true' && !force) {
      set({ status: 'unauthenticated', user: null });
      return;
    }

    const currentStatus = get().status;
    const currentUser = get().user;
    const isGuest = currentUser?.line_user_id?.startsWith('guest-');

    if (!force) {
      if (
        currentStatus === 'initializing' ||
        currentStatus === 'exchanging_token' ||
        (currentStatus === 'authenticated' && !isGuest)
      ) {
        return;
      }
    }

    set({ status: 'initializing', error: null });

    if (process.env.NEXT_PUBLIC_MOCK_LIFF === 'true' && !force) {
      get().mockLogin();
      return;
    }

    const liffId = LIFF_ID || '2011659983-aQFWuWxE';

    try {
      await liff.init({ liffId });
      const inClient = liff.isInClient();
      set({ isInClient: inClient });

      if (!liff.isLoggedIn()) {
        if (inClient) {
          if (typeof window !== 'undefined') {
            liff.login({ redirectUri: window.location.href });
          } else {
            liff.login();
          }
          return;
        }
        if (isGuest && !force) {
          set({ status: 'authenticated', user: currentUser });
          return;
        }
        set({ status: 'unauthenticated' });
        return;
      }

      set({ status: 'exchanging_token' });
      const idToken = liff.getIDToken();
      const profile = await liff.getProfile();

      if (!profile || !profile.userId) {
        set({
          status: 'error',
          error: {
            code: 'TOKEN_NOT_FOUND',
            message: '無法取得 LINE 用戶個人資料',
          },
        });
        return;
      }

      const lineUserId = profile.userId;
      const displayName = profile.displayName || 'LINE 旅行家';
      const pictureUrl = profile.pictureUrl || null;

      let authUser: AuthUser | null = null;

      // 1. 呼叫 get_or_create_line_user 函式 (自動在 Supabase 註冊並建立 profiles 記錄)
      try {
        const { data: rpcUserId, error: rpcErr } = await supabase.rpc('get_or_create_line_user', {
          p_line_user_id: lineUserId,
          p_display_name: displayName,
          p_avatar_url: pictureUrl,
        });

        if (!rpcErr && rpcUserId) {
          authUser = {
            id: rpcUserId,
            line_user_id: lineUserId,
            display_name: displayName,
            avatar_url: pictureUrl,
            active_itinerary_id: null,
          };
        }
      } catch (authErr) {
        console.warn('[Auth] Supabase Session 交換提示:', authErr);
      }

      // 2. 備援方案：若 RPC 未及時回應，查詢既有 Profile
      if (!authUser) {
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('line_user_id', lineUserId)
            .maybeSingle();

          if (existingProfile) {
            authUser = {
              id: existingProfile.id,
              line_user_id: existingProfile.line_user_id,
              display_name: existingProfile.display_name || displayName,
              avatar_url: existingProfile.avatar_url || pictureUrl,
              active_itinerary_id: existingProfile.active_itinerary_id || null,
            };
          } else {
            const fallbackUserId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}`;
            authUser = {
              id: fallbackUserId,
              line_user_id: lineUserId,
              display_name: displayName,
              avatar_url: pictureUrl,
              active_itinerary_id: null,
            };
          }
        } catch (dbErr) {
          const fallbackUserId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}`;
          authUser = {
            id: fallbackUserId,
            line_user_id: lineUserId,
            display_name: displayName,
            avatar_url: pictureUrl,
            active_itinerary_id: null,
          };
        }
      }

      // 3. 嘗試讀取 active_itinerary_id
      try {
        const { data: pData } = await supabase
          .from('profiles')
          .select('active_itinerary_id')
          .eq('id', authUser.id)
          .maybeSingle();
        if (pData?.active_itinerary_id) {
          authUser.active_itinerary_id = pData.active_itinerary_id;
        }
      } catch (e) {}

      // 4. 快取至 localStorage
      if (typeof window !== 'undefined' && authUser) {
        try {
          localStorage.setItem('atrip_auth_user', JSON.stringify(authUser));
        } catch (e) {}
      }

      set({
        status: 'authenticated',
        user: authUser,
        error: null,
      });
    } catch (err: unknown) {
      console.warn('LIFF 初始化 (外部瀏覽器環境):', err);
      set({
        status: 'unauthenticated',
        error: null,
      });
    }
  },

  login: async () => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem('atrip_explicit_logout');
      localStorage.removeItem('atrip_auth_user');
      localStorage.removeItem('atrip_mock_user');
      const liffId = LIFF_ID || '2011659983-aQFWuWxE';

      try {
        await liff.init({ liffId });
      } catch (initErr) {
        console.warn('LIFF init inside login:', initErr);
      }

      if (liff.isLoggedIn()) {
        // 如果在 LINE App 內已登入，強制執行使用者狀態同步
        await get().initLiffAndAuth(true);
        return;
      }

      const currentUrl = window.location.href;
      try {
        liff.login({ redirectUri: currentUrl });
      } catch (loginErr) {
        console.warn('liff.login redirect fallback to https://liff.line.me:', loginErr);
        window.location.href = `https://liff.line.me/${liffId}`;
      }
    } catch (err) {
      console.error('Login exception, fallback to direct LIFF URL:', err);
      const liffId = LIFF_ID || '2011659983-aQFWuWxE';
      window.location.href = `https://liff.line.me/${liffId}`;
    }
  },

  logout: async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('atrip_explicit_logout', 'true');
        localStorage.removeItem('atrip_auth_user');
        localStorage.removeItem('atrip_mock_user');
      }
      try {
        if (liff.isLoggedIn()) {
          liff.logout();
        }
      } catch (e) {}
      try {
        await supabase.auth.signOut();
      } catch (e) {}
      set({
        status: 'unauthenticated',
        user: null,
        error: null,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登出失敗';
      set({
        error: {
          code: 'UNKNOWN_ERROR',
          message: msg,
        },
      });
    }
  },

  setActiveItineraryId: (itineraryId: string | null) => {
    const currentUser = get().user;
    if (currentUser) {
      const updated = {
        ...currentUser,
        active_itinerary_id: itineraryId,
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('atrip_auth_user', JSON.stringify(updated));
        } catch (e) {}
      }
      set({ user: updated });
    }
  },

  clearError: () => set({ error: null }),
}));
