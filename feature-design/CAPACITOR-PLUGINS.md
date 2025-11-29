# Capacitor Plugins Installation Guide

## Required Plugins for Authentication & Storage

This document tracks the Capacitor plugins needed for the User Registration & Authentication feature.

---

## 📦 Plugins to Install

### 1. @capacitor/preferences
**Purpose:** Simple key-value storage for settings and cached data  
**Use Cases:**
- User session data
- App settings (theme, language)
- Cached user profile
- Onboarding status flags

**Installation:**
```bash
cd tranquara_frontend
yarn add @capacitor/preferences
npx cap sync
```

### 2. @capacitor-community/secure-storage
**Purpose:** Encrypted storage for sensitive data (tokens, keys)  
**Use Cases:**
- Keycloak access tokens
- Keycloak refresh tokens
- Encryption keys
- PIN hash (for app lock)

**Installation:**
```bash
yarn add @capacitor-community/secure-storage
npx cap sync
```

**Platform Support:**
- iOS: Uses Keychain
- Android: Uses Keystore
- Web: Uses localStorage (less secure fallback)

### 3. @capacitor-community/sqlite
**Purpose:** Local SQLite database for heavy data  
**Use Cases:**
- Journal entries (offline-first)
- Lesson content (offline bundles)
- AI chat logs
- Sync queue

**Installation:**
```bash
yarn add @capacitor-community/sqlite
npx cap sync
```

**Platform Support:**
- iOS: Native SQLite
- Android: Native SQLite
- Web: SQL.js (WebAssembly)

---

## 🚀 Quick Install (All at Once)

```bash
cd tranquara_frontend

# Install all Capacitor storage plugins
yarn add @capacitor/preferences @capacitor-community/secure-storage @capacitor-community/sqlite

# Sync with native projects
npx cap sync
```

---

## ✅ Verification

After installation, verify in `package.json`:

```json
{
  "dependencies": {
    "@capacitor/preferences": "^6.0.0",
    "@capacitor-community/secure-storage": "^6.0.0",
    "@capacitor-community/sqlite": "^6.0.0"
  }
}
```

---

## 📱 Platform-Specific Setup

### Android

No additional setup required. Plugins work out of the box.

### iOS

For SQLite encryption (optional), you may need to add:

**ios/App/Podfile:**
```ruby
pod 'SQLCipher', '~> 4.5'
```

Then run:
```bash
cd ios/App
pod install
```

### Web

SQL.js will be automatically downloaded when using SQLite plugin on web.

---

## 🔧 Usage Examples

### Capacitor Preferences

```typescript
import { Preferences } from '@capacitor/preferences';

// Set value
await Preferences.set({ key: 'user_session', value: JSON.stringify(session) });

// Get value
const { value } = await Preferences.get({ key: 'user_session' });
const session = JSON.parse(value || '{}');

// Remove value
await Preferences.remove({ key: 'user_session' });

// Clear all
await Preferences.clear();
```

### Capacitor Secure Storage

```typescript
import SecureStoragePlugin from '@capacitor-community/secure-storage';

// Set token
await SecureStoragePlugin.set({ key: 'access_token', value: token });

// Get token
const { value } = await SecureStoragePlugin.get({ key: 'access_token' });

// Remove token
await SecureStoragePlugin.remove({ key: 'access_token' });

// Clear all
await SecureStoragePlugin.clear();
```

### Capacitor SQLite

```typescript
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);

// Create database
const db = await sqlite.createConnection('tranquara_db', false, 'no-encryption', 1);
await db.open();

// Execute query
await db.execute(`
  CREATE TABLE IF NOT EXISTS journals (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert data
await db.run('INSERT INTO journals (id, title, content) VALUES (?, ?, ?)', [id, title, content]);

// Query data
const result = await db.query('SELECT * FROM journals ORDER BY created_at DESC');
console.log(result.values);

// Close database
await db.close();
```

---

## 🐛 Troubleshooting

### Error: "Plugin not registered"

**Solution:** Run `npx cap sync` after installing plugins

```bash
npx cap sync
```

### Error: "Module not found" on Web

**Solution:** Ensure plugins are properly imported in your code

```typescript
// Correct import
import { Preferences } from '@capacitor/preferences';

// NOT this
import Preferences from '@capacitor/preferences';
```

### Android Build Fails

**Solution:** Sync Gradle files

```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### iOS Build Fails

**Solution:** Update Pods

```bash
cd ios/App
pod install --repo-update
cd ../..
npx cap sync ios
```

---

## 📚 Documentation Links

- [Capacitor Preferences](https://capacitorjs.com/docs/apis/preferences)
- [Secure Storage Plugin](https://github.com/capacitor-community/secure-storage)
- [SQLite Plugin](https://github.com/capacitor-community/sqlite)

---

## ✅ Installation Status

- [ ] @capacitor/preferences
- [ ] @capacitor-community/secure-storage
- [ ] @capacitor-community/sqlite
- [ ] npx cap sync (Android)
- [ ] npx cap sync (iOS)

**Last Updated:** _[To be filled after installation]_
