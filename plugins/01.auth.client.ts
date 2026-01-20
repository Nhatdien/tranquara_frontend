/**
 * Authentication Plugin
 * 
 * Initializes authentication state when the app starts
 * Sets up automatic token refresh based on token expiry time
 */

import { useAuthStore } from '~/stores/stores/auth_store';

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();
  const route = useRoute();

  // Don't initialize auth on login/register pages (they clear tokens on mount)
  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.some(page => route.path.startsWith(page));

  if (!isAuthPage) {
    // Initialize auth state from stored tokens
    await authStore.initialize();
  }

  // Set up smart token refresh
  // Refresh when token is about to expire (30 seconds before expiry)
  if (import.meta.client) {
    setInterval(async () => {
      if (authStore.isAuthenticated) {
        // This will auto-refresh if token is expired or about to expire
        await authStore.getAccessToken();
      }
    }, 60 * 1000); // Check every 1 minute (much less frequent than before)
  }

  console.log('Authentication initialized:', authStore.isAuthenticated);
});
