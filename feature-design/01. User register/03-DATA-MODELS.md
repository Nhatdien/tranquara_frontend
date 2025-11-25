# 🗄️ User Authentication - Data Models

## Overview

Tranquara uses a **hybrid authentication approach** similar to Day One journal:

- **Authentication**: Online via Keycloak (email/password + social login)
- **Data Access**: Fully offline with local caching and encryption
- **Sync**: Automatic background sync when online

This document covers **both server-side (PostgreSQL) and client-side (Capacitor Storage) data models** for the offline-first authentication system.

Users authenticate once online, then the app works completely offline with cached credentials, local journals, and settings.

---

## 🏗️ Architecture: Online Auth + Offline Data

**Key Principle**: Authentication requires internet, but **app usage does not**.

### How It Works (Day One Style)

**First Time / Re-authentication (Requires Internet)**:

1. User logs in via Keycloak
2. Keycloak returns access/refresh tokens
3. App downloads user data from API
4. Encrypt & cache locally (Capacitor)
5. Store encryption key in secure storage (biometric-protected)

**Subsequent Use (Fully Offline)**:

1. User opens app
2. App Lock prompt (optional)
3. Decrypt local data
4. Full read/write access
5. Changes queue for sync when online

---

## 📱 Client-Side: Capacitor Storage

### Storage Strategy

Tranquara uses **Capacitor Preferences** and **Capacitor Secure Storage** for offline data:

| Storage Type | Use Case | Encryption |
|--------------|----------|------------|
| **Secure Storage** | Keycloak tokens, encryption keys, app lock PIN | ✅ OS-level (Keychain/Keystore) |
| **Preferences** | User session, settings, small cached data (< 1KB) | ✅ App-level (AES-256) |
| **SQLite** | Journal entries, lessons, chat logs (heavy data) | ✅ Optional SQLite encryption |
| **Filesystem** | Large files (journal exports, images) | ✅ App-level (AES-256) |

---

### 1. Secure Storage (Capacitor SecureStorage)

**Purpose**: Store sensitive credentials that unlock local data

**Storage Keys** (@capacitor/secure-storage):

_[Code implementation removed - to be added during development]_

---

### 2. Preferences Storage (Capacitor Preferences)

**Purpose**: Store user session and cached data (encrypted with local key)

**Storage Keys** (@capacitor/preferences):

**Session**:
- `user_session` - Contains: user_id, keycloak_id, email, username, last_sync, is_authenticated

**Cached Data (Encrypted JSON)**:
- `user_profile` - Encrypted user_informations
- `user_settings` - Encrypted settings
- `user_streaks` - Encrypted streak data

> **Note**: Journal entries are NOT stored in Capacitor Preferences. They use SQLite (`@capacitor-community/sqlite`) due to high data volume and complex queries. See [Journal Feature Data Models](../02.%20Jounral%20Feature/03-DATA-MODELS.md).

**Sync Queue**:
- `sync_queue` - Array of pending changes

**Queue Item Structure**:
- `entity_type` - 'journal', 'setting', 'streak', 'profile'
- `operation` - 'CREATE', 'UPDATE', 'DELETE'
- `entity_id` - Server ID or temp ID
- `payload` - Encrypted data
- `retry_count` - Number
- `synced` - Boolean

---

## 📊 Server-Side: PostgreSQL Schema

### `user_informations` Table

**Purpose**: Store user profile and settings (primary source of truth)

_[SQL code implementation removed - to be added during development]_

**Indexes**:
- `idx_user_keycloak_id` on `keycloak_id`
- `idx_user_email` on `email` (unique)
- `idx_user_oauth_provider` on `oauth_provider`

**Example Row** (After Onboarding):

_[JSON code implementation removed - to be added during development]_

---

### Token Management

**Access Token**:
- Lifespan: 15 minutes
- Storage: Capacitor SecureStorage (mobile/web)
- Usage: Authorization header for API calls

**Refresh Token**:
- Lifespan: 30 days
- Storage: Capacitor SecureStorage (mobile) / HttpOnly cookie (web)
- Usage: Obtain new access token via `/auth/refresh`

**Token Rotation**:
- Access token refreshed automatically when expired
- Refresh token rotated on each use (security best practice)
- If refresh token expires → User must re-authenticate

---

## 🔐 Encryption Strategy

### Client-Side Encryption (AES-256)

**Purpose**: Encrypt all locally stored user data

**Encryption Key Generation**:
1. Generate random 256-bit key on first login
2. Store in Capacitor SecureStorage (OS-level encryption)
3. Use this key to encrypt all Preferences data

**What Gets Encrypted**:
- User profile data
- Journal entries
- Settings
- Streak data
- Sync queue

**Encryption Flow**:

_[Code implementation removed - to be added during development]_
- Settings
- Streak data
- Sync queue

**Encryption Flow**:

_[Code implementation removed - to be added during development]_

---

## 🔄 Data Sync Flow

### Initial Sync (After Login)

**Flow**:

1. App authenticates with Keycloak (email/password or OAuth)
2. Keycloak returns access_token, refresh_token, id_token
3. App stores tokens in Capacitor SecureStorage
4. App calls backend API: `GET /api/users/me` (with Bearer token)
5. Backend returns user profile, journals, settings
6. App generates local encryption key
7. App encrypts user data (AES-256)
8. App stores encrypted data in Capacitor Preferences
9. App stores encryption key in Capacitor SecureStorage
10. App now works fully offline

---

### Background Sync (When Online)

**Trigger**: Every 5 minutes or on app resume

**Sync Process**:

1. Check network connectivity
2. If online:
   - Get sync_queue from Capacitor Preferences
   - For each pending change: POST/PUT/DELETE to API
   - Mark successful syncs in queue
   - Call `GET /api/sync/latest?since={last_sync}` for new data
   - Encrypt new data
   - Update local cache in Capacitor Preferences
   - Update last_sync timestamp
3. If offline:
   - Skip sync, continue offline

---

### Conflict Resolution

**Strategy**: Last Write Wins (with user prompt for important changes)

**Journal Conflicts**:
- Always keep both versions (never lose journal entries)
- Merge local and server versions

**Setting Conflicts**:
- Prompt user to choose version

**Default**:
- Server wins

---

## 📱 Platform-Specific Storage

### iOS (Keychain)

---

## 📚 Related Documentation

- **[01-LOGIN-FLOW.md](./01-LOGIN-FLOW.md)** - Keycloak authentication flows
- **[02-ONBOARDING-FLOW.md](./02-ONBOARDING-FLOW.md)** - KYC question flow
- **[User Settings](../06.%20User%20profile%20and%20Settings/)** - Profile management

---

**Last Updated**: November 25, 2025

**Storage via** Capacitor SecureStorage (backed by iOS Keychain)

**Security Features**:
- Hardware-encrypted (Secure Enclave on modern devices)
- Biometric-protected access (Face ID / Touch ID)
- Data survives app uninstall (configurable)
- Never backed up to iCloud (kSecAttrAccessibleWhenUnlockedThisDeviceOnly)

**Stored Items**:
- `keycloak_access_token`
- `keycloak_refresh_token`
- `encryption_key` (256-bit AES key for local data)
- `app_lock_pin` (hashed with bcrypt)

---

### Android (Keystore)

**Storage via** Capacitor SecureStorage (backed by Android Keystore)

**Security Features**:
- Hardware-backed encryption (if available)
- Data tied to app signing key
- Cannot be extracted without device unlock
- Survives app uninstall/reinstall (optional)

**Stored Items**: Same as iOS

---

### Web (Browser Storage)

**Secure Storage**: Not available (uses sessionStorage as fallback)

**Session Management**:
- Access token: `sessionStorage` (cleared on tab close)
- Refresh token: HttpOnly cookie (XSS-immune)
- Local data: IndexedDB (encrypted with key from sessionStorage)

---

## 📊 Storage Size Estimates

| Data Type | Size Per User | Storage Location |
|-----------|---------------|------------------|
| User Profile | ~2 KB | Preferences (encrypted) |
| Tokens | ~5 KB | SecureStorage |
| Settings | ~1 KB | Preferences (encrypted) |
| Journals (100 entries) | ~500 KB | SQLite (via @capacitor-community/sqlite) |
| Sync Queue | ~50 KB | Preferences |
| **Total (Capacitor)** | **~60 KB** | Capacitor Preferences + SecureStorage |
| **Total (SQLite)** | **~500 KB** | SQLite database |

**Platform Limits**:
- iOS Keychain: No practical limit for our use case
- Android Keystore: No practical limit
- Capacitor Preferences: ~10MB recommended (varies by platform)

---

## 🔐 Security Checklist

### Data Protection

- ✅ All tokens stored in OS-level secure storage
- ✅ Local data encrypted with AES-256
- ✅ Encryption key in biometric-protected Keychain
- ✅ No plaintext sensitive data in logs
- ✅ Automatic token rotation (refresh token)

### On Logout

- ✅ Delete all Capacitor SecureStorage keys
- ✅ Delete all Capacitor Preferences
- ✅ User must re-authenticate to download data again

### iOS-Specific

- ✅ Keychain items use `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`
- ✅ Database encrypted with device key (stored in Keychain)
- ✅ Biometric unlock required before decryption
- ✅ Tokens stored in Capacitor SecureStorage (Keychain)
- ✅ No passwords ever stored

### Web (IndexedDB)

- ✅ Access token in sessionStorage (cleared on tab close)
- ✅ Refresh token in httpOnly cookie (XSS immune)
- ✅ IndexedDB encrypted at OS level (Chrome, Safari)
- ✅ Service Worker caches only public assets

---

## ⏱️ Token Lifespans

- **Access Token**: 15 minutes (in-memory + SecureStorage backup)
- **Refresh Token**: 30 days (SecureStorage only)
- **Auto-Refresh**: Nuxt Auth middleware handles automatically
- **Offline Grace**: App works indefinitely offline with cached data

---

## 📚 Related Documentation

- **[01-LOGIN-FLOW.md](./01-LOGIN-FLOW.md)** - Keycloak authentication flows
- **[02-ONBOARDING-FLOW.md](./02-ONBOARDING-FLOW.md)** - KYC question flow
- **[User Settings](../06.%20User%20profile%20and%20Settings/)** - Profile management

---

**Last Updated**: November 25, 2025
