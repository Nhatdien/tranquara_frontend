import AuthService from "~/stores/auth/auth_service";
import { useAuthStore } from "~/stores/stores/auth_store";
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
        }
      } else {
        // Clear SDK token when logged out
        tranquaraSDK.config.access_token = "";
        tranquaraSDK.config.current_username = "";
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
