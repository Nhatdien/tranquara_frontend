import UserService from "~/stores/auth/keycloak_service";
import TranquaraSDK from "~/stores/tranquara_sdk";


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


    // Initialize Keycloak and ensure it's ready
   UserService.initKeycloak(async () => {
      // Once Keycloak is initialized, update the SDK with the token and username
      tranquaraSDK.config.access_token = UserService.getToken();
      tranquaraSDK.config.current_username = UserService.getTokenParsed()?.preferred_username;

      const refreshInterval = setInterval(async () => {
        let refreshed = false;
        try {
          UserService.updateToken((success: boolean) => {
            refreshed = success;
          }); // Refresh if token expires in 30 seconds
          if (refreshed) {
            tranquaraSDK.config.access_token = UserService.getToken();
            tranquaraSDK.config.current_username = UserService.getTokenParsed()?.preferred_username;
          }
        } catch (error) {
          console.error("Failed to refresh token:", error);
          clearInterval(refreshInterval); // Stop the interval if refreshing fails
          UserService.doLogin(); // Redirect to login if token refresh fails
        }
      }, 10000); // Check every 10 seconds
    });

  TranquaraSDK.getInstance().onError = (error) => {
    if (error.message.includes("Unauthorized")) {
      UserService.doLogin();
    }
  }



  return {
    provide: {
      keycloak: UserService,
      tranquaraSDK,
    },
  };
});
