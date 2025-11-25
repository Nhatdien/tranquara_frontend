# ⚙️ Settings - Technical Specification

This document provides implementation details for the Settings feature, including architecture, APIs, security patterns, notification scheduling, data sync, and third-party integrations.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Settings Sync Strategy](#settings-sync-strategy)
3. [Theme System](#theme-system)
4. [Notification Scheduling](#notification-scheduling)
5. [Security: PIN & Biometric](#security-pin--biometric)
6. [AI Memory Generation](#ai-memory-generation)
7. [Data Export/Import](#data-exportimport)
8. [Account Deletion](#account-deletion)
9. [API Endpoints](#api-endpoints)
10. [Performance Targets](#performance-targets)
11. [Third-Party Libraries](#third-party-libraries)

---

## Architecture Overview

### Component Structure

```
Settings Feature
│
├── UI Layer (Nuxt 3 + Vue 3 + Capacitor)
│   ├── SettingsScreen.vue          - Main settings container
│   ├── AccountSection.vue           - Name, email, join date
│   ├── NotificationSettings.vue     - Morning/evening reminders
│   ├── SecuritySettings.vue         - PIN, biometric, auto-lock
│   ├── PersonalizationSettings.vue  - Theme, language, font
│   ├── AIPrivacySettings.vue        - AI toggle, Your Story, memory viewer
│   ├── DataManagementSettings.vue   - Export, import, delete
│   └── AIMemoryScreen.vue           - Full-screen AI memory view
│
├── State Management (Pinia)
│   ├── useSettingsStore.ts          - Global settings state
│   ├── useThemeStore.ts             - Theme state + system detection
│   └── useNotificationStore.ts      - Notification permissions + schedule
│
├── Services (Composables)
│   ├── useSettingsService.ts        - CRUD for settings
│   ├── useSyncService.ts            - Background sync to cloud
│   ├── useNotificationService.ts    - Schedule/cancel notifications (Capacitor Local Notifications)
│   ├── useSecurityService.ts        - PIN hashing, biometric auth (Capacitor Biometric)
│   ├── useExportService.ts          - Generate JSON exports
│   ├── useImportService.ts          - Validate and merge imports
│   └── useAIMemoryService.ts        - Fetch/clear AI memory
│
└── Storage (Capacitor)
    ├── Capacitor Preferences (Local Storage)
    │   ├── settings_global            - Synced settings (theme, language)
    │   ├── settings_local             - Device-specific (notification times)
    │   └── ai_memory_cache            - Cached AI memory
    │
    └── Capacitor SecureStorage (Encrypted)
        ├── pin_hash                   - Hashed PIN
        ├── biometric_enabled          - Boolean flag
        ├── keycloak_access_token      - Keycloak JWT (15min)
        └── keycloak_refresh_token     - Keycloak refresh token (30d)
```

---

## Settings Sync Strategy

### Storage Architecture Note

**Settings uses Capacitor Preferences (NOT SQLite)** because:
- ✅ Small data volume (< 1KB of key-value pairs)
- ✅ Simple read/write operations (no complex queries)
- ✅ Low frequency updates (user changes settings occasionally)
- ✅ Perfect for key-value storage

**For comparison**: Journal entries and lessons use SQLite (`@capacitor-community/sqlite`) due to high data volume and complex querying needs.

### Global vs Device-Specific Settings

**Global Settings** (synced across devices):
- `theme` (light/dark/auto)
- `language` (en, es, fr, etc.)
- `ai_enabled` (AI personalization on/off)
- `your_story` (user-provided context)
- `data_collection` (analytics opt-in)
- `font_size` (small/medium/large)
- `reduce_motion` (accessibility)

**Device-Specific Settings** (local only):
- `notification_times` (morning_time, evening_time)
- `auto_lock_timeout` (immediate, 1min, 5min, etc.)
- `biometric_enabled` (device biometric availability varies)
- `pin_hash` (device-specific security)

### Sync Mechanism

**When to Sync**:
- User changes a global setting → Immediate sync
- App enters background → Debounced sync (30s delay)
- App reopens → Pull latest settings from cloud
- Conflict resolution: Last-write-wins (timestamp-based)

**Sync Process**:
_[TYPESCRIPT code implementation removed - to be added during development]_

**Backend Storage** (PostgreSQL):
_[SQL code implementation removed - to be added during development]_

---

## Theme System

### Implementation

**Theme Detection Flow**:
_[TYPESCRIPT code implementation removed - to be added during development]_

**Theme Variables** (CSS):
```css
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --text-primary: #000000;
  --text-secondary: #666666;
  --accent: #4A90E2;
}

.dark {
  --bg-primary: #1A1A1A;
  --bg-secondary: #2A2A2A;
  --text-primary: #FFFFFF;
  --text-secondary: #AAAAAA;
  --accent: #6AB0F3;
}
```

**Platform-Specific**:
- **iOS**: Respects system theme via Capacitor Preferences
- **Android**: Respects system theme via Capacitor Preferences
- **Web**: Respects system theme via `window.matchMedia('(prefers-color-scheme: dark)')`

---

## Notification Scheduling

### Platform Implementation

**Capacitor Local Notifications Plugin** (Cross-platform):
_[TYPESCRIPT code implementation removed - to be added during development]_

**Platform-Specific Notes**:
- **iOS**: Uses UNUserNotificationCenter
- **Android**: Uses NotificationCompat with AlarmManager
- **Web**: Uses Web Notifications API (requires permission)

**Weekly Summary Notification**:
_[TYPESCRIPT code implementation removed - to be added during development]_

### Notification Permissions

**Check and Request** (Capacitor):
_[TYPESCRIPT code implementation removed - to be added during development]_

---

## Security: PIN & Biometric

### PIN Implementation

**Hashing Algorithm** (bcrypt):
_[TYPESCRIPT code implementation removed - to be added during development]_

### Biometric Authentication

**Capacitor Biometric Plugin** (iOS/Android):
_[TYPESCRIPT code implementation removed - to be added during development]_

**Platform Support**:
- **iOS**: Face ID / Touch ID
- **Android**: Fingerprint / Face Unlock
- **Web**: WebAuthn (future enhancement)

### App Lock Flow

**On App Launch**:
_[TYPESCRIPT code implementation removed - to be added during development]_

### Forgot PIN Recovery

**Flow** (aligns with login pattern):
_[TYPESCRIPT code implementation removed - to be added during development]_

**Future Enhancement**: Email/SMS recovery
_[TYPESCRIPT code implementation removed - to be added during development]_

---

## AI Memory Generation

### Background Task

**Trigger**: After each journal entry submission

_[TYPESCRIPT code implementation removed - to be added during development]_

**Worker Process** (RabbitMQ Consumer):
_[PYTHON code implementation removed - to be added during development]_

### AI Memory Generation Algorithm

_[PYTHON code implementation removed - to be added during development]_

### Caching Strategy

**Frontend Cache** (5-minute TTL):
_[TYPESCRIPT code implementation removed - to be added during development]_

---

## Data Export/Import

### Export Implementation

**Backend API** (Go):
_[GO code implementation removed - to be added during development]_

**Large Export Handling** (Background Job):
_[GO code implementation removed - to be added during development]_

### Import Implementation

**Backend API** (Go):
_[GO code implementation removed - to be added during development]_

**Duplicate Detection**:
_[GO code implementation removed - to be added during development]_

---

## Account Deletion

### Immediate Deletion

**Backend API**:
_[GO code implementation removed - to be added during development]_

### Grace Period Deletion

**Mark for Deletion**:
_[GO code implementation removed - to be added during development]_

**Cron Job for Permanent Deletion**:
_[GO code implementation removed - to be added during development]_

**Account Recovery**:
_[GO code implementation removed - to be added during development]_

---

## API Endpoints

### Settings CRUD

```
GET    /api/settings                 - Get user settings
PUT    /api/settings                 - Update settings (global)
PUT    /api/settings/device          - Update device-specific settings
GET    /api/settings/sync            - Pull latest settings from cloud
```

### Notifications

```
POST   /api/notifications/schedule   - Schedule notification
DELETE /api/notifications/:id        - Cancel notification
GET    /api/notifications             - List scheduled notifications
```

### Security

```
POST   /api/security/pin              - Set PIN
PUT    /api/security/pin              - Change PIN (requires current PIN)
DELETE /api/security/pin              - Remove PIN
POST   /api/security/biometric        - Enable biometric
DELETE /api/security/biometric        - Disable biometric
```

### AI Memory

```
GET    /api/ai-memory                 - Get AI memory for user
DELETE /api/ai-memory                 - Clear AI memory
PUT    /api/ai-memory/story           - Update "Your Story"
```

### Data Management

```
POST   /api/export                    - Generate data export
GET    /api/export/:job_id/status     - Check export job status
POST   /api/import                    - Import data from JSON
```

### Account

```
DELETE /api/account                   - Delete account (with grace period option)
POST   /api/account/recover           - Recover deleted account
GET    /api/account/deletion-status   - Check deletion status
```

---

## Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Settings screen load | < 500ms | Cached locally, no API call |
| Theme change | < 100ms | Instant UI update, sync in background |
| Save setting | < 200ms | Optimistic UI, background sync |
| Notification schedule | < 1s | Platform API call |
| PIN verification | < 500ms | bcrypt comparison |
| Biometric auth | < 2s | Device API + fallback |
| AI memory fetch | < 1s | Cached with 5min TTL |
| Export generation | < 5s (< 1000 entries) | Background job for larger |
| Import validation | < 2s | File parsing + duplicate check |
| Account deletion | < 3s | Immediate, or grace period marker |

---

## Third-Party Libraries

### Frontend (Nuxt 3 + Capacitor)

**Core Framework**:
- `nuxt`: ^3.x - Meta-framework for Vue 3
- `vue`: ^3.x - Progressive JavaScript framework
- `@capacitor/core`: ^6.x - Native bridge
- `@capacitor/ios`: ^6.x - iOS platform
- `@capacitor/android`: ^6.x - Android platform

**Capacitor Plugins**:
- `@capacitor/preferences`: ^6.x - Local storage
- `@capacitor/secure-storage`: ^6.x - Encrypted storage (use Preferences with encryption wrapper)
- `@capacitor/local-notifications`: ^6.x - Notification scheduling
- `@capacitor/biometric-auth`: ^1.x - Biometric authentication
- `@capacitor/filesystem`: ^6.x - File export/import
- `@capacitor/share`: ^6.x - System share dialog

**State & UI**:
- `pinia`: ^2.x - State management
- `@nuxtjs/tailwindcss`: ^6.x - Styling
- `@nuxtjs/color-mode`: ^3.x - Theme management

### Backend

_[GO code implementation removed - to be added during development]_

### Python (AI Service)

```txt
# requirements.txt
transformers==4.30.0         # HuggingFace models
sentence-transformers==2.2.2 # Semantic search
pika==1.3.0                  # RabbitMQ consumer
```

---

**Last Updated**: November 23, 2025
