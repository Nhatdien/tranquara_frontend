/**
 * Authentication Service - Direct Grant Flow for Mobile
 * 
 * This service handles email/password authentication using Keycloak's Direct Grant Flow
 * (Resource Owner Password Credentials Grant). This is suitable for mobile apps with
 * custom login UI instead of browser redirects.
 * 
 * Features:
 * - Email/password login via Direct Grant
 * - Token storage in secure storage (Capacitor SecureStorage)
 * - Automatic token refresh
 * - Offline authentication support
 */

import type { LoginCredentials, AuthTokens, UserProfile } from '~/types/auth';
import { secureStorage } from '~/utils/secure-storage';
import { storage } from '~/utils/storage';

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
}

export class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  // Keycloak configuration - get from environment at runtime
  private get KEYCLOAK_URL(): string {
    return typeof window !== 'undefined' 
      ? (window as any).__NUXT__?.config?.public?.keycloakURL || import.meta.env.NUXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:4200'
      : 'http://localhost:4200';
  }

  private get BACKEND_URL(): string {
    return typeof window !== 'undefined'
      ? (window as any).__NUXT__?.config?.public?.baseURL || import.meta.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:4000'
      : 'http://localhost:4000';
  }

  private readonly REALM = 'tranquara_auth';
  private readonly CLIENT_ID = 'tranquara_auth_client';
  private readonly CLIENT_SECRET = 'JWUXybAZ4Qrm99KaRMF0wWM5DI8X1j5m';

  private constructor() {
    // No initialization needed - using getters
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login with email and password using Direct Grant Flow
   */
  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const tokenUrl = `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`;

      const formData = new URLSearchParams({
        grant_type: 'password',
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        username: credentials.username,
        password: credentials.password,
        scope: 'openid email profile',
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Login failed');
      }

      const tokens: KeycloakTokenResponse = await response.json();
      await this.storeTokens(tokens);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user via backend API
   */
  async register(email: string, username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const tokenUrl = `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`;

      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        refresh_token: this.refreshToken,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokens: KeycloakTokenResponse = await response.json();
      await this.storeTokens(tokens);

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.logout();
      return false;
    }
  }

  /**
   * Store tokens in memory and secure storage
   */
  private async storeTokens(tokens: KeycloakTokenResponse): Promise<void> {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.tokenExpiry = Date.now() + tokens.expires_in * 1000;

    // Store in Capacitor SecureStorage (encrypted on mobile)
    if (process.client) {
      try {
        await secureStorage.setToken('access_token', tokens.access_token);
        await secureStorage.setToken('refresh_token', tokens.refresh_token);
        await storage.set('token_expiry', this.tokenExpiry);
        
        console.log('✅ Tokens stored securely');
      } catch (error) {
        console.error('❌ Error storing tokens:', error);
      }
    }
  }

  /**
   * Load tokens from storage on app start
   */
  async loadTokens(): Promise<boolean> {
    if (process.client) {
      try {
        const accessToken = await secureStorage.getToken('access_token');
        const refreshToken = await secureStorage.getToken('refresh_token');
        const tokenExpiry = await storage.get<number>('token_expiry');

        if (accessToken && refreshToken && tokenExpiry) {
          this.accessToken = accessToken;
          this.refreshToken = refreshToken;
          this.tokenExpiry = tokenExpiry;

          console.log('✅ Tokens loaded from secure storage');

          // Check if token is expired
          if (this.isTokenExpired()) {
            console.log('⚠️ Token expired, attempting refresh...');
            return await this.refreshAccessToken();
          }

          return true;
        }
      } catch (error) {
        console.error('Error loading tokens:', error);
      }
    }
    return false;
  }

  /**
   * Check if access token is expired or about to expire
   */
  isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    // Consider token expired if less than 30 seconds remaining
    return Date.now() >= this.tokenExpiry - 30000;
  }

  /**
   * Get current access token (refresh if needed)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.accessToken) {
      await this.loadTokens();
    }

    if (this.isTokenExpired()) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) return null;
    }

    return this.accessToken;
  }

  /**
   * Get user profile from token
   */
  getUserProfile(): UserProfile | null {
    if (!this.accessToken) return null;

    try {
      const payload = this.parseJwt(this.accessToken);
      return {
        sub: payload.sub,
        email: payload.email,
        preferred_username: payload.preferred_username,
        email_verified: payload.email_verified,
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  /**
   * Get user UUID from token
   */
  getUserUUID(): string | null {
    const profile = this.getUserProfile();
    return profile?.sub || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired();
  }

  /**
   * Logout - clear all tokens and storage
   */
  async logout(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;

    if (process.client) {
      try {
        await secureStorage.removeToken('access_token');
        await secureStorage.removeToken('refresh_token');
        await storage.remove('token_expiry');
        
        console.log('✅ Tokens cleared from secure storage');
      } catch (error) {
        console.error('❌ Error clearing tokens:', error);
      }
    }
  }

  /**
   * Clear tokens without redirecting (for auth pages)
   */
  async clearTokens(): Promise<void> {
    await this.logout();
  }

  /**
   * Parse JWT token (simple decoder - doesn't validate signature)
   */
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }
}

export default AuthService.getInstance();
