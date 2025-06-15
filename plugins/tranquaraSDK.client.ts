import UserService from "~/stores/auth/keycloak_service";
import TranquaraSDK from "~/stores/tranquara_sdk";
import { WebSocketClient } from "~/stores/websocket_client";
import { User } from "lucide-vue-next";

let keycloakInitialized = false;

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = nuxtApp.$config;
  const tranquaraSDK = TranquaraSDK.getInstance({
    base_url: config.public.baseURL,
    base_frontend_url: config.public.baseFrontendURL,
    websocket_url: config.public.websocketURL,
    client_id: config.public.clientId,
    access_token: "",
    current_username: "",
  });

  if (!keycloakInitialized) {
    keycloakInitialized = true;

    // Initialize Keycloak and ensure it's ready
    await UserService.initKeycloak(() => {
      // Once Keycloak is initialized, update the SDK with the token and username
      tranquaraSDK.config.access_token = UserService.getToken();
      tranquaraSDK.config.current_username = UserService.getTokenParsed()?.preferred_username;


    });
  }

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
