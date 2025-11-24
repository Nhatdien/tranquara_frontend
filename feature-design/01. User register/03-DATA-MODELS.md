# 🗄️ User Authentication - Data Models# 🗄️ User Authentication - Data Models#  User Authentication - Data Models



## Overview



Tranquara uses a **hybrid authentication approach** similar to Day One journal:## Overview## Overview

- **Authentication**: Online via Keycloak (email/password + social login)

- **Data Access**: Fully offline with local caching and encryption

- **Sync**: Automatic background sync when online

Tranquara uses a **hybrid authentication approach** similar to Day One journal:This document covers **both server-side (PostgreSQL) and client-side (SQLite/IndexedDB) data models** for the offline-first authentication system. Mobile uses SQLite for local storage, web uses IndexedDB, and both sync to PostgreSQL when online.

Users authenticate once online, then the app works completely offline with cached credentials, local journals, and settings.

- **Authentication**: Online via Keycloak (email/password + social login)

---

- **Data Access**: Fully offline with local caching and encryption---

## 🏗️ Architecture: Online Auth + Offline Data

- **Sync**: Automatic background sync when online

### How It Works (Day One Style)

##  Mobile: Local SQLite Schema

**First Time / Re-authentication (Requires Internet)**:

1. User logs in via KeycloakUsers authenticate once online, then the app works completely offline with cached credentials, local journals, and settings.

2. Keycloak returns access/refresh tokens

3. App downloads user data from API### `local_session` Table

4. Encrypt & cache locally (Capacitor)

5. Store encryption key in secure storage (biometric-protected)---



**Subsequent Use (Fully Offline)**:**Purpose**: Store user session data for offline authentication

1. User opens app

2. App Lock prompt (optional)## 🏗️ Architecture: Online Auth + Offline Data

3. Decrypt local data

4. Full read/write access_[SQL code implementation removed - to be added during development]_

- `last_login` TIMESTAMP

- `is_active` BOOLEAN DEFAULT TRUE│  5. Store encryption key in secure      │



**Indexes**:│     storage (biometric-protected)       │**Example Row**:

- `idx_user_keycloak_id` on `keycloak_id`

- `idx_user_email` on `email` (unique)└─────────────────────────────────────────┘_[JSON code implementation removed - to be added during development]_

### Storage Strategy

```

Tranquara uses **Capacitor Preferences** and **Capacitor Secure Storage** for offline data:

---

| Storage Type | Use Case | Encryption |

|--------------|----------|------------|**Key Principle**: Authentication requires internet, but **app usage does not**.

| **Secure Storage** | Keycloak tokens, encryption keys, app lock PIN | ✅ OS-level (Keychain/Keystore) |

| **Preferences** | User session, cached data, settings | ✅ App-level (AES-256) |### `user_data` Table

| **Filesystem** | Large files (journal exports, images) | ✅ App-level (AES-256) |

---

### 1. Secure Storage (Capacitor SecureStorage)

**Purpose**: Store user profile and settings locally (replaces server `user_informations` when offline)

**Purpose**: Store sensitive credentials that unlock local data

## 📊 Server-Side: PostgreSQL Schema

**Storage Keys** (@capacitor/secure-storage):

- `keycloak_access_token` - JWT, 15min expiry_[SQL code implementation removed - to be added during development]_sql  last_synced INTEGER,           -- Unix timestamp of last sync

### 2. Preferences Storage (Capacitor Preferences)

CREATE TABLE user_informations (  needs_sync INTEGER DEFAULT 0,  -- 1=has unsynced changes

**Purpose**: Store user session and cached data (encrypted with local key)

  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  created_at INTEGER NOT NULL

**Storage Keys** (@capacitor/preferences):

  keycloak_id VARCHAR(255) UNIQUE NOT NULL,  -- Keycloak user UUID);

**Session**:

- `user_session` - Contains: user_id, keycloak_id, email, username, last_sync, is_authenticated  email VARCHAR(255) UNIQUE NOT NULL,        -- Primary identifier```



**Cached Data (Encrypted JSON)**:  username VARCHAR(100) NOT NULL,            -- Display name (changeable)

- `user_profile` - Encrypted user_informations

- `user_journals` - Encrypted journal entries  oauth_provider VARCHAR(50),                 -- 'email', 'apple', 'google'**Example Row** (Empty Profile):

- `user_settings` - Encrypted settings

- `user_streaks` - Encrypted streak data  kyc_answers JSONB DEFAULT '{}',            -- Onboarding answers_[JSON code implementation removed - to be added during development]_

- `entity_type` - 'journal', 'setting', 'streak', 'profile'

- `operation` - 'CREATE', 'UPDATE', 'DELETE'CREATE INDEX idx_user_oauth_provider ON user_informations(oauth_provider);

- `entity_id` - Server ID or temp ID

- `payload` - Encrypted data```**Parsed `data_json`**:

- `retry_count` - Number

- `synced` - Boolean_[JSON code implementation removed - to be added during development]_json  "username": "Sarah",

- id: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

- entity_type: `journal`{  "kyc_answers": {},  // Empty until onboarding completed

- operation: `CREATE`

- entity_id: `temp_journal_123`  "user_id": "550e8400-e29b-41d4-a716-446655440000",  "settings": {

- payload: Journal title, content, created_at

- synced: `false`  "keycloak_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",    "theme": "auto",



**Offline Setting Update**:  "email": "sarah@example.com",    "notifications": {

- id: `b2c3d4e5-f6a7-8901-bcde-f12345678901`

- entity_type: `setting`  "username": "Sarah",      "daily_reminder": true,

- operation: `UPDATE`

- entity_id: `550e8400-e29b-41d4-a716-446655440000`  "oauth_provider": "email",      "reminder_time": "09:00"

- payload: Theme changed to 'dark'

- synced: `false`  "kyc_answers": {    }



---    "reason": "anxiety_management",  }



## 🔄 Data Sync Flow    "experience_level": "beginner",}



### Initial Sync (After Login)    "preferred_time": "evening"```



**Flow**:  },

1. App authenticates with Keycloak (email/password or OAuth)

2. Keycloak returns access_token, refresh_token, id_token  "created_at": "2025-01-15T10:30:00Z",---

3. App stores tokens in Capacitor SecureStorage

4. App calls backend API: `GET /api/users/me` (with Bearer token)  "updated_at": "2025-01-15T10:30:00Z",

5. Backend returns user profile, journals, settings

6. App generates local encryption key  "last_login": "2025-01-15T10:30:00Z",### `sync_queue` Table

7. App encrypts user data (AES-256)

8. App stores encrypted data in Capacitor Preferences  "is_active": true

9. App stores encryption key in Capacitor SecureStorage

10. App now works fully offline}**Purpose**: Track changes that need to sync to server



### Background Sync (When Online)```



**Trigger**: Every 5 minutes or on app resume_[SQL code implementation removed - to be added during development]_json  id INTEGER PRIMARY KEY AUTOINCREMENT,

   - Get sync_queue from Capacitor Preferences

   - For each pending change: POST/PUT/DELETE to API{  user_id TEXT NOT NULL,

   - Mark successful syncs in queue

   - Call `GET /api/sync/latest?since={last_sync}` for new data  "user_id": "660f9511-e39c-42d5-b827-1f13c3d4e590",  operation TEXT NOT NULL,       -- 'CREATE', 'UPDATE', 'DELETE'

   - Encrypt new data

   - Update local cache in Capacitor Preferences  "keycloak_id": "a58bd21c-69dd-5483-b678-1f13d3e4f601",  entity_type TEXT NOT NULL,     -- 'user', 'journal', 'streak'

   - Update last_sync timestamp

3. If offline:  "email": "john@icloud.com",  entity_id TEXT,                -- Local or server ID

   - Skip sync, continue offline

  "username": "John Doe",  data_json TEXT NOT NULL,       -- JSON payload

### Conflict Resolution

  "oauth_provider": "apple",  retry_count INTEGER DEFAULT 0,

**Strategy**: Last Write Wins (with user prompt for important changes)

  "kyc_answers": {},  created_at INTEGER NOT NULL,

**Journal Conflicts**:

- Always keep both versions (never lose journal entries)  "created_at": "2025-01-16T14:20:00Z",  synced_at INTEGER

- Merge local and server versions

  "updated_at": "2025-01-16T14:20:00Z",);

**Setting Conflicts**:

- Prompt user to choose version  "last_login": "2025-01-16T14:20:00Z",```



**Default**:  "is_active": true

- Server wins

}**Example Row** (Pending Sync):

---

```_[JSON code implementation removed - to be added during development]_

- No Keycloak integration

- Complex offline sync logic| **Preferences** | User session, cached data, settings | ✅ App-level (AES-256) |



**After (Keycloak + Offline Data)**:| **Filesystem** | Large files (journal exports, images) | ✅ App-level (AES-256) |---

- user_id: `550e8400-e29b-41d4-a716-446655440000`

- keycloak_id: `f47ac10b-58cc-4372-a567-0e02b2c3d479`

- Simple sync queue for pending changes

### 1. Secure Storage (Capacitor SecureStorage)##  Web: IndexedDB Schema

**No migration needed** - Clean slate with Keycloak authentication.



---

**Purpose**: Store sensitive credentials that unlock local data### `theraprep_offline` Database

## 📊 Storage Size Estimates



| Data Type | Size Per User | Storage Location |
|-----------|---------------|------------------|
| User Profile | ~2 KB | Preferences (encrypted) |

| Tokens | ~5 KB | SecureStorage |// @capacitor/secure-storage

| Settings | ~1 KB | Preferences (encrypted) |

| Journals (100 entries) | ~500 KB | Preferences (encrypted) |interface SecureStorageData {#### `session` Store

| Sync Queue | ~50 KB | Preferences |

| **Total** | **~560 KB** | All Capacitor storage |  // Keycloak tokens (auto-refresh)



**Platform Limits**:  'keycloak_access_token': string;      // JWT, 15min expiry_[TYPESCRIPT code implementation removed - to be added during development]_

- ✅ No sensitive data in logs

}

**On Logout**:

- ✅ Delete all Capacitor SecureStorage keys```**Example**:

- ✅ Delete all Capacitor Preferences

- ✅ User must re-authenticate to download data again_[JSON code implementation removed - to be added during development]_typescript  "key": "current",

- **Refresh Token**: 30 days (SecureStorage only)

- **Auto-Refresh**: Nuxt Auth middleware handles automaticallyimport { SecureStorage } from '@capacitor/secure-storage';  "user_id": "550e8400-e29b-41d4-a716-446655440000",

- **Offline Grace**: App works indefinitely offline with cached data

  "username": "Sarah",

---

// Store refresh token (survives app restart)  "last_active": 1700651200000,

## 📚 Related Documentation

await SecureStorage.set({  "is_synced": true

- **[01-LOGIN-FLOW.md](./01-LOGIN-FLOW.md)** - Keycloak authentication flows

- **[02-ONBOARDING-FLOW.md](./02-ONBOARDING-FLOW.md)** - KYC question flow  key: 'keycloak_refresh_token',}

- **[User Settings](../06.%20User%20profile%20and%20Settings/)** - Profile management

  value: 'eyJhbGciOiJSUzI1NiIsInR5cCI...'```

---

});

**Last Updated**: November 24, 2025

---

// Retrieve for token refresh

const { value } = await SecureStorage.get({ key: 'keycloak_refresh_token' });#### `user_data` Store

```

_[TYPESCRIPT code implementation removed - to be added during development]_typescript  needs_sync: boolean;

// @capacitor/preferences}

interface PreferencesData {```

  // Session

  'user_session': {**Example**:

    user_id: string;_[JSON code implementation removed - to be added during development]_

  'app_lock_enabled': 'true' | 'false';

  'theme': 'light' | 'dark' | 'auto';---

  'last_app_version': string;

}#### `sync_queue` Store

```

_[TYPESCRIPT code implementation removed - to be added during development]_typescript  id: string;  // UUID generated client-side

import { Preferences } from '@capacitor/preferences';  user_id: string;

  operation: 'CREATE' | 'UPDATE' | 'DELETE';

// Store session after login  entity_type: 'user' | 'journal' | 'streak';

await Preferences.set({  entity_id: string;

  key: 'user_session',  payload: Record<string, any>;

  value: JSON.stringify({  retry_count: number;

    user_id: '550e8400-e29b-41d4-a716-446655440000',  created_at: number;

    keycloak_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',  synced_at: number | null;

    email: 'sarah@example.com',}

    username: 'Sarah',```

    last_sync: 1700651200000,

    is_authenticated: true**Example**:

  })_[JSON code implementation removed - to be added during development]_  "entity_id": "550e8400-e29b-41d4-a716-446655440000",

  "payload": {

**Example: Encrypted User Profile**:
_[Code implementation removed - to be added during development]_

const encryptedProfile = await encryptData(userProfile, encryptionKey);  },

  "retry_count": 0,

await Preferences.set({  "created_at": 1700651200000,

  key: 'user_profile',  "synced_at": null

  value: encryptedProfile  // Base64 encrypted JSON}

});```



// Decrypt when needed (offline)---

const { value } = await Preferences.get({ key: 'user_profile' });

const userProfile = await decryptData(value, encryptionKey);## ️ Server: PostgreSQL Schema

```

### `user_informations` Table

---

**Purpose**: Server-side user profile (synced from mobile/web)

### 3. Sync Queue (Offline Changes)

_[SQL code implementation removed - to be added during development]_typescript  username TEXT NOT NULL UNIQUE,

interface SyncQueueItem {  age_range VARCHAR(50),

  id: string;                   // UUID  gender TEXT,

  timestamp: number;            // When created offline  kyc_answers JSONB DEFAULT '{}',

  entity_type: 'journal' | 'setting' | 'streak' | 'profile';  settings JSONB DEFAULT '{

  operation: 'CREATE' | 'UPDATE' | 'DELETE';    "notifications": {

  entity_id: string;            // Server ID or temp ID      "daily_reminder": true,

  payload: any;                 // Encrypted data      "reminder_time": "09:00"

  retry_count: number;    },

  synced: boolean;    "preferences": {

}      "theme": "auto",

```      "language": "en"

    }

**Example Queue**:
_[Code implementation removed - to be added during development]_

    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",);

    "timestamp": 1700651200000,

    "entity_type": "journal",CREATE INDEX idx_user_username ON user_informations(username);

    "operation": "CREATE",CREATE INDEX idx_user_created ON user_informations(created_at);

    "entity_id": "temp_journal_123",```

    "payload": {

      "title": "My Offline Journal",**Example Row** (Complete Profile):

      "content": "Written without internet",_[JSON code implementation removed - to be added during development]_    "preferences": {

      "theme": "dark",

---      "language": "en"

    }

## 🔄 Data Sync Flow  },

  "created_at": "2025-11-21T10:30:00Z",

### Initial Sync (After Login)  "updated_at": "2025-11-22T14:20:00Z",

  "last_login": "2025-11-23T08:15:00Z"

```mermaid}

sequenceDiagram```

    participant App as Nuxt App

    participant KC as Keycloak---

    participant API as Backend API

    participant CS as Capacitor Storage### `user_devices` Table



    App->>KC: Login (email/password or OAuth)**Purpose**: Track devices for multi-device sync and security

    KC-->>App: access_token, refresh_token, id_token

    _[SQL code implementation removed - to be added during development]_CREATE INDEX idx_devices_user ON user_devices(user_id);

CREATE INDEX idx_devices_device_id ON user_devices(device_id);

### Background Sync (When Online)```



```mermaid**Example Rows**:

sequenceDiagram_[JSON code implementation removed - to be added during development]_

            Note over App: Skip sync, continue offline

        end---

    end

```### `refresh_tokens` Table



### Conflict Resolution**Purpose**: Store refresh tokens for session management (web only)



_[SQL code implementation removed - to be added during development]_

---

    };

  }##  Data Flow Examples

  

  if (conflict.entity_type === 'setting') {### Mobile: First Registration (Offline)

    // Prompt user to choose

    const userChoice = await showConflictDialog(conflict);**Step 1: Create Local Session**

    return { action: 'use', result: userChoice };

  }SQLite `local_session`:

  _[JSON code implementation removed - to be added during development]_  "biometric_enabled": 1,

  "created_at": 1700564400000,

---  "is_synced": 0

}

## 🔒 Encryption Strategy (Day One Style)```



### Local Data EncryptionSQLite `user_data`:

_[JSON code implementation removed - to be added during development]_typescript{

import { AES, enc } from 'crypto-js';  "user_id": "temp_a3f8c9e2d1b4",

  "data_json": "{\"username\":\"Sarah\",\"kyc_answers\":{}}",

// Generate encryption key (once per device)  "needs_sync": 1

async function generateEncryptionKey(): Promise<string> {}

  const array = new Uint8Array(32);```

  crypto.getRandomValues(array);

  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');SQLite `sync_queue`:

}_[JSON code implementation removed - to be added during development]_



// Decrypt data when retrieving---

async function decryptData(encryptedData: string, key: string): Promise<any> {

  const decrypted = AES.decrypt(encryptedData, key);**Step 2: User Goes Online → Sync**

  const jsonString = decrypted.toString(enc.Utf8);

  return JSON.parse(jsonString);Backend `POST /auth/register`:

}_[JSON code implementation removed - to be added during development]_{

  "username": "Sarah",

### Key Storage Security  "device_info": {

    "platform": "ios",

- **Encryption Key**: Stored in Capacitor SecureStorage (Keychain/Keystore)    "device_id": "ios_ABC123DEF456",

- **App Lock (Optional)**: Biometric or PIN unlocks SecureStorage    "device_name": "Sarah's iPhone 13"

- **Token Refresh**: Automatic with Keycloak refresh token  }

- **Data Wipe**: Delete SecureStorage on logout (user can re-download)}

```

---

Response:

## 🚀 Migration from Temp IDs_[JSON code implementation removed - to be added during development]_sql  "access_token": "eyJhbGc...",

-- Old approach: temp IDs, no Keycloak  "refresh_token": "refresh_xyz..."

user_id: "temp_a3f8c9e2d1b4"}

``````



### After (Keycloak + Offline Data)**Step 3: Update Local Database**

_[SQL code implementation removed - to be added during development]_json

keycloak_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"{

```  "user_id": "550e8400-e29b-41d4-a716-446655440000",  // Changed from temp

  "is_synced": 1

**No migration needed** - Clean slate with Keycloak authentication.}

```

---

SQLite `user_data` (UPDATE):

## 📊 Storage Size Estimates_[JSON code implementation removed - to be added during development]_

| Journals (100 entries) | ~500 KB | Preferences (encrypted) |

| Sync Queue | ~50 KB | Preferences |PostgreSQL `user_informations` (INSERT):

| **Total** | **~560 KB** | All Capacitor storage |_[JSON code implementation removed - to be added during development]_



## 🔐 Security ConsiderationsPostgreSQL `user_devices` (INSERT):

_[JSON code implementation removed - to be added during development]_

✅ **In Transit**:

- HTTPS for all API calls---

- Keycloak tokens use RSA-256 signatures

- No sensitive data in logs### Web: Login with Refresh Token



✅ **On Logout**:**Step 1: Check IndexedDB**

- Delete all Capacitor SecureStorage keys

- Delete all Capacitor PreferencesIndexedDB `session`:

- User must re-authenticate to download data again_[JSON code implementation removed - to be added during development]_

- **Offline Grace**: App works indefinitely offline with cached data

**Step 2: Refresh Access Token**

---

Request `POST /auth/refresh` (httpOnly cookie sent automatically):

## 📚 Related Documentation```

Cookie: refresh_token=refresh_xyz...

- **[01-LOGIN-FLOW.md](./01-LOGIN-FLOW.md)** - Keycloak authentication flows```

- **[02-ONBOARDING-FLOW.md](./02-ONBOARDING-FLOW.md)** - KYC question flow

- **[User Settings](../06.%20User%20profile%20and%20Settings/)** - Profile managementBackend checks PostgreSQL `refresh_tokens`:

_[JSON code implementation removed - to be added during development]_

Response:
_[JSON code implementation removed - to be added during development]_

**Step 3: Sync User Data**

Request `GET /users/me` (with access token):

PostgreSQL:
_[SQL code implementation removed - to be added during development]_

Update IndexedDB `user_data`:
_[JSON code implementation removed - to be added during development]_

---

##  Security Considerations

### Mobile (SQLite)
- ✅ Database encrypted with device key (stored in Keychain)
- ✅ Biometric unlock required before decryption
- ✅ Tokens stored in Expo SecureStore (Keychain)
- ✅ No passwords ever stored

### Web (IndexedDB)
- ✅ Access token in sessionStorage (cleared on tab close)
- ✅ Refresh token in httpOnly cookie (XSS immune)
- ✅ IndexedDB encrypted at OS level (Chrome, Safari)
- ✅ Service Worker caches only public assets

### Server (PostgreSQL)
- ✅ Refresh tokens hashed (SHA-256) before storage
- ✅ User devices tracked for anomaly detection
- ✅ Expired tokens cleaned up via cron job
- ✅ All sensitive fields use parameterized queries

---

##  Query Examples

### Mobile: Check if User Exists Locally

_[SQL code implementation removed - to be added during development]_

---

### Mobile: Get User Profile Data

_[SQL code implementation removed - to be added during development]_

---

### Mobile: Queue Profile Update for Sync

_[SQL code implementation removed - to be added during development]_

---

### Server: Create New User

_[SQL code implementation removed - to be added during development]_

---

### Server: Get User with Devices

_[SQL code implementation removed - to be added during development]_

---

##  Related Documentation

- **[Login Flow](./01-LOGIN-FLOW.md)** - How data flows during auth
- **[Offline Auth Strategy](./04-OFFLINE-AUTH-STRATEGY.md)** - Implementation details
- **[Onboarding Flow](./02-ONBOARDING-FLOW.md)** - How `kyc_answers` gets populated
- **[Main Database Schema](../00-DATABASE/SCHEMA_OVERVIEW.md)** - Full schema reference

---

**Last Updated**: November 21, 2025
