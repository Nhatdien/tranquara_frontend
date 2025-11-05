// /stores/auth.ts
import { defineStore } from 'pinia';
import Keycloak, { KeycloakTokenParsed } from 'keycloak-js';
import { Capacitor } from '@capacitor/core';

export const useAuthStore = defineStore('auth', () => {
    const config = useRuntimeConfig();
    const isAuthenticated = ref(false);
    const token = ref<string>();
    const refreshToken = ref<string>();
    const user = ref<any>(null);
    const keycloak = ref<Keycloak | null>(null);

    const initKeycloak = async () => {
        keycloak.value = new Keycloak({
            url: config.public.keycloakUrl,
            realm: config.public.keycloakRealm,
            clientId: config.public.keycloakClientId,
        });

        try {
            await keycloak.value.init({
                onLoad: 'check-sso', // Changed from 'login-required'
                pkceMethod: 'S256',
                checkLoginIframe: false, // Disable iframe checks
                // Removed silentCheckSsoRedirectUri
            });

            if (keycloak.value.authenticated) {
                setSession(keycloak.value);
                console.log('✅ Authenticated on init');
            } else {
                console.log('❌ Not authenticated');
            }

            // Setup token refresh
            keycloak.value.onTokenExpired = async () => {
                console.log('🔄 Token expired, refreshing...');
                try {
                    const refreshed = await keycloak.value?.updateToken(5);
                    if (refreshed) {
                        console.log('✅ Token refreshed');
                        token.value = keycloak.value?.token;
                        refreshToken.value = keycloak.value?.refreshToken;
                    }
                } catch (error) {
                    console.error('❌ Token refresh failed:', error);
                    clearSession();
                }
            };

            // Auto refresh token before it expires
            setInterval(async () => {
                if (keycloak.value?.authenticated) {
                    try {
                        const refreshed = await keycloak.value.updateToken(60);
                        if (refreshed) {
                            token.value = keycloak.value.token;
                            refreshToken.value = keycloak.value.refreshToken;
                            console.log('🔄 Token auto-refreshed');
                        }
                    } catch (error) {
                        console.error('❌ Token auto-refresh failed:', error);
                        clearSession();
                    }
                }
            }, 30000);
        } catch (error) {
            console.error('❌ Keycloak initialization failed:', error);
        }
    };

    const login = async () => {
        const isNative = Capacitor.isNativePlatform();
        await keycloak.value?.login({
            redirectUri: isNative
                ? 'tranquara://callback'
                : window.location.origin,
        });
    };

    const logout = async () => {
        await keycloak.value?.logout({ redirectUri: window.location.origin });
        clearSession();
    };

    const setSession = (kc: Keycloak) => {
        isAuthenticated.value = true;
        token.value = kc.token;
        refreshToken.value = kc.refreshToken;
        user.value = kc.tokenParsed;
        console.log('✅ Logged in as', user.value?.preferred_username);
    };

    const clearSession = () => {
        isAuthenticated.value = false;
        token.value = '';
        refreshToken.value = '';
        user.value = null;
    };

    return {
        isAuthenticated,
        token,
        refreshToken,
        user,
        keycloak,
        initKeycloak,
        login,
        logout,
    };
});