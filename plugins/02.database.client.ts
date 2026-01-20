/**
 * Database Initialization Plugin
 * 
 * Initializes SQLite database after authentication is ready.
 * This plugin runs after 01.auth.client.ts to ensure tokens are available.
 * 
 * Plugin Order:
 * 1. 01.auth.client.ts - Initialize Keycloak and load tokens
 * 2. 02.database.client.ts - Initialize SQLite database (this file)
 * 3. 03.tranquaraSDK.client.ts - Configure SDK with tokens
 * 4. 04.background_sync.client.ts - Set up sync listeners
 */

import { useAuthStore } from '~/stores/stores/auth_store';
import { userJournalStore } from '~/stores/stores/user_journal';

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();
  const journalStore = userJournalStore();

  // Only initialize database if user is authenticated AND has valid tokens
  if (authStore.isAuthenticated && authStore.getUserUUID) {
    try {
      console.log('[Database Plugin] Initializing SQLite database...');
      await journalStore.initializeDatabase();
      console.log('[Database Plugin] Database initialized successfully');
      
      // Now that database is ready, sync user to backend
      await authStore.syncUserToBackend();
    } catch (error) {
      console.error('[Database Plugin] Failed to initialize database:', error);
      // Don't throw - allow app to continue, pages can handle missing data gracefully
    }
  } else {
    console.log('[Database Plugin] User not authenticated or tokens not ready, skipping database initialization');
  }

  // Watch for login/logout events to initialize/cleanup database
  watch(
    () => authStore.isAuthenticated,
    async (isAuthenticated) => {
      if (isAuthenticated && !journalStore.isInitialized) {
        try {
          console.log('[Database Plugin] User logged in, initializing database...');
          await journalStore.initializeDatabase();
        } catch (error) {
          console.error('[Database Plugin] Error initializing database after login:', error);
        }
      } else if (!isAuthenticated && journalStore.isInitialized) {
        // Optionally cleanup database on logout
        console.log('[Database Plugin] User logged out, database cleanup if needed');
        // You could add cleanup logic here if needed
      }
    }
  );
});
