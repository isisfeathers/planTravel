export interface AuthUser {
  id: string;
  line_user_id: string;
  display_name: string | null;
  avatar_url?: string | null;
  active_itinerary_id: string | null;
}

export interface AuthLineExchangeRequest {
  id_token: string;
  line_user_id: string;
  display_name: string;
  picture_url: string;
}

export interface AuthLineExchangeResponse {
  access_token: string;
  token_type: 'bearer' | string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    line_user_id: string;
    display_name: string | null;
    avatar_url?: string | null;
    active_itinerary_id: string | null;
  };
}

export type AuthStatus =
  | 'idle'
  | 'initializing'
  | 'unauthenticated'
  | 'exchanging_token'
  | 'authenticated'
  | 'error';

export type AuthErrorCode =
  | 'LIFF_INIT_FAILED'
  | 'TOKEN_NOT_FOUND'
  | 'EXCHANGE_FAILED'
  | 'SESSION_SET_FAILED'
  | 'UNKNOWN_ERROR';

export interface AuthErrorState {
  code: AuthErrorCode;
  message: string;
}
