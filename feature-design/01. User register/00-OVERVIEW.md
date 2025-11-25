# 🔐 User Authentication - Overview

## 🎯 Purpose

Provide secure, flexible authentication for Tranquara using email/password or social login (Apple, Google). Users can optionally enable app lock (PIN/Face ID) in Settings for additional device-level security.

## 📊 Status

- **Current Status**: 🔄 In Progress
- **Priority**: High
- **Target Release**: v1.0
- **Dependencies**: 
  - Keycloak (OpenID Connect authentication server)
  - Nuxt 3 + Vue 3 (frontend framework)
  - Capacitor (mobile runtime for iOS/Android)
  - Native biometric APIs (iOS Keychain, Android Keystore) for optional app lock
  - Capacitor Preferences + SecureStorage (local encrypted data caching)
  - Backend API (Go + PostgreSQL)

## 🎨 User Value

- **Flexible login**: Email/password OR Sign in with Apple/Google via Keycloak
- **No forced onboarding**: Complete profile details later, at your own pace
- **Optional app lock**: Add PIN or Face ID in Settings for device-level security
- **Password recovery**: Keycloak-managed password reset via email
- **Social login convenience**: One-tap sign-in with existing accounts
- **Offline data access**: Full app functionality offline after first login (Day One style)
- **Auto-sync**: Changes sync automatically when internet available
- **Display name flexibility**: Choose any username, change it anytime

## 🔑 Key Features

- **Email/Password Authentication**: Standard registration and login flow with email verification
- **Social Login**: Sign in with Apple, Sign in with Google (OAuth 2.0)
- **Password Recovery**: Email-based password reset with secure token
- **Deferred Onboarding**: Optional profile completion, accessible anytime in settings
- **Display Names**: Username is a changeable display name (not used for login)
- **Session Management**: JWT-based authentication with refresh tokens
- **Optional App Lock**: Users can enable PIN or Face ID in Settings (device-level security)
- **Multi-device Support**: Sync across mobile and web platforms
- **Email Verification**: Optional email verification for account security

## 📋 Success Criteria

- [x] Users can register with email and password
- [ ] Email verification workflow functional
- [ ] Social login (Apple, Google) integrated
- [ ] Password reset flow via email
- [ ] JWT authentication with refresh tokens
- [ ] Session persists across app restarts
- [ ] Onboarding skippable and accessible from settings
- [ ] Cross-device data sync works seamlessly
- [ ] Users can change username (display name) anytime
- [ ] Optional app lock (PIN/Face ID) configurable in Settings

## 🔗 Related Features

- **[Login Flow](./01-LOGIN-FLOW.md)** - Keycloak authentication flows and technical implementation
- **[Onboarding Flow](./02-ONBOARDING-FLOW.md)** - Optional profile completion (accessible in settings)
- **[Data Models](./03-DATA-MODELS.md)** - PostgreSQL schema and offline data caching strategy
- **[User Settings](../06.%20User%20profile%20and%20Settings/)** - Complete/edit onboarding anytime, enable app lock
- **[Data Sync](../05.%20Data%20sync/)** - Background sync for offline changes

## 📝 Notes

### Design Decisions

1. **Why Keycloak for Authentication?**
   - Industry-standard OpenID Connect / OAuth 2.0 protocol
   - Centralized identity management (single source of truth)
   - Built-in OAuth providers (Apple, Google)
   - Password policies, brute force protection, email verification
   - Session management across devices
   - Future-proof for SSO and enterprise features

2. **Why Online Authentication + Offline Data (Day One Style)?**
   - Users authenticate once online (Keycloak requires internet)
   - Data cached locally with encryption (AES-256)
   - App works fully offline after first login
   - Changes sync automatically when online
   - Best of both worlds: secure auth + offline access

3. **Why Deferred Onboarding?**
   - Reduces initial friction (get to app value faster)
   - Users can skip when uncomfortable sharing
   - Complete profile when ready (in settings)
   - AI personalization improves gradually as user adds data

4. **Why Optional App Lock (Not Required)?**
   - Account security handled by Keycloak email/password or OAuth
   - App lock is a **convenience feature** for quick access (like banking apps)
   - Users enable PIN/Face ID in Settings if they want device-level protection
   - Keeps initial registration simple

5. **Username as Display Name Only**
   - Users want flexibility to change their name
   - Display name is what shows in UI (journals, settings)
   - Not used for login (email is the unique identifier)
   - Can be any name: "Sarah", "Sarah Chen", "S", etc.

6. **Session Management**
   - Access token (short-lived, 15 minutes) for API calls
   - Refresh token (long-lived, 30 days) stored in Capacitor SecureStorage
   - Token refresh happens automatically via Nuxt Auth
   - Logout clears all tokens and local encrypted data

### Security Considerations

- **Keycloak Authentication**: Industry-standard OpenID Connect / OAuth 2.0
- **Passwords**: bcrypt hashing (managed by Keycloak, never stored in app database)
- **Social OAuth**: Apple Sign-In, Google Sign-In (Keycloak manages OAuth flows)
- **JWT Tokens**: Access token (15 min), Refresh token (30 days), RSA-256 signature
- **Password Reset**: Keycloak-managed reset flow with secure email token (1 hour expiry)
- **Local Data Encryption**: AES-256 for Capacitor Preferences (user profile, settings); Optional SQLite encryption for journals
- **Encryption Key Storage**: Capacitor SecureStorage (iOS Keychain, Android Keystore)
- **App Lock (Optional)**: PIN hashed with SHA-256, Face ID uses device secure enclave
- **Token Storage**: Capacitor SecureStorage (OS-level encryption)
- **Session Security**: Keycloak session management with device tracking
- **HTTPS Only**: All API calls over TLS 1.3+
- **Data Wipe on Logout**: All local encrypted data and tokens deleted

### Future Enhancements

- [ ] Multi-factor authentication (2FA via Keycloak)
- [ ] Additional OAuth providers (Facebook, Microsoft) via Keycloak
- [ ] Account linking (merge social + email accounts in Keycloak)
- [ ] Keycloak admin dashboard for user management
- [ ] Audit logging for authentication events
- [ ] Rate limiting on login attempts (Keycloak built-in)
- [ ] Email verification enforcement (currently optional)
- [ ] Device management (view/revoke sessions from Settings)

---

**Last Updated**: November 21, 2025
