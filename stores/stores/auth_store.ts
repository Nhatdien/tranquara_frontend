/**
 * Authentication Store - Pinia
 * 
 * Manages authentication state and provides actions for login, register, logout
 */

import { defineStore } from 'pinia';
import TranquaraSDK from '../tranquara_sdk';
import type { AuthState, LoginCredentials, RegisterCredentials, UserProfile } from '~/types/auth';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    getUserUUID: (state): string | null => {
      return state.user?.sub || null;
    },

    getUsername: (state): string | null => {
      return state.user?.preferred_username || null;
    },

    getEmail: (state): string | null => {
      return state.user?.email || null;
    },
  },

  actions: {
    /**
     * Initialize auth state from stored tokens
     * Note: Does NOT sync to backend during plugin initialization to avoid race conditions
     * Backend sync happens after all plugins are loaded
     */
    /**
     * Initialize auth state from stored tokens.
     * 
     * Offline-first strategy:
     * - If tokens are valid → authenticated normally
     * - If tokens expired but local session exists → authenticated in offline mode
     *   (user can use all local features, server calls fail gracefully)
     */
    async initialize() {
      this.loading = true;
      try {
        const sdk = TranquaraSDK.getInstance();
        const hasTokens = await sdk.loadTokens();
        console.log('[AuthStore] Tokens loaded:', hasTokens);
        
        if (hasTokens) {
          // loadTokens returns true for both valid tokens AND expired-but-has-local-session
          let profile = sdk.getUserProfile();
          
          // If profile is null (token missing/invalid), try persisted profile
          if (!profile) {
            profile = await sdk.getPersistedProfile();
            console.log('[AuthStore] Using persisted profile for offline session');
          }
          
          if (profile) {
            this.user = profile;
            this.isAuthenticated = true;
            console.log('[AuthStore] Auth initialized (hasValidToken:', sdk.hasValidToken(), ')');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        this.error = 'Failed to initialize authentication';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Login with username/email and password
     */
    async login(credentials: LoginCredentials) {
      this.loading = true;
      this.error = null;

      try {
        await TranquaraSDK.getInstance().login(credentials);
        this.user = TranquaraSDK.getInstance().getUserProfile();
        this.isAuthenticated = true;

        // Sync user to backend database after successful login
        await this.syncUserToBackend();

        return true;
      } catch (error: any) {
        this.error = error.message || 'Login failed';
        this.isAuthenticated = false;
        this.user = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Register new user
     */
    async register(credentials: RegisterCredentials) {
      this.loading = true;
      this.error = null;

      try {
        await TranquaraSDK.getInstance().register(
          credentials.email,
          credentials.username,
          credentials.password
        );

        // After successful registration, automatically login
        await this.login({
          username: credentials.username,
          password: credentials.password,
        });

        return true;
      } catch (error: any) {
        this.error = error.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Logout user
     */
    async logout() {
      await TranquaraSDK.getInstance().logout();
      this.isAuthenticated = false;
      this.user = null;
      this.error = null;

      // Navigate to login page (auth layout will handle token clearing)
      if (process.client) {
        await navigateTo('/login', { replace: true });
      }
    },

    /**
     * Clear tokens without redirecting (for auth pages)
     */
    async clearTokensOnly() {
      await TranquaraSDK.getInstance().clearTokens();
      this.isAuthenticated = false;
      this.user = null;
      this.error = null;
    },

    /**
     * Sync user data to backend PostgreSQL database.
     * Uses TranquaraSDK (not direct fetch) and gracefully handles offline.
     * If offline, the sync will be retried on next login.
     */
    async syncUserToBackend() {
      try {
        const user = this.user;
        if (!user) return;

        await TranquaraSDK.getInstance().syncUserToBackend({
          email: user.email || '',
          username: user.preferred_username || '',
          oauth_provider: 'email',
        });

        console.log('[AuthStore] User synced to backend successfully');
      } catch (error) {
        // Gracefully handle offline / network errors — don't block login
        console.warn('[AuthStore] User sync to backend failed (will retry on next login):', error);
      }
    },

    /**
     * Get access token (refreshes if needed)
     */
    async getAccessToken(): Promise<string | null> {
      return await TranquaraSDK.getInstance().getAccessToken();
    },

    /**
     * Refresh tokens.
     * Does NOT logout on failure — user may just be offline.
     */
    async refreshToken() {
      try {
        const refreshed = await TranquaraSDK.getInstance().refreshAccessToken();
        if (refreshed) {
          this.user = TranquaraSDK.getInstance().getUserProfile();
          this.isAuthenticated = true;
        }
        // If refresh fails, DON'T logout — user can still work offline
        return refreshed;
      } catch (error) {
        console.error('Token refresh error (may be offline):', error);
        return false;
      }
    },
  },
});
