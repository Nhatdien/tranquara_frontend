/**
 * Jeep-SQLite Stencil Component Plugin
 * 
 * Loads the jeep-sqlite custom element for web platform
 * This must run before any other plugins that use SQLite
 */

import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { Capacitor } from '@capacitor/core';

export default defineNuxtPlugin(async () => {
  if (process.client) {
    // Define custom elements
    jeepSqlite(window);
    console.log('[Jeep-SQLite Plugin] Custom elements defined');

    // Create the DOM element manually if on web
    // Note: We do this here instead of in a Vue component to ensure it exists 
    // before the SQLiteService initialization runs in plugin 02.database
    if (Capacitor.getPlatform() === 'web') {
      const jeepEl = document.createElement('jeep-sqlite');
      document.body.appendChild(jeepEl);
      console.log('[Jeep-SQLite Plugin] DOM element injected');
    }
  }
});
