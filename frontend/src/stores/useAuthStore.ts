import { create } from 'zustand';
import liff from '@line/liff';
import { supabase } from '@/lib/supabaseClient';
import type {
  AuthUser,
  AuthStatus,
  AuthErrorState,
  AuthLineExchangeRequest,
} from '@/types/auth';

interface AuthStoreState {
  status: AuthStatus;
  user: AuthUser | null;
  error: AuthErrorState | null;
  isInClient: boolean;
  initLiffAndAuth: () => Promise<void>;
  login: () => void;
  mockLogin: () => void;
  logout: () => Promise<void>;
  setActiveItineraryId: (itineraryId: string | null) => void;
  clearError: () => void;
}

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID;

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  status: 'idle',
  user: null,
  error: null,
  isInClient: false,

  mockLogin: async () => {
    // 登入測試帳號以取得 Supabase JWT Session
    try {
      await supabase.auth.signInWithPassword({
        email: 'u84ec34085d449fe8f15e18a9e72711e0@atrip.line',
        password: 'demo-password-123456',
      });
    } catch (e) {
      console.warn('Mock Supabase signIn failed', e);
    }

    set({
      status: 'authenticated',
      user: {
        id: '4d910483-4a11-4d1b-afac-7f13d95bba66',
        line_user_id: 'u84ec34085d449fe8f15e18a9e72711e0',
        display_name: '測試旅人 (Demo User)',
        avatar_url: null,
        active_itinerary_id: 'e61b4ee2-9fc4-4aad-8bbd-5f245333b200',
      },
      error: null,
    });
  },

  initLiffAndAuth: async () => {
    const currentStatus = get().status;
    if (
      currentStatus === 'initializing' ||
      currentStatus === 'exchanging_token' ||
      currentStatus === 'authenticated'
    ) {
      return;
    }

    set({ status: 'initializing', error: null });

    const isMock =
      process.env.NEXT_PUBLIC_MOCK_LIFF === 'true' ||
      (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.includes('github.io')));

    // 若開啟了 MOCK_LIFF 模式或本地預覽，直接啟用測試帳號
    if (isMock) {
      get().mockLogin();
      return;
    }

    if (!LIFF_ID) {
      console.warn('NEXT_PUBLIC_LIFF_ID 未設定，自動啟用 Demo 模式');
      get().mockLogin();
      return;
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('LIFF_INIT_TIMEOUT')), 1500)
      );

      await Promise.race([liff.init({ liffId: LIFF_ID }), timeoutPromise]);
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
        set({ status: 'unauthenticated' });
        return;
      }

      set({ status: 'exchanging_token' });
      const idToken = liff.getIDToken();
      const profile = await liff.getProfile();

      if (!idToken) {
        set({
          status: 'error',
          error: {
            code: 'TOKEN_NOT_FOUND',
            message: '無法自 LIFF SDK 取得 id_token',
          },
        });
        return;
      }

      const exchangePayload: AuthLineExchangeRequest = {
        id_token: idToken,
        line_user_id: profile.userId,
        display_name: profile.displayName,
        picture_url: profile.pictureUrl || '',
      };

      const res = await fetch('/api/auth/line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exchangePayload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        set({
          status: 'error',
          error: {
            code: 'EXCHANGE_FAILED',
            message: errJson.error || 'Token 交換失敗',
          },
        });
        return;
      }

      const data = await res.json();

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      if (sessionError) {
        set({
          status: 'error',
          error: {
            code: 'SESSION_SET_FAILED',
            message: sessionError.message,
          },
        });
        return;
      }

      set({
        status: 'authenticated',
        user: {
          id: data.user.id,
          line_user_id: data.user.line_user_id,
          display_name: data.user.display_name,
          avatar_url: data.user.avatar_url ?? profile.pictureUrl ?? null,
          active_itinerary_id: data.user.active_itinerary_id ?? null,
        },
        error: null,
      });
    } catch (err: unknown) {
      console.warn('LIFF 初始化提示 (外部瀏覽器環境):', err);
      // 在外部一般瀏覽器若連線異常，允許 fallback 至未登入畫面讓使用者自由選擇登入或 Demo
      set({
        status: 'unauthenticated',
        error: null,
      });
    }
  },

  login: () => {
    if (!liff.isLoggedIn()) {
      if (typeof window !== 'undefined') {
        liff.login({ redirectUri: window.location.href });
      } else {
        liff.login();
      }
    }
  },

  logout: async () => {
    try {
      if (liff.isLoggedIn()) {
        liff.logout();
      }
      await supabase.auth.signOut();
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
      set({
        user: {
          ...currentUser,
          active_itinerary_id: itineraryId,
        },
      });
    }
  },

  clearError: () => set({ error: null }),
}));
