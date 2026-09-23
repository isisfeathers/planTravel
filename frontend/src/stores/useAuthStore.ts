import { create } from 'zustand';
import liff from '@line/liff';
import { supabase } from '@/lib/supabaseClient';
import type {
  AuthUser,
  AuthStatus,
  AuthErrorState,
  AuthLineExchangeRequest,
  AuthLineExchangeResponse,
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

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || '2011659983-aQFWuWxE';

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  status: 'idle',
  user: null,
  error: null,
  isInClient: false,

  mockLogin: async () => {
    set({
      status: 'authenticated',
      user: {
        id: '4d910483-4a11-4d1b-afac-7f13d95bba66',
        line_user_id: 'u84ec34085d449fe8f15e18a9e72711e0',
        display_name: '測試旅人 (Demo User)',
        avatar_url: null,
        active_itinerary_id: null,
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

    if (process.env.NEXT_PUBLIC_MOCK_LIFF === 'true') {
      get().mockLogin();
      return;
    }

    if (!LIFF_ID) {
      set({ status: 'unauthenticated' });
      return;
    }

    try {
      await liff.init({ liffId: LIFF_ID });
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

      const exchangePayload: AuthLineExchangeRequest = {
        id_token: idToken || '',
        line_user_id: lineUserId,
        display_name: displayName,
        picture_url: pictureUrl || '',
      };

      let authUser: AuthUser | null = null;

      try {
        const { data: edgeData, error: edgeErr } = await supabase.functions.invoke<AuthLineExchangeResponse>(
          'auth-line',
          { body: exchangePayload }
        );

        if (!edgeErr && edgeData?.access_token) {
          await supabase.auth.setSession({
            access_token: edgeData.access_token,
            refresh_token: edgeData.refresh_token,
          });

          authUser = {
            id: edgeData.user.id,
            line_user_id: edgeData.user.line_user_id,
            display_name: edgeData.user.display_name,
            avatar_url: edgeData.user.avatar_url ?? pictureUrl,
            active_itinerary_id: edgeData.user.active_itinerary_id ?? null,
          };
        }
      } catch (invokeErr) {
        console.warn('Edge function auth-line fallback to profile check:', invokeErr);
      }

      // 2. 備援登入方案：自動透過 profile 查找或建立
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
            // 新用戶首次進站，以 line_user_id 為基礎建立專屬 profile
            const { data: newProfile, error: insErr } = await supabase
              .from('profiles')
              .upsert({
                line_user_id: lineUserId,
                display_name: displayName,
                avatar_url: pictureUrl,
                updated_at: new Date().toISOString(),
              })
              .select('*')
              .maybeSingle();

            if (newProfile && !insErr) {
              authUser = {
                id: newProfile.id,
                line_user_id: newProfile.line_user_id,
                display_name: newProfile.display_name || displayName,
                avatar_url: newProfile.avatar_url || pictureUrl,
                active_itinerary_id: null,
              };
            } else {
              authUser = {
                id: lineUserId,
                line_user_id: lineUserId,
                display_name: displayName,
                avatar_url: pictureUrl,
                active_itinerary_id: null,
              };
            }
          }
        } catch (dbErr) {
          authUser = {
            id: lineUserId,
            line_user_id: lineUserId,
            display_name: displayName,
            avatar_url: pictureUrl,
            active_itinerary_id: null,
          };
        }
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
