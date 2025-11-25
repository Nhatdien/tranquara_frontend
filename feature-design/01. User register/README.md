# 📁 User Authentication & Registration

> Keycloak-based authentication with email/password + social login and offline data access

---

## 📑 Contents

| File | Description |
|------|-------------|
| **[00-OVERVIEW.md](./00-OVERVIEW.md)** | Feature purpose, status, and key decisions |
| **[01-LOGIN-FLOW.md](./01-LOGIN-FLOW.md)** | Keycloak authentication flows (email, Apple, Google) |
| **[02-ONBOARDING-FLOW.md](./02-ONBOARDING-FLOW.md)** | Post-authentication KYC questions (optional) |
| **[03-DATA-MODELS.md](./03-DATA-MODELS.md)** | Database schema and offline data caching |

---

## 🎯 Quick Summary

**Status**: ✅ In Progress  
**Priority**: High

### What This Feature Does

Users can:
- **Register** with email/password or social login (Apple, Google) via Keycloak
- **Authenticate** securely using OpenID Connect (industry standard)
- **Use app offline** with cached data and local encryption (Day One style)
- **Complete optional onboarding** questionnaire for AI personalization
- **Enable app lock** (PIN/Face ID) for additional device security (mobile only)

### Technology Stack

- **Authentication**: Keycloak (OpenID Connect / OAuth 2.0)
- **Frontend**: Nuxt 3 + Vue 3 (web + mobile)
- **Mobile Runtime**: Capacitor (iOS/Android)
- **State Management**: Pinia (Vue 3)
- **Session**: JWT tokens (access 15min, refresh 30 days)
- **Offline Data**: Capacitor Preferences + SecureStorage (encrypted)
- **Backend**: Go + PostgreSQL (JWT verification)

### Key Features

✅ **Online Authentication**: Users authenticate via Keycloak (requires internet once)  
✅ **Offline Data Access**: Full app functionality offline with encrypted local cache  
✅ **Auto-Sync**: Changes sync automatically when online  
✅ **Social Login**: Apple, Google managed by Keycloak  
✅ **Password Recovery**: Built-in Keycloak password reset  
✅ **Flexible Username**: Display name (changeable), email is unique identifier  
✅ **Optional App Lock**: Biometric/PIN for mobile convenience

---

## 🔐 Authentication Architecture

### Hybrid Approach (Online Auth + Offline Data)

```
┌──────────────────────────────────────┐
│  First Login (Requires Internet)     │
├──────────────────────────────────────┤
│  1. User authenticates via Keycloak  │
│  2. App downloads user data          │
│  3. Encrypt & cache locally          │
│  4. Store tokens in SecureStorage    │
└──────────────────────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  Subsequent Use (Fully Offline)      │
├──────────────────────────────────────┤
│  1. Open app (no internet needed)    │
│  2. Decrypt local data               │
│  3. Full read/write access           │
│  4. Changes queued for sync          │
│  5. Auto-sync when online            │
└──────────────────────────────────────┘
```

**Similar to**: Day One journal app (online auth, offline data)

---

## 🔗 Related Features

- **[User Settings](../06.%20User%20profile%20and%20Settings/)** - Profile management and app lock
- **[Journaling](../02.%20Journaling/)** - Offline journal creation
- **[Data Sync](../05.%20Data%20sync/)** - Background sync strategy

---

## 🚀 Implementation Status

### ✅ Completed
- [x] Keycloak server setup and realm configuration
- [x] Email/password authentication
- [x] Social login (Apple, Google) configuration
- [x] Nuxt 3 + Vue 3 frontend setup
- [x] Capacitor mobile configuration
- [x] JWT verification in Go backend
- [x] Onboarding flow (optional profile questions)
- [x] Database schema with keycloak_id

### 🔄 In Progress
- [ ] Offline data encryption implementation
- [ ] Sync queue for offline changes
- [ ] App lock (PIN/biometric) for mobile
- [ ] Token auto-refresh logic
- [ ] Conflict resolution for sync

### 📋 Planned
- [ ] Multi-device session management
- [ ] Account recovery flow
- [ ] Email verification
- [ ] Session timeout handling
- [ ] Keycloak admin panel for user management

---

## 📚 Technical References

### Keycloak Configuration

_[JSON code implementation removed - to be added during development]_

### Identity Providers

- **Apple**: Sign in with Apple (native iOS/Android)
- **Google**: Google OAuth 2.0
- **Email**: Keycloak-managed passwords (bcrypt)

### Token Lifecycle

- **Access Token**: 15 minutes (in-memory + backup in SecureStorage)
- **Refresh Token**: 30 days (SecureStorage only)
- **Auto-Refresh**: Handled by Nuxt Auth middleware
- **Offline Grace**: App works indefinitely offline with cached data

### Data Storage

| Type | Location | Encryption |
|------|----------|------------|
| Tokens | Capacitor SecureStorage | OS-level (Keychain/Keystore) |
| User Profile | Capacitor Preferences | AES-256 (app-level) |
| Journals | SQLite (@capacitor-community/sqlite) | Optional SQLite encryption |
| Settings | Capacitor Preferences | AES-256 (app-level) |

> **Note**: Journals use SQLite instead of Capacitor Preferences due to high data volume and complex querying needs. See [Journal Feature docs](../02.%20Jounral%20Feature/) for details.

---

## 🔒 Security Highlights

✅ **Authentication**: Industry-standard OpenID Connect  
✅ **Passwords**: bcrypt hashing managed by Keycloak  
✅ **Tokens**: JWT with RSA-256 signature verification  
✅ **Local Data**: AES-256 encryption with secure key storage  
✅ **Transport**: HTTPS for all API calls  
✅ **App Lock**: Optional biometric/PIN for mobile  
✅ **Logout**: Complete data wipe from local storage

---

## 🎨 User Experience

### New User Flow
1. Opens app → Welcome screen
2. Taps "Create Account" → Redirected to Keycloak
3. Enters email, password, display name → Account created
4. OR taps "Continue with Apple/Google" → OAuth flow
5. Optional onboarding questions (can skip)
6. Home dashboard

### Returning User Flow (Online)
1. Opens app → Auto-login (valid token)
2. Home dashboard loads immediately

### Returning User Flow (Offline)
1. Opens app → Decrypt local data
2. (Optional) App lock PIN/Face ID prompt
3. Full offline access to journals, lessons, etc.
4. Changes sync when internet available

### Password Reset
1. Taps "Forgot Password" → Keycloak reset page
2. Enters email → Receives reset link
3. Sets new password → All sessions invalidated
4. Re-login on all devices

---

## 📖 Migration Notes

### From Previous Offline-First Approach

**Before**:
- Custom offline-first authentication
- Temporary user IDs (`temp_`)
- Local SQLite database only
- Complex sync logic

**After** (Current):
- Keycloak centralized authentication
- Real user IDs + keycloak_id
- Capacitor Preferences (lighter storage)
- Simpler sync queue (pending changes only)

**Benefits**:
- Industry-standard security
- Better password recovery
- Easier social login
- Simpler architecture
- Still works offline for data access

---

**Last Updated**: November 24, 2025  
**Version**: 2.0 (Keycloak + Nuxt 3 + Capacitor)
