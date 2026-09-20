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

    if (!LIFF_ID) {
      set({
        status: 'error',
        error: {
          code: 'LIFF_INIT_FAILED',
          message: 'NEXT_PUBLIC_LIFF_ID 環境變數未設定',
        },
      });
      return;
    }

    try {
      await liff.init({ liffId: LIFF_ID });
      const inClient = liff.isInClient();
      set({ isInClient: inClient });

      if (!liff.isLoggedIn()) {
        if (inClient) {
          liff.login();
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
      const msg = err instanceof Error ? err.message : '未知的 LIFF 認證錯誤';
      set({
        status: 'error',
        error: {
          code: 'UNKNOWN_ERROR',
          message: msg,
        },
      });
    }
  },

  login: () => {
    if (!liff.isLoggedIn()) {
      liff.login();
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
