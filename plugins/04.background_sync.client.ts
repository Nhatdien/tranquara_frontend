/**
 * Background Sync Plugin
 * 
 * Automatically triggers bi-directional sync on:
 * 1. App resume (when user returns to app)
 * 2. Network status changes (when going online)
 * 
 * This is a Nuxt client-side plugin
 */

import { App, AppState } from '@capacitor/app';
import { Network } from '@capacitor/network';
import NetworkMonitor from '~/services/sync/network_monitor';
import KeycloakService from '~/stores/auth/keycloak_service';
import { userJournalStore } from '~/stores/stores/user_journal';

export default defineNuxtPlugin(() => {
  console.log('[BackgroundSync] Plugin initializing...');

  // Track if app is in foreground
  let isAppActive = true;

  /**
   * Trigger full bi-directional sync if user is authenticated
   * Downloads from server + uploads pending local changes
   */
  const triggerSyncIfAuthenticated = async () => {
    try {
      const userId = KeycloakService.getUserUUid();
      if (!userId) {
        console.log('[BackgroundSync] User not authenticated - skipping sync');
        return;
      }

      if (!NetworkMonitor.isConnected()) {
        console.log('[BackgroundSync] Offline - skipping sync');
        return;
      }

      console.log('[BackgroundSync] Triggering bi-directional sync...');
      
      // Use the journal store's full bi-directional sync
      // This downloads from server AND uploads pending local changes
      const store = userJournalStore();
      if (store.isInitialized) {
        const result = await store.fullBiDirectionalSync();
        console.log('[BackgroundSync] Sync complete:', result);
      } else {
        console.log('[BackgroundSync] Store not initialized - skipping sync');
      }
    } catch (error) {
      console.error('[BackgroundSync] Sync error:', error);
    }
  };

  /**
   * Listen for app state changes (resume/background)
   */
  App.addListener('appStateChange', async (state: AppState) => {
    console.log('[BackgroundSync] App state changed:', state.isActive ? 'active' : 'background');

    if (state.isActive && !isAppActive) {
      // App resumed from background
      console.log('[BackgroundSync] App resumed - checking for pending sync');
      isAppActive = true;

      // Wait a bit for app to stabilize
      setTimeout(() => {
        triggerSyncIfAuthenticated();
      }, 1000);
    } else if (!state.isActive) {
      isAppActive = false;
    }
  });

  /**
   * Listen for network status changes
   */
  Network.addListener('networkStatusChange', (status) => {
    console.log('[BackgroundSync] Network status changed:', status.connected ? 'online' : 'offline');

    if (status.connected && isAppActive) {
      // Just came online and app is active
      console.log('[BackgroundSync] Network restored - triggering sync');
      
      // Wait a bit for network to stabilize
      setTimeout(() => {
        triggerSyncIfAuthenticated();
      }, 2000);
    }
  });

  /**
   * Listen for app URL open events (deep links)
   * This can be used to trigger sync when app is opened via deep link
   */
  App.addListener('appUrlOpen', async (data) => {
    console.log('[BackgroundSync] App opened via URL:', data.url);
    
    // Trigger sync after a delay to let the app initialize
    setTimeout(() => {
      triggerSyncIfAuthenticated();
    }, 1500);
  });

  /**
   * Listen for app restoration (iOS specific)
   * Triggered when app is restored after being terminated
   */
  App.addListener('appRestoredResult', async (data) => {
    console.log('[BackgroundSync] App restored:', data);
    
    // Trigger sync after restoration
    setTimeout(() => {
      triggerSyncIfAuthenticated();
    }, 1000);
  });

  console.log('[BackgroundSync] Plugin initialized successfully');

  // Return cleanup function for plugin teardown
  return {
    provide: {
      backgroundSync: {
        /**
         * Manually trigger background sync
         */
        trigger: triggerSyncIfAuthenticated,
        
        /**
         * Check if sync listeners are active
         */
        isActive: () => isAppActive,
      },
    },
  };
});
