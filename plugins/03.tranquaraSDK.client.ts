import AuthService from "~/stores/auth/auth_service";
import { useAuthStore } from "~/stores/stores/auth_store";
import { userJournalStore } from "~/stores/stores/user_journal";
import { useUserStreakStore } from "~/stores/stores/user_streak";
import TranquaraSDK from "~/stores/tranquara_sdk";

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = nuxtApp.$config;
  console.log('[TranquaraSDK Plugin] Runtime Config baseURL:', config.public.baseURL);
  console.log('[TranquaraSDK Plugin] Full Runtime Config:', config.public);
  const authStore = useAuthStore();

  // Get initial locale from i18n
  const i18n = nuxtApp.$i18n as { locale: { value: string } };
  const initialLocale = i18n?.locale?.value || 'en';

  // Initialize the SDK
  const tranquaraSDK = TranquaraSDK.getInstance({
    base_url: config.public.baseURL,
    base_frontend_url: config.public.baseFrontendURL,
    websocket_url: config.public.websocketURL,
    client_id: config.public.clientId,
    access_token: "",
    current_username: "",
    locale: initialLocale,
  });

  // Don't initialize database on plugin load - wait for Keycloak to be ready
  // Database will be initialized by pages when they need it
  
  // Get initial token if user is authenticated
  if (authStore.isAuthenticated) {
    const token = await AuthService.getAccessToken();
    const user = AuthService.getUserProfile();
    
    if (token && user) {
      tranquaraSDK.config.access_token = token;
      tranquaraSDK.config.current_username = user.preferred_username || "";
      
      console.log('[Plugin] SDK configured for authenticated user');

      // Fetch streak data (works offline via local computation)
      const streakStore = useUserStreakStore();
      streakStore.fetchStreak().catch((err: any) => {
        console.warn('[Plugin] Failed to fetch streak on init:', err);
      });
    } else if (authStore.user) {
      // Token expired (offline) but we have a persisted session
      // SDK can work for local operations, server calls will fail gracefully
      tranquaraSDK.config.current_username = (authStore.user as any).preferred_username || "";
      console.log('[Plugin] SDK configured for offline session (no valid token)');

      // Streak can still be computed from local data
      const streakStore = useUserStreakStore();
      streakStore.fetchStreak().catch((err: any) => {
        console.warn('[Plugin] Failed to fetch streak on init:', err);
      });
    }
  }

  // Watch for auth state changes and update SDK token
  // This is more efficient than polling - updates happen reactively
  watch(
    () => authStore.isAuthenticated,
    async (isAuthenticated) => {
      if (isAuthenticated) {
        const token = await AuthService.getAccessToken();
        const user = AuthService.getUserProfile();
        
        if (token && user) {
          tranquaraSDK.config.access_token = token;
          tranquaraSDK.config.current_username = user.preferred_username || "";
          
          console.log('[Plugin] SDK configured after login');
          // Don't initialize database here - let pages do it when they need it

          // Fetch streak data after login
          const streakStore = useUserStreakStore();
          streakStore.fetchStreak().catch((err: any) => {
            console.warn('[Plugin] Failed to fetch streak after login:', err);
          });
        }
      } else {
        // Clear SDK token and local data when logged out
        tranquaraSDK.config.access_token = "";
        tranquaraSDK.config.current_username = "";
        
        // Reset streak state
        const streakStore = useUserStreakStore();
        streakStore.resetState();

        try {
          const journalStore = userJournalStore();
          await journalStore.clearLocalData();
          console.log('[Plugin] Local data cleared after logout');
        } catch (error) {
          console.error('[Plugin] Error clearing local data:', error);
        }
      }
    }
  );

  // Handle SDK errors (e.g., 401 Unauthorized)
  TranquaraSDK.getInstance().onError = (error) => {
    if (error.message.includes("Unauthorized")) {
      // Clear auth state and redirect to login
      authStore.logout();
    }
  };

  // Watch for locale changes and update SDK
  watch(
    () => i18n.locale.value,
    (newLocale) => {
      tranquaraSDK.config.locale = newLocale;
      console.log('[Plugin] SDK locale updated to:', newLocale);
    }
  );

  return {
    provide: {
      authService: AuthService,
      tranquaraSDK,
    },
  };
});
