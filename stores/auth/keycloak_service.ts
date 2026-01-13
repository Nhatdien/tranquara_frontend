import Keycloak from "keycloak-js";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

// SecureStorage keys for token persistence
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'keycloak_access_token',
  REFRESH_TOKEN: 'keycloak_refresh_token',
  ID_TOKEN: 'keycloak_id_token',
  TOKEN_EXPIRY: 'keycloak_token_expiry',
  REFRESH_TOKEN_EXPIRY: 'keycloak_refresh_token_expiry',
};

class KeycloakService {
  private static instance: KeycloakService;
  private static _kc: Keycloak.KeycloakInstance;
  private static _initialized: boolean = false;
  private static _initPromise: Promise<void> | null = null;
  private static _silentRefreshInterval: number | null = null;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): KeycloakService {
    if (!KeycloakService.instance) {
      KeycloakService.instance = new KeycloakService();
      KeycloakService._kc = new Keycloak({
        realm: "tranquara_auth",
        clientId: "tranquara_auth_client",
        url: "http://localhost:4200",
      });
    }
    return KeycloakService.instance;
  }

  public async initKeycloak(onAuthenticatedCallback: Function): Promise<void> {
    console.log(
      "KeycloakService.initKeycloak() called",
      KeycloakService._initialized
    );
    if (KeycloakService._initialized) {
      onAuthenticatedCallback();
      return;
    }

    // Try to load tokens from storage first (for offline or app restart)
    const tokensLoaded = await this.loadTokensFromStorage();
    if (tokensLoaded) {
      console.log('[Keycloak] Authenticated from stored tokens');
      this.startSilentRefresh();
      onAuthenticatedCallback();
      return;
    }

    if (!KeycloakService._initPromise) {
      KeycloakService._initPromise = KeycloakService._kc
        .init({
          flow: "standard",
          onLoad: "login-required",
          enableLogging: true,
          scope: "openid email",
          pkceMethod: "S256",
        })
        .then(async (authenticated) => {
          if (!authenticated) {
            console.log("User is not authenticated!");
          } else {
            // Store tokens after successful authentication
            await this.storeTokensSecurely();
            this.startSilentRefresh();
          }
          KeycloakService._initialized = true;
          onAuthenticatedCallback();
        })
        .catch((error) => {
          console.error(error);
          KeycloakService._initPromise = null; // Reset the promise if initialization fails
        });
    } else {
      KeycloakService._initPromise.then(() => {
        onAuthenticatedCallback();
      });
    }
  }

  public doLogin(): void {
    KeycloakService._kc.login();
  }

  public doLogout(): void {
    KeycloakService._kc.logout();
  }

  public getToken(): string | undefined {
    return KeycloakService._kc.token;
  }

  public getTokenParsed(): Keycloak.KeycloakTokenParsed | undefined {
    return KeycloakService._kc.tokenParsed;
  }

  public getUserUUid(): string | undefined {
    return this.getTokenParsed()?.sub
  }

  public refreshToken(): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      KeycloakService._kc
        .updateToken(5)
        .then(async () => {
          await this.storeTokensSecurely();
          resolve(KeycloakService._kc.token);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public updateToken(successCallback: any): void {
    KeycloakService._kc
      .updateToken(30)
      .then(successCallback)
      .catch(this.doLogin);
  }

  public getUsername(): string | undefined {
    return KeycloakService._kc.tokenParsed?.preferred_username;
  }

  public hasRole(roles: any): boolean {
    return roles.some((role: any) => KeycloakService._kc.hasRealmRole(role));
  }

  /**
   * Check if access token is expired or about to expire (within 60 seconds)
   */
  public isTokenExpired(minValidity: number = 60): boolean {
    if (!KeycloakService._kc.token) {
      return true;
    }
    return KeycloakService._kc.isTokenExpired(minValidity);
  }

  /**
   * Check if refresh token is expired
   * Uses stored expiry time from SecureStorage
   */
  public async isRefreshTokenExpired(): Promise<boolean> {
    try {
      const expiryStr = await SecureStoragePlugin.get({ key: STORAGE_KEYS.REFRESH_TOKEN_EXPIRY });
      if (!expiryStr.value) {
        return true;
      }

      const expiry = parseInt(expiryStr.value, 10);
      const now = Math.floor(Date.now() / 1000);
      
      // Consider expired if within 1 day of expiry (buffer time)
      return expiry - now < 86400; // 24 hours
    } catch (error) {
      console.error('[Keycloak] Error checking refresh token expiry:', error);
      return true;
    }
  }

  /**
   * Silent token refresh
   * Attempts to refresh token without user interaction
   */
  public async silentRefresh(): Promise<boolean> {
    try {
      // Check if refresh token is expired
      const refreshExpired = await this.isRefreshTokenExpired();
      if (refreshExpired) {
        console.log('[Keycloak] Refresh token expired - login required');
        return false;
      }

      // Attempt token refresh (force refresh with minValidity = -1)
      const refreshed = await KeycloakService._kc.updateToken(-1);
      
      if (refreshed) {
        console.log('[Keycloak] Token silently refreshed');
        await this.storeTokensSecurely();
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Keycloak] Silent refresh failed:', error);
      return false;
    }
  }

  /**
   * Store tokens securely in device keychain/keystore
   * Called after successful login or token refresh
   */
  public async storeTokensSecurely(): Promise<void> {
    try {
      if (!KeycloakService._kc.token) {
        console.warn('[Keycloak] No token to store');
        return;
      }

      // Store access token
      await SecureStoragePlugin.set({
        key: STORAGE_KEYS.ACCESS_TOKEN,
        value: KeycloakService._kc.token,
      });

      // Store refresh token
      if (KeycloakService._kc.refreshToken) {
        await SecureStoragePlugin.set({
          key: STORAGE_KEYS.REFRESH_TOKEN,
          value: KeycloakService._kc.refreshToken,
        });

        // Calculate and store refresh token expiry
        if (KeycloakService._kc.refreshTokenParsed?.exp) {
          await SecureStoragePlugin.set({
            key: STORAGE_KEYS.REFRESH_TOKEN_EXPIRY,
            value: KeycloakService._kc.refreshTokenParsed.exp.toString(),
          });
        }
      }

      // Store ID token
      if (KeycloakService._kc.idToken) {
        await SecureStoragePlugin.set({
          key: STORAGE_KEYS.ID_TOKEN,
          value: KeycloakService._kc.idToken,
        });
      }

      // Store token expiry time
      if (KeycloakService._kc.tokenParsed?.exp) {
        await SecureStoragePlugin.set({
          key: STORAGE_KEYS.TOKEN_EXPIRY,
          value: KeycloakService._kc.tokenParsed.exp.toString(),
        });
      }

      console.log('[Keycloak] Tokens stored securely');
    } catch (error) {
      console.error('[Keycloak] Error storing tokens:', error);
    }
  }

  /**
   * Load tokens from secure storage
   * Used for offline auth or app restart
   */
  public async loadTokensFromStorage(): Promise<boolean> {
    try {
      const accessToken = await SecureStoragePlugin.get({ key: STORAGE_KEYS.ACCESS_TOKEN });
      const refreshToken = await SecureStoragePlugin.get({ key: STORAGE_KEYS.REFRESH_TOKEN });
      const idToken = await SecureStoragePlugin.get({ key: STORAGE_KEYS.ID_TOKEN });

      if (!accessToken.value || !refreshToken.value) {
        console.log('[Keycloak] No stored tokens found');
        return false;
      }

      // Manually set tokens in Keycloak instance
      KeycloakService._kc.token = accessToken.value;
      KeycloakService._kc.refreshToken = refreshToken.value;
      KeycloakService._kc.idToken = idToken.value;

      // Parse token to populate tokenParsed
      if (accessToken.value) {
        try {
          const payload = accessToken.value.split('.')[1];
          const decoded = JSON.parse(atob(payload));
          KeycloakService._kc.tokenParsed = decoded;
        } catch (error) {
          console.error('[Keycloak] Error parsing stored token:', error);
        }
      }

      // Try to refresh if token is expired
      if (this.isTokenExpired()) {
        console.log('[Keycloak] Stored token expired - attempting refresh');
        const refreshed = await this.silentRefresh();
        
        if (!refreshed) {
          await this.clearStoredTokens();
          return false;
        }
      }

      console.log('[Keycloak] Tokens loaded from storage');
      KeycloakService._initialized = true;
      return true;
    } catch (error) {
      console.error('[Keycloak] Error loading tokens:', error);
      return false;
    }
  }

  /**
   * Clear stored tokens from secure storage
   * Called on logout
   */
  public async clearStoredTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStoragePlugin.remove({ key: STORAGE_KEYS.ACCESS_TOKEN }),
        SecureStoragePlugin.remove({ key: STORAGE_KEYS.REFRESH_TOKEN }),
        SecureStoragePlugin.remove({ key: STORAGE_KEYS.ID_TOKEN }),
        SecureStoragePlugin.remove({ key: STORAGE_KEYS.TOKEN_EXPIRY }),
        SecureStoragePlugin.remove({ key: STORAGE_KEYS.REFRESH_TOKEN_EXPIRY }),
      ]);
      console.log('[Keycloak] Stored tokens cleared');
    } catch (error) {
      console.error('[Keycloak] Error clearing tokens:', error);
    }
  }

  /**
   * Start automatic silent refresh
   * Checks every 5 minutes if token needs refresh
   */
  public startSilentRefresh(): void {
    if (KeycloakService._silentRefreshInterval) {
      console.log('[Keycloak] Silent refresh already running');
      return;
    }

    // Check every 5 minutes
    KeycloakService._silentRefreshInterval = window.setInterval(async () => {
      if (this.isTokenExpired(300)) { // Refresh if expires within 5 minutes
        console.log('[Keycloak] Token expiring soon - refreshing');
        await this.silentRefresh();
      }
    }, 5 * 60 * 1000);

    console.log('[Keycloak] Silent refresh started');
  }

  /**
   * Stop automatic silent refresh
   */
  public stopSilentRefresh(): void {
    if (KeycloakService._silentRefreshInterval) {
      clearInterval(KeycloakService._silentRefreshInterval);
      KeycloakService._silentRefreshInterval = null;
      console.log('[Keycloak] Silent refresh stopped');
    }
  }

  /**
   * Enhanced logout with token cleanup
   */
  public async doEnhancedLogout(): Promise<void> {
    try {
      this.stopSilentRefresh();
      await this.clearStoredTokens();
      KeycloakService._kc.logout();
    } catch (error) {
      console.error('[Keycloak] Error during logout:', error);
      KeycloakService._kc.logout();
    }
  }
}

const keycloakServiceInstance = KeycloakService.getInstance();
export default keycloakServiceInstance;
