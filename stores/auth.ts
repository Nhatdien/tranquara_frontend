/**
 * Auth Mixin - Authentication methods for TranquaraSDK
 * 
 * Handles Keycloak Direct Grant Flow for mobile authentication
 */

import type { LoginCredentials } from '~/types/auth';
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

interface TokenPayload {
  sub: string;
  email: string;
  preferred_username: string;
  name?: string;
  exp: number;
  iat: number;
}

export class Auth {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  /**
   * Login with email and password using Direct Grant Flow
   */
  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      // Access config from Base class (available via SDK)
      const keycloakURL = (this as any).config?.keycloakURL || 
        (typeof window !== 'undefined' ? (window as any).__NUXT__?.config?.public?.keycloakURL : null) ||
        'http://localhost:4200';

      const tokenUrl = `${keycloakURL}/realms/tranquara_auth/protocol/openid-connect/token`;

      const clientSecret = (this as any).config?.keycloakClientSecret ||
        (typeof window !== 'undefined' ? (window as any).__NUXT__?.config?.public?.keycloakClientSecret : null) ||
        '';

      const formData = new URLSearchParams({
        grant_type: 'password',
        client_id: 'tranquara_auth_client',
        client_secret: clientSecret,
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
      const backendURL = (this as any).config?.base_url || 
        (typeof window !== 'undefined' ? (window as any).__NUXT__?.config?.public?.baseURL : null) ||
        'http://localhost:4000';

      const response = await fetch(`${backendURL}/auth/register`, {
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

      const keycloakURL = (this as any).config?.keycloakURL || 
        (typeof window !== 'undefined' ? (window as any).__NUXT__?.config?.public?.keycloakURL : null) ||
        'http://localhost:4200';

      const tokenUrl = `${keycloakURL}/realms/tranquara_auth/protocol/openid-connect/token`;

      const clientSecret = (this as any).config?.keycloakClientSecret ||
        (typeof window !== 'undefined' ? (window as any).__NUXT__?.config?.public?.keycloakClientSecret : null) ||
        '';

      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: 'tranquara_auth_client',
        client_secret: clientSecret,
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
      return false;
    }
  }

  /**
   * Store tokens in secure storage
   */
  private async storeTokens(tokens: KeycloakTokenResponse): Promise<void> {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.tokenExpiry = Date.now() + tokens.expires_in * 1000;

    // Store in secure storage
    await secureStorage.setToken('access_token', tokens.access_token);
    await secureStorage.setToken('refresh_token', tokens.refresh_token);
    await storage.set('token_expiry', this.tokenExpiry.toString());

    // Persist user profile for offline session survival
    const profile = this.getUserProfile();
    if (profile) {
      await secureStorage.setToken('user_profile', JSON.stringify(profile));
      await secureStorage.setToken('has_local_session', 'true');
    }

    // Update SDK config with new token
    if ((this as any).config) {
      (this as any).config.access_token = tokens.access_token;
    }
  }

  /**
   * Load tokens from secure storage.
   * 
   * Offline-first: If tokens exist but are expired, still return true
   * so the app can work offline with local session data.
   * The expired token still contains the user profile (JWT is self-contained).
   */
  async loadTokens(): Promise<boolean> {
    try {
      const accessToken = await secureStorage.getToken('access_token');
      const refreshToken = await secureStorage.getToken('refresh_token');
      const expiryStr = await storage.get<string>('token_expiry');

      if (!accessToken || !refreshToken) {
        // No tokens at all — check for persisted local session
        const hasSession = await this.hasLocalSession();
        return hasSession;
      }

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tokenExpiry = expiryStr ? parseInt(expiryStr) : null;

      // Update SDK config
      if ((this as any).config) {
        (this as any).config.access_token = accessToken;
      }

      // Token is valid — great
      // Token is expired — still return true (user can work offline)
      // The expired JWT still contains user profile data for local use
      return true;
    } catch (error) {
      console.error('Load tokens error:', error);
      return false;
    }
  }

  /**
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    // Check if token is expired
    if (this.tokenExpiry && Date.now() >= this.tokenExpiry) {
      // Try to refresh
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        return null;
      }
    }

    return this.accessToken;
  }

  /**
   * Check if user is authenticated (includes offline session).
   * Returns true if we have tokens (even expired) — user can work offline.
   * For server calls, use hasValidToken() instead.
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Check if we have a valid (non-expired) token for server calls
   */
  hasValidToken(): boolean {
    return !!this.accessToken && (!this.tokenExpiry || Date.now() < this.tokenExpiry);
  }

  /**
   * Check if a persisted local session exists.
   * This survives token expiry and offline periods.
   */
  async hasLocalSession(): Promise<boolean> {
    try {
      const value = await secureStorage.getToken('has_local_session');
      return value === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Get persisted user profile from SecureStorage.
   * Used when token is expired/missing but local session exists.
   */
  async getPersistedProfile(): Promise<TokenPayload | null> {
    try {
      const profileJson = await secureStorage.getToken('user_profile');
      if (profileJson) {
        return JSON.parse(profileJson) as TokenPayload;
      }
    } catch (error) {
      console.error('Error loading persisted profile:', error);
    }
    return null;
  }

  /**
   * Get user profile from token
   */
  getUserProfile(): TokenPayload | null {
    if (!this.accessToken) {
      return null;
    }

    try {
      const parts = this.accessToken.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Parse token error:', error);
      return null;
    }
  }

  /**
   * Logout - clear all tokens and local session.
   * This is the ONLY place that clears the persisted local session.
   */
  async logout(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;

    await secureStorage.removeToken('access_token');
    await secureStorage.removeToken('refresh_token');
    await secureStorage.removeToken('has_local_session');
    await secureStorage.removeToken('user_profile');
    await storage.remove('token_expiry');

    // Clear SDK config
    if ((this as any).config) {
      (this as any).config.access_token = '';
    }
  }

  /**
   * Clear tokens only (for page navigation, not full logout)
   */
  async clearTokens(): Promise<void> {
    await this.logout();
  }

  /**
   * Sync user data to backend PostgreSQL database.
   * Called after login to ensure user exists in backend.
   */
  async syncUserToBackend(userData: {
    email: string;
    username: string;
    oauth_provider: string;
  }): Promise<void> {
    const baseUrl = (this as any).config?.base_url || '';
    const accessToken = (this as any).config?.access_token || '';

    const response = await fetch(`${baseUrl}/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
    }
  }
}
