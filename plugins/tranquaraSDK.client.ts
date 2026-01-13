import AuthService from "~/stores/auth/auth_service";
import { useAuthStore } from "~/stores/stores/auth_store";
import { userJournalStore } from "~/stores/stores/user_journal";
import TranquaraSDK from "~/stores/tranquara_sdk";

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = nuxtApp.$config;
  const authStore = useAuthStore();

  // Initialize the SDK
  const tranquaraSDK = TranquaraSDK.getInstance({
    base_url: config.public.baseURL,
    base_frontend_url: config.public.baseFrontendURL,
    websocket_url: config.public.websocketURL,
    client_id: config.public.clientId,
    access_token: "",
    current_username: "",
  });

  // Get initial token if user is authenticated
  if (authStore.isAuthenticated) {
    const token = await AuthService.getAccessToken();
    const user = AuthService.getUserProfile();
    
    if (token && user) {
      tranquaraSDK.config.access_token = token;
      tranquaraSDK.config.current_username = user.preferred_username || "";
      
      // Initialize database for authenticated user
      try {
        const journalStore = userJournalStore();
        await journalStore.initializeDatabase();
        console.log('[Plugin] Database initialized for authenticated user');
      } catch (error) {
        console.error('[Plugin] Error initializing database:', error);
      }
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
          
          // Initialize database when user logs in
          try {
            const journalStore = userJournalStore();
            await journalStore.initializeDatabase();
            console.log('[Plugin] Database initialized after login');
          } catch (error) {
            console.error('[Plugin] Error initializing database:', error);
          }
        }
      } else {
        // Clear SDK token and local data when logged out
        tranquaraSDK.config.access_token = "";
        tranquaraSDK.config.current_username = "";
        
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

  return {
    provide: {
      authService: AuthService,
      tranquaraSDK,
    },
  };
});
