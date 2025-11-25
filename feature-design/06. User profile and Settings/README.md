# ⚙️ Settings Feature

> Unified control center for account, preferences, security, AI features, and data management

---

## 📑 Core Documentation

| File | Description |
|------|-------------|
| **[00-OVERVIEW.md](./00-OVERVIEW.md)** | Feature purpose, access pattern, design decisions, and settings schema |
| **[01-SETTINGS-FLOWS.md](./01-SETTINGS-FLOWS.md)** | 14 user flows with Mermaid diagrams (theme, PIN, AI memory, export, delete account) |
| **[02-TECHNICAL-SPEC.md](./02-TECHNICAL-SPEC.md)** | Settings sync, notifications, PIN/biometric security, AI memory, export/import |
| **[03-DATA-MODELS.md](./03-DATA-MODELS.md)** | Database schemas, local storage, secure storage, and sample queries |

---

## 🎯 Quick Summary

**Status**: 🧠 Planned (P0 for v1.0)  
**Priority**: High  
**Target**: v1.0 (core settings), v1.2 (AI memory, advanced export)

### What This Feature Does

Users can:
- **Access Settings** via avatar icon on Home screen (top-right) → Single settings screen
- **Manage Account**: Edit username, view email/join date, logout
- **Customize Experience**: Change theme (light/dark/auto), language, font size, reduce motion
- **Set Notifications**: Independent morning/evening reminders with custom times, weekly summary
- **Secure App**: Enable app lock with PIN or biometric (inherits from login flow)
- **Control AI**: Toggle AI personalization, view AI memory, provide "Your Story" context
- **Privacy Management**: Opt-in/out of data collection, analytics, crash reports
- **Export/Import Data**: Selective date range export, merge-based import (no overwrite)
- **Delete Account**: Immediate or 30-day grace period with recovery option

### Design Philosophy

- **Single Settings Screen** (not separate Profile): All preferences in one place, account info at top
- **Avatar Icon Access** (not bottom nav): Settings is a destination, not a primary workflow
- **Global vs Device-Specific**: Theme/language sync across devices, notification times stay local
- **PIN/Biometric Alignment**: Inherits security pattern from User Authentication feature
- **AI Transparency**: View and clear AI-generated memory, optional "Your Story" manual context
- **Data Ownership**: Flexible export options, merge-based import, GDPR-compliant deletion

---

## 🗂️ Access Pattern

**Location**: Home screen → Avatar icon (top-right) → Settings screen

**Not in Bottom Navigation**: Bottom nav reserved for Home, Journal, Progress, Library

**Screen Layout**:
```
┌─────────────────────────────────────┐
│  ← Settings                    [×]  │
├─────────────────────────────────────┤
│  👤 Sarah Chen                      │ ← Account (tap to edit username)
│  sarah.chen@email.com               │
│  Member since Jan 2025              │
├─────────────────────────────────────┤
│  🔔 Notifications                   │
│  🔐 Security                         │
│  🎨 Personalization                 │
│  🤖 AI & Privacy                    │
│  💾 Data Management                 │
│  ℹ️  About & Support                │
│  🚪 Logout                           │
└─────────────────────────────────────┘
```

---

## ⚙️ Settings Sections

### 👤 Account (Top of Screen)
- **Display**: Name, email, join date
- **Edit**: Tap username to change display name
- **No separate profile screen** - all info in Settings

### 🔔 Notifications
- **Morning Reminder**: Custom time (default 9 AM), toggle on/off independently
- **Evening Reminder**: Custom time (default 9 PM), toggle on/off independently  
- **Weekly Summary**: Sunday 8 PM, progress report deep link
- **Device-Specific**: Times NOT synced (Phone = 9 AM, Tablet = 10 AM allowed)

### 🔐 Security
- **App Lock**: Enable/disable (uses PIN or biometric from login flow)
- **Biometric**: Face ID, Touch ID, Fingerprint (device-dependent)
- **PIN Fallback**: 4-6 digit code if biometric unavailable
- **Auto-Lock Timeout**: Immediate, 1min, 5min (default), 15min, Never
- **Change PIN**: Requires current PIN verification
- **Forgot PIN**: Re-authenticate via biometric or account login

### 🎨 Personalization
- **Theme**: Light, Dark, Auto (follows system) with smooth 300ms transition
- **Language**: English (v1.0), more languages in v1.2+ (es, fr, de, ja, zh-CN)
- **Font Size**: Small, Medium (default), Large (accessibility)
- **Reduce Motion**: Minimize animations (accessibility)

### 🤖 AI & Privacy
- **AI Personalization Toggle**: Enable/disable AI-driven features (default: ON)
- **Your Story**: Text input for manual AI context (optional)
- **View AI Memory**: Full-screen view showing AI's understanding (summary, themes, patterns, goals)
  - **Actions**: View only, Clear memory button
  - **Update**: Background task after each journal entry
  - **Confidence**: Based on journal count (5 = 30%, 20 = 60%, 50+ = 95%)
- **Data Collection**: Analytics opt-in/out
- **Crash Reports**: Diagnostic data sharing

### 💾 Data Management
- **Export Data**:
  - Selective date range (Last 7/30/90 days, All time)
  - Options dialog: Include AI memory? Include lessons?
  - Format: JSON (human-readable, import-compatible)
  - Large exports (> 1000 entries): Background job + notification
- **Import Backup**:
  - Merge strategy (no overwrite, skip duplicates)
  - Validation: File format, version compatibility
- **Delete Account**:
  - Download prompt before deletion
  - Choice: Immediate or 30-day grace period
  - Grace period: Account locked, data retained, recovery via email link
  - GDPR: Permanent deletion after grace period ends

### ℹ️ About & Support
- App version, Privacy Policy, Terms of Service, Contact Support, Open Source Licenses

---

## 🔧 Technology

### Frontend
- **Framework**: Nuxt 3 + Vue 3 + Capacitor
- **Capacitor Plugins**: 
  - `@capacitor/local-notifications` - Notification scheduling
  - `@capacitor/biometric-auth` - Biometric authentication
  - `@capacitor/secure-storage` - Encrypted storage (use Preferences with encryption)
  - `@capacitor/preferences` - Local storage
- **State Management**: Pinia (settings store, theme store)
- **i18n**: `@nuxtjs/i18n` for multi-language support
- **Security**: `bcryptjs` for PIN hashing

### Backend
- **API**: Go (Gin framework) for REST endpoints
- **Database**: PostgreSQL with JSONB for settings flexibility
- **Notifications**: iOS Local Notifications, Android WorkManager
- **Sync**: RabbitMQ for background tasks, WebSocket for real-time updates (optional)
- **Export**: Server-side JSON generation, S3 for large file storage
- **Cron Jobs**: Account deletion cleanup, export file expiration

### AI Service
- **Worker**: Python FastAPI + RabbitMQ consumer
- **Models**: HuggingFace transformers (summarization, sentiment analysis)
- **Caching**: Redis (5-minute TTL for AI memory)

---

## 🔗 Related Features

- **[User Authentication](../01.%20User%20register/)** - PIN/biometric pattern inherited, forgot PIN recovery
- **[Journaling](../02.%20Jounral%20Feature/)** - AI memory data source, notification targets
- **[Micro Learning](../03.%20Micro%20learning/)** - AI context for recommendations, optional export data
- **[Progress](../07.%20Progress/)** - Weekly summary notification deep links here
- **[Home Screen](../00-HOME/)** - Avatar icon access point for Settings

---

## 🚀 Implementation Status

**Core Files Created:**
- [x] 00-OVERVIEW.md - Feature purpose, access pattern, design decisions
- [x] 01-SETTINGS-FLOWS.md - 14 user flows with Mermaid diagrams
- [x] 02-TECHNICAL-SPEC.md - Sync, notifications, security, AI, export/import
- [x] 03-DATA-MODELS.md - PostgreSQL + local storage schemas
- [x] README.md - Feature summary and navigation

**Feature Checklist:**

**v1.0 (Core Settings)**
- [ ] Settings screen UI with avatar icon access from Home
- [ ] Account section: Display name, email, join date (username editable)
- [ ] Theme switcher (light/dark/auto) with system detection
- [ ] Notification scheduling (morning/evening/weekly, independent toggles)
- [ ] App lock (PIN or biometric, inherits from login flow)
- [ ] Auto-lock timeout options
- [ ] Change PIN flow with current PIN verification
- [ ] Settings sync (global settings to cloud, device-specific local)
- [ ] Logout functionality

**v1.1 (AI & Privacy)**
- [ ] AI personalization toggle
- [ ] "Your Story" text input
- [ ] AI memory generation (background worker after journal entry)
- [ ] AI Memory viewer screen (full-screen, view/clear actions)
- [ ] Data collection toggles (analytics, crash reports)
- [ ] Privacy policy and terms links

**v1.2 (Data Management)**
- [ ] Export dialog with date range and options
- [ ] JSON export generation (immediate for small, background for large)
- [ ] Export job status polling
- [ ] Import validation and merge logic
- [ ] Duplicate detection (by ID or content hash)
- [ ] Delete account flow (download prompt, grace period option)
- [ ] Account recovery within grace period
- [ ] Cron job for permanent deletion

**v1.3 (Advanced)**
- [ ] Language selector (i18n setup for es, fr, de, ja, zh-CN)
- [ ] Font size settings
- [ ] Reduce motion toggle
- [ ] Notification permission handling
- [ ] Biometric availability check
- [ ] Forgot PIN recovery (email/SMS future enhancement)
- [ ] Export to S3 for large files
- [ ] Notification deep links to app screens

---

## � Key Metrics to Track

**Usage:**
- Settings screen visit rate (% of sessions)
- Most changed settings (theme, notifications, etc.)
- AI personalization opt-in rate (target: > 70%)
- App lock adoption rate

**Engagement:**
- AI Memory viewer open rate
- "Your Story" completion rate
- Export feature usage (% of users)
- Import feature usage

**Privacy:**
- Analytics opt-out rate (transparency metric)
- AI personalization disable rate
- Account deletion rate

**Performance:**
- Settings screen load time (target: < 500ms)
- Theme change latency (target: < 100ms)
- Export generation time (target: < 5s for < 1000 entries)
- Import merge time (target: < 3s validation + merge)

---

## 📱 UI Preview (Conceptual)

**Settings Screen**:
```
┌─────────────────────────────────────┐
│  ← Settings                         │
├─────────────────────────────────────┤
│  👤 Sarah Chen              [Edit]  │
│  sarah.chen@email.com               │
│  Member since January 2025          │
├─────────────────────────────────────┤
│  🔔 Notifications              →    │
│     Morning, Evening reminders      │
│                                     │
│  🔐 Security                   →    │
│     App lock, PIN, Biometric        │
│                                     │
│  🎨 Personalization            →    │
│     Theme: Dark                     │
│                                     │
│  🤖 AI & Privacy               →    │
│     AI enabled • View memory        │
│                                     │
│  💾 Data Management            →    │
│     Export, Import, Delete account  │
│                                     │
│  ℹ️  About & Support            →    │
│                                     │
├─────────────────────────────────────┤
│  🚪 Logout                          │
└─────────────────────────────────────┘
```

**AI Memory Screen**:
```
┌─────────────────────────────────────┐
│  ← AI Memory                        │
├─────────────────────────────────────┤
│  Last updated: Today at 10:30 AM    │
│  Based on 47 journal entries        │
│  Confidence: 85%                    │
├─────────────────────────────────────┤
│  Summary:                           │
│  You frequently journal about work  │
│  stress and relationship challenges.│
│  Shows strong interest in           │
│  mindfulness practices...           │
│                                     │
│  Common Themes:                     │
│  • Work stress                      │
│  • Relationships                    │
│  • Anxiety management               │
│  • Mindfulness                      │
│                                     │
│  Emotional Patterns:                │
│  Tend toward anxiety in mornings    │
│  (6-10 AM). More calm in evenings   │
│  (8-10 PM)...                       │
│                                     │
│  Therapy Goals:                     │
│  • Manage work-related anxiety      │
│  • Improve communication            │
│  • Develop mindfulness practice     │
├─────────────────────────────────────┤
│  [Clear AI Memory]      [Close]     │
└─────────────────────────────────────┘
```

---

## � Future Enhancements

- [ ] Profile photo/avatar upload
- [ ] Sharing settings with therapist (secure, consent-based)
- [ ] Automated backups (daily/weekly to cloud storage)
- [ ] Two-factor authentication (2FA)
- [ ] Passkey support for cross-device auth
- [ ] Email/SMS for PIN recovery
- [ ] AI memory editing (not just view/clear)
- [ ] Custom AI "personality" settings
- [ ] Multiple daily reminder times
- [ ] Custom notification sounds
- [ ] Notification templates (different messages)
- [ ] Dark mode scheduling (auto at sunset/sunrise)
- [ ] Haptic feedback controls
- [ ] Voice-over summary (accessibility)

---

**Last Updated**: November 23, 2025
