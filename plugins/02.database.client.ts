/**
 * Database Initialization Plugin
 * 
 * Initializes SQLite database after authentication is ready.
 * Works with offline sessions — database initializes even when tokens are expired,
 * as long as the user has a persisted local session (logged in before).
 * 
 * Plugin Order:
 * 1. 01.auth.client.ts - Initialize auth state (tokens or persisted session)
 * 2. 02.database.client.ts - Initialize SQLite database (this file)
 * 3. 03.tranquaraSDK.client.ts - Configure SDK with tokens
 * 4. 04.background_sync.client.ts - Set up sync listeners
 */

import { useAuthStore } from '~/stores/stores/auth_store';
import { userJournalStore } from '~/stores/stores/user_journal';
import NetworkMonitor from '~/services/sync/network_monitor';

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();
  const journalStore = userJournalStore();

  // Initialize database if user has a session (valid token OR persisted offline session)
  if (authStore.isAuthenticated && authStore.getUserUUID) {
    try {
      console.log('[Database Plugin] Initializing SQLite database...');
      await journalStore.initializeDatabase();
      console.log('[Database Plugin] Database initialized successfully');
      
      // Only sync user to backend if online (don't block offline startup)
      if (NetworkMonitor.isConnected()) {
        authStore.syncUserToBackend().catch((err) => {
          console.warn('[Database Plugin] Backend sync failed (non-blocking):', err);
        });
      }
    } catch (error) {
      console.error('[Database Plugin] Failed to initialize database:', error);
      // Don't throw - allow app to continue, pages can handle missing data gracefully
    }
  } else {
    console.log('[Database Plugin] User not authenticated, skipping database initialization');
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
        // Cleanup database on logout
        console.log('[Database Plugin] User logged out, database cleanup if needed');
      }
    }
  );
});
