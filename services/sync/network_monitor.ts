/**
 * Network Monitor Service
 * 
 * Monitors online/offline status and notifies listeners
 * Uses Capacitor Network API for cross-platform compatibility
 */

import { Network, ConnectionStatus } from '@capacitor/network';

export type NetworkStatusCallback = (isOnline: boolean) => void;

export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private isOnline = true;
  private listeners: Set<NetworkStatusCallback> = new Set();
  private isInitialized = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  /**
   * Initialize network monitoring
   * Call once at app startup
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[NetworkMonitor] Already initialized');
      return;
    }

    try {
      // Get initial network status
      const status = await Network.getStatus();
      this.isOnline = status.connected;
      console.log('[NetworkMonitor] Initial status:', this.isOnline ? 'online' : 'offline');

      // Listen for network changes
      Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
        const wasOnline = this.isOnline;
        this.isOnline = status.connected;

        console.log('[NetworkMonitor] Status changed:', this.isOnline ? 'online' : 'offline');

        // Notify listeners only if status changed
        if (wasOnline !== this.isOnline) {
          this.notifyListeners();
        }
      });

      this.isInitialized = true;
      console.log('[NetworkMonitor] Initialized successfully');
    } catch (error) {
      console.error('[NetworkMonitor] Initialization error:', error);
      // Fallback to online if network API fails
      this.isOnline = true;
    }
  }

  /**
   * Get current online status
   */
  public getStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Check if currently online
   */
  public isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Subscribe to network status changes
   * Returns unsubscribe function
   */
  public subscribe(callback: NetworkStatusCallback): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current status
    callback(this.isOnline);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Unsubscribe all listeners (for cleanup)
   */
  public unsubscribeAll(): void {
    this.listeners.clear();
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.isOnline);
      } catch (error) {
        console.error('[NetworkMonitor] Error in listener callback:', error);
      }
    });
  }

  /**
   * Manually refresh network status
   * Useful for polling or manual checks
   */
  public async refresh(): Promise<boolean> {
    try {
      const status = await Network.getStatus();
      const wasOnline = this.isOnline;
      this.isOnline = status.connected;

      if (wasOnline !== this.isOnline) {
        this.notifyListeners();
      }

      return this.isOnline;
    } catch (error) {
      console.error('[NetworkMonitor] Error refreshing status:', error);
      return this.isOnline; // Return cached status
    }
  }
}

// Export singleton instance
export default NetworkMonitor.getInstance();
