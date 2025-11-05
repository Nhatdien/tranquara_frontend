import TranquaraSDK from "~/stores/tranquara_sdk";
import { useAuthStore } from "~/stores/stores/auth";


export default defineNuxtPlugin((nuxtApp) => {
  const config = nuxtApp.$config;
  const tranquaraSDK = TranquaraSDK.getInstance({
    base_url: config.public.baseURL,
    base_frontend_url: config.public.baseFrontendURL,
    websocket_url: config.public.websocketURL,
    client_id: config.public.clientId,
    access_token: "",
    current_username: "",
  });

  const authStore = useAuthStore();
  // Initialize Keycloak and ensure it's ready
  authStore.initKeycloak().then(() => {
    if (authStore.isAuthenticated && authStore.token) {
      tranquaraSDK.config.access_token = authStore.token;
      tranquaraSDK.config.current_username = authStore.user?.preferred_username || "";
      console.log("TranquaraSDK configured with user:", tranquaraSDK.config.current_username);

    }
    else {
      TranquaraSDK.getInstance().onError = (error) => {
        if (error.message.includes("Unauthorized")) {
          // authStore.login();
        }
      }
    }
  });


  return {
    provide: {
      authStore,
      tranquaraSDK,
    },
  };
});
