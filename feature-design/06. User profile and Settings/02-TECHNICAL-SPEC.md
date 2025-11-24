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
├── UI Layer (React Native/Web)
│   ├── SettingsScreen.tsx          - Main settings container
│   ├── AccountSection.tsx           - Name, email, join date
│   ├── NotificationSettings.tsx     - Morning/evening reminders
│   ├── SecuritySettings.tsx         - PIN, biometric, auto-lock
│   ├── PersonalizationSettings.tsx  - Theme, language, font
│   ├── AIPrivacySettings.tsx        - AI toggle, Your Story, memory viewer
│   ├── DataManagementSettings.tsx   - Export, import, delete
│   └── AIMemoryScreen.tsx           - Full-screen AI memory view
│
├── State Management (Zustand/Context)
│   ├── useSettingsStore.ts          - Global settings state
│   ├── useThemeStore.ts             - Theme state + system detection
│   └── useNotificationStore.ts      - Notification permissions + schedule
│
├── Services
│   ├── SettingsService.ts           - CRUD for settings
│   ├── SyncService.ts               - Background sync to cloud
│   ├── NotificationService.ts       - Schedule/cancel notifications
│   ├── SecurityService.ts           - PIN hashing, biometric auth
│   ├── ExportService.ts             - Generate JSON exports
│   ├── ImportService.ts             - Validate and merge imports
│   └── AIMemoryService.ts           - Fetch/clear AI memory
│
└── Storage
    ├── LocalStorage (SQLite/IndexedDB)
    │   ├── settings_global            - Synced settings (theme, language)
    │   ├── settings_local             - Device-specific (notification times)
    │   └── ai_memory_cache            - Cached AI memory
    │
    └── SecureStore (Keychain/Keystore)
        ├── pin_hash                   - Hashed PIN
        ├── biometric_enabled          - Boolean flag
        └── access_token               - User session token
```

---

## Settings Sync Strategy

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
- **iOS**: Respects system theme via `Appearance.getColorScheme()`
- **Android**: Respects system theme via `Appearance.getColorScheme()`
- **Web**: Respects system theme via `window.matchMedia('(prefers-color-scheme: dark)')`

---

## Notification Scheduling

### Platform Implementation

**iOS (Local Notifications)**:
_[TYPESCRIPT code implementation removed - to be added during development]_

**Android (WorkManager)**:
_[KOTLIN code implementation removed - to be added during development]_

**Weekly Summary Notification**:
_[TYPESCRIPT code implementation removed - to be added during development]_

### Notification Permissions

**Check and Request**:
_[TYPESCRIPT code implementation removed - to be added during development]_

---

## Security: PIN & Biometric

### PIN Implementation

**Hashing Algorithm** (bcrypt):
_[TYPESCRIPT code implementation removed - to be added during development]_

### Biometric Authentication

**iOS/Android (LocalAuthentication)**:
_[TYPESCRIPT code implementation removed - to be added during development]_

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

### Frontend

_[JSON code implementation removed - to be added during development]_

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
