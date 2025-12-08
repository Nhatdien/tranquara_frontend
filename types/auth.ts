/**
 * Authentication Type Definitions
 */

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface UserProfile {
  sub: string; // User UUID
  email?: string;
  preferred_username?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
