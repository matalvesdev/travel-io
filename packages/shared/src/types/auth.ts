export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: 'FREE' | 'PRO' | 'PREMIUM';
}
