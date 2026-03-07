# ⚙️ Settings - Overview

## 🎯 Purpose

Provide users with comprehensive control over their app experience through a unified Settings screen. Enable customization of themes, notifications, security, AI features, and data management while maintaining transparency and privacy.

## 📊 Status

- **Current Status**: 🧠 Planned
- **Priority**: High (P0 for v1.0 basics, P1 for advanced features)
- **Target Release**: v1.0 (core settings), v1.2 (AI memory, advanced export)
- **Dependencies**: 
  - User Authentication (completed - biometric/PIN pattern established)
  - Journaling Feature (for AI memory source)
  - Learning Feature (for AI context)
  - Background sync patterns (offline-first)

## 🎨 User Value

- **Single access point**: All settings in one screen, accessed via avatar icon on Home
- **Account management**: Edit username, view email, manage account lifecycle
- **Personalization**: Customize theme, language, and app behavior
- **Privacy control**: Transparent AI usage toggles and data collection preferences
- **Data ownership**: Export journal backups, import data, selective deletion
- **Security**: App lock with PIN or biometric (aligns with login flow)
- **Smart notifications**: Customizable journaling reminders (morning/evening)
- **AI transparency**: View and clear how AI understands you

## 🏗️ Access Pattern

**Location**: Home screen → Avatar icon (top-right) → Settings screen

**Not in bottom navigation** - Settings is a destination screen, not a primary tab. Bottom nav reserved for: Home, Journal, Progress, Library.

**Screen Structure**:
```
┌─────────────────────────────────────┐
│  ← Settings                    [×]  │ ← Header
├─────────────────────────────────────┤
│  👤 Sarah Chen                      │ ← Account Section
│  sarah.chen@email.com               │   (Tap to edit username)
│  Member since Jan 2025              │
├─────────────────────────────────────┤
│  🔔 Notifications                   │ ← Sections (scrollable)
│  🔐 Security                         │
│  🎨 Personalization                 │
│  🤖 AI & Privacy                    │
│  💾 Data Management                 │
│  ℹ️  About & Support                │
│  🚪 Logout                           │
└─────────────────────────────────────┘
```

## 🔑 Key Features

### 👤 Account Section (Top of Settings)
- **Display**: Name, email, join date
- **Edit username**: Tap to change display name
- **Account status**: Subscription tier (if applicable)
- **Visual**: Avatar icon or initials

### 🔔 Notifications
- **Morning reminder**: Custom time (default 9:00 AM), toggle on/off
- **Evening reminder**: Custom time (default 9:00 PM), toggle on/off independently
- **Weekly summary**: Sunday evening notification (optional)
- **Platform-specific**: iOS Local Notifications, Android WorkManager

### 🔐 Security
- **App Lock**: Enable/disable (inherits from login: biometric OR PIN)
  - Biometric: Face ID, Touch ID, Fingerprint (device-dependent)
  - PIN Fallback: 4-6 digit code (if biometric unavailable or fails)
- **Auto-lock timeout**: Immediate, 1min, 5min (default), 15min, Never
- **Change PIN**: Requires current PIN verification
- **Forgot PIN Recovery**: Re-authenticate via biometric or account re-login (future: email recovery)

### 🎨 Personalization
- **Theme**: Light, Dark, Auto (follows system)
- **Language**: English (v1.0), more languages in v1.2+
- **Font size**: Small, Medium (default), Large (accessibility)
- **Reduce motion**: Minimize animations (accessibility)

### 🤖 AI & Privacy
- **AI Personalization Toggle**: Enable/disable AI-driven features (default: ON)
- **Your Story**: Text input (short self-description for AI context)
- **AI Memories**: View insights the AI has learned from journals
  - Shows: Categorized factual statements (values, habits, patterns, goals, etc.)
  - Actions: View list, delete individual memories (hard delete)
  - Generation: Periodic background job (every 12 hours)
  - Deduplication: Semantic similarity check prevents duplicate insights
  - Storage: PostgreSQL (CRUD) + Qdrant (RAG injection for personalized AI questions)
  - Location: Inside "About You" subpage, below Your Story
- **Data Collection**: Analytics opt-in/out

### 💾 Data Management
- **Export Data**: 
  - **Selective export**: Choose date range (Last 7 days, Last 30 days, Last 90 days, All time)
  - **Options dialog**: Include AI memory? Include learned lessons?
  - **Format**: JSON file (human-readable, import-compatible)
  - **Download**: One-time manual trigger
- **Import Backup**: 
  - **Merge strategy**: Combines with existing data (no overwrite)
  - **Validation**: Checks file format before import
- **Delete Account**:
  - **Warning dialog**: "Download data before deletion?" with Download button
  - **Grace period option**: Delete immediately OR 30-day grace period
  - **Scope**: Deletes all data (journals, lessons progress, AI memory, settings)
  - **GDPR compliance**: Data permanently deleted after grace period ends

### ℹ️ About & Support
- **App version**: Display current version
- **Privacy Policy**: Link to policy page
- **Terms of Service**: Link to terms
- **Contact Support**: Email or in-app form (future)
- **Licenses**: Open source acknowledgments

## 📋 Success Criteria

- [ ] Settings screen accessible from Home avatar icon
- [ ] Account info displayed and username editable
- [ ] Theme switcher works (light/dark/auto with smooth transition)
- [ ] Notification reminders can be scheduled independently (morning OR evening OR both)
- [ ] App lock inherits biometric/PIN from login flow
- [ ] Auto-lock timeout options functional
- [ ] Change PIN flow requires current PIN verification
- [ ] AI Memories shows categorized list of AI-extracted insights
- [ ] Individual memories can be deleted (hard delete, removes from PostgreSQL + Qdrant)
- [ ] Memories are auto-generated every 12 hours from new journal entries
- [ ] Duplicate memories are deduplicated via semantic similarity (≥ 0.85 threshold)
- [ ] Memories are injected into AI follow-up questions via Qdrant RAG
- [ ] "Your Story" text input saves to user context
- [ ] Data export dialog allows selective date ranges and options
- [ ] Export includes all selected data in valid JSON format
- [ ] Import merges data without overwriting existing entries
- [ ] Delete account shows download prompt and grace period options
- [ ] Settings sync across devices when online (global settings like theme/language)
- [ ] Device-specific settings remain local (notification times, auto-lock)

## 🔗 Related Features

- **[User Authentication](../01.%20User%20register/)** - Biometric/PIN pattern (PIN lock inherits from login flow)
- **[Journaling](../02.%20Jounral%20Feature/)** - AI memory data source, notification targets
- **[Micro Learning](../03.%20Micro%20learning/)** - AI context, optional export data
- **[Progress](../07.%20Progress/)** - Not directly linked (Progress is bottom nav, Settings is Home→Avatar)
- **[Database Schema](../00-DATABASE/)** - `user_informations.settings` JSONB, `ai_memory` table

## 📝 Notes

### Design Decisions

1. **Single Settings Screen (Not Profile + Settings)**
   - All account and preferences in one place
   - Account info at top (name, email, join date)
   - No separate "Profile" screen to maintain simplicity
   - Username editable directly from Settings

2. **Avatar Icon Access (Not Bottom Nav)**
   - Settings is a configuration destination, not a primary workflow
   - Bottom nav reserved for: Home, Journal, Progress, Library
   - Avatar icon on Home screen top-right provides clear access
   - Consistent with common mobile patterns (iOS Settings, etc.)

3. **PIN/Biometric Security Alignment**
   - **Inherits from login flow** (no duplicate setup)
   - If user registered with biometric → Settings offers "Enable App Lock" (biometric OR PIN)
   - If user registered with PIN → Settings offers "Enable App Lock" (PIN, optional biometric)
   - **Fallback**: Biometric failure → PIN prompt (if PIN set during registration)
   - **Forgot PIN**: Re-authenticate via biometric OR re-login to account
   - **Future**: Email/phone recovery for PIN reset

4. **Settings Sync Strategy**
   - **Global settings** (synced across devices): theme, language, AI enabled, "Your Story"
   - **Device-specific** (local only): notification times, auto-lock timeout, biometric enabled
   - Sync mechanism: Background task when online (similar to journal sync)
   - Conflict resolution: Last-write-wins for global settings, merge for device-specific

5. **AI Memories Transparency**
   - Displayed inside "About You" page (not a separate full-screen view)
   - Categorized into: values, habits, relationships, goals, struggles, preferences, patterns, growth
   - Each memory is a short factual statement (e.g., "I value my family.")
   - Users can delete individual memories (hard delete — AI may regenerate from future journals)
   - Generated periodically (every 12h) — NOT after each journal entry (reduces API costs)
   - Semantic deduplication prevents "I love my family" and "I value my family" from both existing
   - Dual storage: PostgreSQL (user CRUD) + Qdrant (RAG injection into AI follow-up questions)
   - "Your Story" provides manual context override (complementary to auto-generated memories)

6. **Data Export Flexibility**
   - **Selective export** (date range) to avoid huge files
   - **Options dialog** before export (include AI memory? learned lessons?)
   - JSON format for portability and human-readability
   - Example use cases:
     - Share last 30 days with therapist
     - Full backup before account deletion
     - Migrate to another app (future)

7. **Account Deletion Grace Period**
   - **User choice**: Immediate deletion OR 30-day grace period
   - Grace period allows data recovery if user changes mind
   - During grace period: Account locked, no login, but data retained
   - After grace period: Automatic permanent deletion (GDPR compliance)
   - **Download prompt**: Shows before deletion confirmation

### Settings Schema (JSONB)

Stored in `user_informations.settings`:

_[JSON code implementation removed - to be added during development]_

**Device-Specific Overrides** (stored locally, not synced):
_[JSON code implementation removed - to be added during development]_

### AI Memory Structure

Stored in separate `ai_memory` table (or JSONB field in `user_informations`):

_[JSON code implementation removed - to be added during development]_

**UI Display** (AI Memory Screen):
```
Your AI Memory

Last updated: Today at 10:30 AM
Based on 47 journal entries

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
You frequently journal about work stress 
and relationship challenges...

Common Themes:
• Work stress
• Relationships
• Anxiety management
• Mindfulness

Emotional Patterns:
Tend toward anxiety in mornings (6-10 AM).
More calm in evenings (8-10 PM)...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Clear AI Memory]  [Close]
```

### Notification System

**Morning Reminder**:
- Default: 9:00 AM (user customizable)
- Toggle: Can be disabled independently
- Message: "Good morning! Take a moment to reflect on your intentions for today."
- Platform: iOS Local Notifications, Android WorkManager

**Evening Reminder**:
- Default: 9:00 PM (user customizable)
- Toggle: Can be disabled independently
- Message: "How was your day? Spend a few minutes journaling before bed."
- Platform: iOS Local Notifications, Android WorkManager

**Weekly Summary**:
- Timing: Sunday evening (8:00 PM)
- Toggle: Optional (default ON)
- Message: "Your weekly summary is ready. See your emotional patterns and progress this week."
- Action: Deep link to Progress screen

**Device-Specific Times**:
- Notification times NOT synced across devices
- Example: Phone = 9 AM, Tablet = 10 AM
- Stored in local override settings

**No Learning Notifications** (v1.0):
- Only journaling-related notifications
- Learning is library-based, not notification-driven

### Data Export Format

**Export Dialog Options**:
```
Export Journal Data

📅 Date Range:
○ Last 7 days
○ Last 30 days
○ Last 90 days
● All time

📦 Include:
☑ Journal entries
☑ Emotion logs
☑ Sleep check data
☑ Learned lessons
☐ AI memory & context

[Cancel]  [Export]
```

**Exported JSON Structure**:
_[JSON code implementation removed - to be added during development]_

**File Naming**: `tranquara_backup_2025-11-23.json`

### Data Import Strategy

**Import Flow**:
1. User taps "Import Backup" in Settings
2. File picker opens (looking for `.json` files)
3. Validation checks:
   - Valid JSON format
   - Tranquara export structure
   - Compatible version
4. Conflict resolution: **Merge strategy**
   - New entries added
   - Existing entries kept (no overwrite)
   - Duplicate detection by `id` or `created_at + content hash`
5. Success summary: "Imported 45 journals, 12 lessons, 0 duplicates skipped"

**Merge Example**:
```
Existing data:
- Journal A (2025-11-20)
- Journal B (2025-11-21)

Import file:
- Journal B (2025-11-21) ← Duplicate, skipped
- Journal C (2025-11-22) ← New, imported

Result:
- Journal A, Journal B, Journal C
```

### Language Support (i18n)

**Phase 1 (v1.0)**: English only  
**Phase 2 (v1.2+)**: Add languages
- Spanish (es)
- French (fr)
- German (de)
- Japanese (ja)
- Chinese Simplified (zh-CN)
- Portuguese (pt-BR)

**Implementation**: 
- `react-i18next` (mobile/web)
- Translation files: `locales/{lang}/translation.json`
- System language detection with manual override
- RTL support for future Arabic/Hebrew

### Account Deletion Flow

**Step 1: Delete Account Button** (in Settings → Data Management)
```
⚠️ Delete Account

This will permanently delete all your data:
• Journal entries
• Learning progress
• AI memory
• Account settings

[Cancel]  [Continue]
```

**Step 2: Download Prompt**
```
Download Your Data First?

We recommend downloading your data before
deleting your account. This cannot be undone.

[Skip]  [Download & Continue]
```

**Step 3: Grace Period Choice**
```
Choose Deletion Timeline

○ Delete immediately
  Your data will be deleted now and cannot
  be recovered.

● 30-day grace period (recommended)
  Your account will be locked, but you can
  recover it within 30 days by contacting
  support.

[Cancel]  [Confirm Deletion]
```

**Step 4: Final Confirmation**
```
Enter your username to confirm:
[________________]

[Cancel]  [Delete Account]
```

**Step 5: Deletion Process**
- If immediate: Delete all data from database + local storage
- If grace period: 
  - Mark account as `deleted_at = NOW()`
  - Lock account (no login)
  - Schedule permanent deletion after 30 days
  - Send confirmation email (if email on file)

**GDPR Compliance**:
- Data fully deleted after grace period
- Deletion confirmed via email
- Export available before deletion
- No data retention after permanent deletion

### Future Enhancements

- [ ] Profile photo/avatar upload
- [ ] Custom notification sounds
- [ ] Multiple daily reminder times
- [ ] Notification templates (different messages)
- [ ] Advanced accessibility (screen reader optimization, voice control)
- [ ] Dark mode scheduling (auto at sunset/sunrise based on location)
- [ ] Haptic feedback controls
- [ ] Sharing settings with therapist (secure, consent-based)
- [ ] Automated backups (daily/weekly to cloud storage)
- [ ] Two-factor authentication (2FA)
- [ ] Passkey support
- [ ] Email/SMS for PIN recovery
- [ ] AI memory editing (not just clear)
- [ ] Custom AI "personality" settings

---

**Last Updated**: November 23, 2025
