# ⚙️ Settings - User Flows

This document outlines all user journeys within the Settings feature, showing how users interact with account management, personalization, security, AI features, and data controls.

---

## Flow Index

1. [Access Settings Screen](#1-access-settings-screen)
2. [Edit Username](#2-edit-username)
3. [Change Theme](#3-change-theme)
4. [Enable/Disable Morning Reminder](#4-enabledisable-morning-reminder)
5. [Enable App Lock (PIN)](#5-enable-app-lock-pin)
6. [Enable App Lock (Biometric)](#6-enable-app-lock-biometric)
7. [Change PIN](#7-change-pin)
8. [View AI Memory](#8-view-ai-memory)
9. [Update "Your Story"](#9-update-your-story)
10. [Export Journal Data](#10-export-journal-data)
11. [Import Backup](#11-import-backup)
12. [Delete Account](#12-delete-account)
13. [Toggle AI Personalization](#13-toggle-ai-personalization)
14. [Logout](#14-logout)

---

## 1. Access Settings Screen

**Trigger**: User taps avatar icon on Home screen  
**Goal**: Navigate to Settings

```mermaid
graph TD
    A[Home Screen] --> B{Tap Avatar Icon<br/>Top-Right}
    B --> C[Settings Screen Loads]
    C --> D[Display Account Info]
    D --> E[Show Settings Sections:<br/>Notifications, Security,<br/>Personalization, AI, Data]
    E --> F[User Scrolls/Taps Options]
```

**Success Criteria**:
- Settings screen opens in < 500ms
- Account info displayed (name, email, join date)
- All sections visible and accessible

---

## 2. Edit Username

**Trigger**: User taps on their name in Settings  
**Goal**: Change display name

```mermaid
graph TD
    A[Settings Screen] --> B{Tap Username<br/>'Sarah Chen'}
    B --> C[Show Edit Dialog]
    C --> D[Text Input Focused<br/>Current: 'Sarah Chen']
    D --> E{User Types New Name}
    E --> F[Validate:<br/>3-30 chars, alphanumeric]
    F --> G{Valid?}
    G -->|Yes| H[Save to Database]
    G -->|No| I[Show Error:<br/>'Invalid username']
    H --> J[Update UI]
    J --> K[Show Toast:<br/>'Username updated']
    I --> D
```

**Edge Cases**:
- Empty input → "Username required"
- Too short (< 3 chars) → "Minimum 3 characters"
- Too long (> 30 chars) → "Maximum 30 characters"
- Special characters → "Only letters, numbers, underscores"

---

## 3. Change Theme

**Trigger**: User taps theme option in Personalization section  
**Goal**: Switch between Light/Dark/Auto themes

```mermaid
graph TD
    A[Settings Screen] --> B{Tap 'Theme'}
    B --> C[Show Theme Options]
    C --> D[○ Light<br/>○ Dark<br/>● Auto]
    D --> E{User Selects Theme}
    E --> F{Theme Choice}
    F -->|Light| G[Apply Light Theme]
    F -->|Dark| H[Apply Dark Theme]
    F -->|Auto| I[Detect System Theme]
    G --> J[Save to settings.personalization.theme]
    H --> J
    I --> J
    J --> K[Smooth Transition<br/>300ms fade]
    K --> L[Update All Screens]
    L --> M[Sync to Cloud<br/>Background Task]
```

**Success Criteria**:
- Theme change visible immediately
- Smooth transition (no flash)
- Persists after app restart
- Syncs across devices

---

## 4. Enable/Disable Morning Reminder

**Trigger**: User toggles morning reminder switch  
**Goal**: Enable or disable morning journal notification

```mermaid
graph TD
    A[Settings Screen] --> B{Tap Notifications Section}
    B --> C[Show Notification Settings]
    C --> D[Morning Reminder: ON/OFF<br/>Time: 09:00 AM]
    D --> E{Toggle Switch}
    E --> F{New State}
    F -->|Enable| G[Show Time Picker]
    F -->|Disable| H[Cancel Scheduled Notification]
    G --> I{User Selects Time}
    I --> J[Save: morning_enabled=true<br/>morning_time='09:00']
    J --> K[Schedule iOS/Android Notification]
    K --> L[Show Toast:<br/>'Morning reminder set for 9:00 AM']
    H --> M[Save: morning_enabled=false]
    M --> N[Show Toast:<br/>'Morning reminder disabled']
```

**Platform-Specific**:
- **iOS**: `UNUserNotificationCenter` for local notifications
- **Android**: `WorkManager` for reliable scheduling
- **Web**: Browser notifications (optional, lower priority)

**Edge Cases**:
- Notification permission denied → "Enable notifications in device settings"
- Time picker cancelled → Revert to previous time

---

## 5. Enable App Lock (PIN)

**Trigger**: User enables app lock and chooses PIN  
**Goal**: Secure app with 4-6 digit PIN code

```mermaid
graph TD
    A[Settings Screen] --> B{Tap Security Section}
    B --> C[Show Security Settings]
    C --> D[App Lock: OFF]
    D --> E{Toggle App Lock ON}
    E --> F[Show Security Options]
    F --> G{Device Biometric<br/>Available?}
    G -->|No| H[PIN Setup Screen]
    G -->|Yes| I[User Chooses:<br/>Biometric or PIN]
    I -->|PIN| H
    H --> J[Enter PIN:<br/>4-6 digits]
    J --> K{Valid PIN?}
    K -->|No| L[Show Error:<br/>'PIN must be 4-6 digits']
    L --> J
    K -->|Yes| M[Re-enter PIN<br/>Confirm]
    M --> N{PINs Match?}
    N -->|No| O[Show Error:<br/>'PINs do not match']
    O --> J
    N -->|Yes| P[Hash PIN:<br/>bcrypt/scrypt]
    P --> Q[Store in SecureStore:<br/>pin_hash]
    Q --> R[Save: security.app_lock_enabled=true]
    R --> S[Show Success:<br/>'App lock enabled']
```

**Security Notes**:
- PIN hashed before storage (bcrypt)
- Stored in device Keychain (iOS) / Keystore (Android)
- Never transmitted to server
- Inherits from registration flow pattern

---

## 6. Enable App Lock (Biometric)

**Trigger**: User enables app lock with Face ID/Touch ID  
**Goal**: Secure app with biometric authentication

```mermaid
graph TD
    A[Settings Screen] --> B{Toggle App Lock ON}
    B --> C{Device Supports<br/>Biometric?}
    C -->|No| D[Redirect to PIN Setup]
    C -->|Yes| E[Show Prompt:<br/>'Authenticate with Face ID']
    E --> F[Trigger Biometric<br/>LocalAuthentication API]
    F --> G{Authentication<br/>Result}
    G -->|Success| H[Save: security.biometric_enabled=true]
    G -->|Failed| I[Show Error:<br/>'Authentication failed']
    G -->|Not Enrolled| J[Show Error:<br/>'Set up Face ID in Settings']
    H --> K[Set Auto-Lock Timeout<br/>Default: 5 minutes]
    K --> L[Show Success:<br/>'App lock enabled with Face ID']
    I --> M{Retry or Use PIN?}
    M -->|Retry| F
    M -->|PIN| D
    J --> N[Open Device Settings<br/>Deep Link]
```

**Platform Differences**:
- **iOS**: Face ID, Touch ID
- **Android**: Fingerprint, Face unlock
- **Fallback**: PIN if biometric fails 3 times

---

## 7. Change PIN

**Trigger**: User taps "Change PIN" in Security settings  
**Goal**: Update existing PIN code

```mermaid
graph TD
    A[Security Settings] --> B{Tap 'Change PIN'}
    B --> C[Prompt: Enter Current PIN]
    C --> D{Verify Current PIN}
    D -->|Incorrect| E[Show Error:<br/>'Incorrect PIN'<br/>Attempts: 2/3]
    E --> F{Attempts < 3?}
    F -->|Yes| C
    F -->|No| G[Lock for 30 seconds<br/>'Too many attempts']
    D -->|Correct| H[Prompt: Enter New PIN]
    H --> I{Valid New PIN?}
    I -->|No| J[Show Error:<br/>'4-6 digits required']
    J --> H
    I -->|Yes| K[Prompt: Confirm New PIN]
    K --> L{PINs Match?}
    L -->|No| M[Show Error:<br/>'PINs do not match']
    M --> H
    L -->|Yes| N[Hash New PIN]
    N --> O[Update SecureStore:<br/>pin_hash]
    O --> P[Show Success:<br/>'PIN changed']
```

**Security Features**:
- Requires current PIN verification
- 3-attempt limit (locks for 30s after)
- New PIN must be different from old
- No "Forgot PIN" option (requires re-authentication)

---

## 8. View AI Memory

**Trigger**: User taps "View AI Memory" in AI & Privacy section  
**Goal**: See how AI understands user based on journals

```mermaid
graph TD
    A[Settings Screen] --> B{Tap 'AI & Privacy'}
    B --> C[Show AI Settings]
    C --> D[View AI Memory Button]
    D --> E{Tap 'View AI Memory'}
    E --> F[Navigate to<br/>AI Memory Screen]
    F --> G[Fetch AI Memory<br/>GET /api/ai-memory]
    G --> H{Memory Exists?}
    H -->|No| I[Show Empty State:<br/>'Start journaling to<br/>build AI context']
    H -->|Yes| J[Display Memory:<br/>Summary, Themes,<br/>Patterns, Goals]
    J --> K[Show Update Info:<br/>'Last updated: Today 10:30 AM<br/>Based on 47 journals']
    K --> L{User Action}
    L -->|Clear Memory| M[Show Confirmation:<br/>'Delete AI memory?<br/>Journals remain intact']
    L -->|Close| N[Return to Settings]
    M --> O{Confirm?}
    O -->|Yes| P[DELETE /api/ai-memory]
    O -->|No| K
    P --> Q[Clear Memory Data]
    Q --> R[Show Toast:<br/>'AI memory cleared']
    R --> N
```

**AI Memory Content**:
- Summary paragraph
- Common themes (work_stress, relationships)
- Emotional patterns (anxiety in mornings)
- Therapy goals
- Last updated timestamp
- Journal count analyzed

**Privacy Notes**:
- Clearing memory does NOT delete journals
- Memory regenerates after next journal entry
- User can disable AI entirely to stop generation

---

## 9. Update "Your Story"

**Trigger**: User taps "Your Story" field in AI & Privacy  
**Goal**: Provide manual context for AI personalization

```mermaid
graph TD
    A[AI & Privacy Settings] --> B[Show 'Your Story' Field]
    B --> C[Current Text:<br/>'I'm working through<br/>anxiety...']
    C --> D{Tap to Edit}
    D --> E[Text Input Opens<br/>Multiline, 500 char limit]
    E --> F{User Types}
    F --> G[Live Character Count:<br/>'245/500']
    G --> H{Save Action}
    H -->|Cancel| I[Discard Changes<br/>Return to Settings]
    H -->|Save| J{Text Changed?}
    J -->|No| I
    J -->|Yes| K[Validate:<br/>0-500 characters]
    K --> L{Valid?}
    L -->|No| M[Show Error:<br/>'Max 500 characters']
    L -->|Yes| N[Save to Database:<br/>ai_privacy.your_story]
    N --> O[Trigger AI Context Update<br/>Background Task]
    O --> P[Show Toast:<br/>'Your story updated']
    P --> I
```

**Use Cases**:
- "I'm preparing for my first therapy session"
- "Dealing with recent job loss and career transition"
- "Managing anxiety from childhood trauma"

**AI Impact**:
- Used as primary context for AI responses
- Overrides or supplements auto-generated memory
- Helps AI tailor suggestions and questions

---

## 10. Export Journal Data

**Trigger**: User taps "Export Data" in Data Management  
**Goal**: Download journal backup as JSON file

```mermaid
graph TD
    A[Settings Screen] --> B{Tap 'Data Management'}
    B --> C[Show Data Options]
    C --> D{Tap 'Export Data'}
    D --> E[Show Export Dialog]
    E --> F[Date Range Options:<br/>○ Last 7 days<br/>○ Last 30 days<br/>○ Last 90 days<br/>● All time]
    F --> G[Include Checkboxes:<br/>☑ Journals<br/>☑ Emotions<br/>☑ Sleep data<br/>☑ Learned lessons<br/>☐ AI memory]
    G --> H{Tap 'Export'}
    H --> I[Show Loading:<br/>'Preparing export...']
    I --> J[Backend: Generate JSON<br/>POST /api/export]
    J --> K{Export Ready}
    K -->|Success| L[Download File:<br/>tranquara_backup_2025-11-23.json]
    K -->|Error| M[Show Error:<br/>'Export failed. Try again.']
    L --> N[Show Success:<br/>'Export complete. 1.2 MB downloaded']
    N --> O{User Action}
    O -->|Open File| P[OS File Manager]
    O -->|Share| Q[Share Dialog:<br/>Email, Cloud, etc.]
    O -->|Done| R[Return to Settings]
```

**Export Performance**:
- Small exports (< 100 entries): Immediate download
- Large exports (> 1000 entries): Background job + notification when ready
- Max file size: 50 MB (compress if larger)

**File Format**:
_[JSON code implementation removed - to be added during development]_

---

## 11. Import Backup

**Trigger**: User taps "Import Backup" in Data Management  
**Goal**: Restore journal data from JSON file

```mermaid
graph TD
    A[Settings Screen] --> B{Tap 'Import Backup'}
    B --> C[Show File Picker<br/>Filter: .json files]
    C --> D{User Selects File}
    D --> E[Read File Contents]
    E --> F[Validate JSON Structure]
    F --> G{Valid Format?}
    G -->|No| H[Show Error:<br/>'Invalid file format']
    G -->|Yes| I[Check Version Compatibility]
    I --> J{Compatible?}
    J -->|No| K[Show Error:<br/>'Unsupported export version']
    J -->|Yes| L[Show Import Preview:<br/>'Found: 45 journals,<br/>12 lessons, 8 emotions']
    L --> M[Merge Strategy Info:<br/>'Existing data will be kept.<br/>Duplicates skipped.']
    M --> N{Tap 'Import'}
    N --> O[Show Progress:<br/>'Importing... 20/45']
    O --> P[Backend: Merge Data<br/>POST /api/import]
    P --> Q[Duplicate Detection:<br/>By ID or content hash]
    Q --> R{Import Complete}
    R -->|Success| S[Show Summary:<br/>'Imported 45 journals<br/>Skipped 2 duplicates']
    R -->|Partial| T[Show Warning:<br/>'Imported 43/45<br/>2 failed validation']
    R -->|Error| U[Show Error:<br/>'Import failed. Data intact.']
    S --> V[Trigger Sync<br/>Update Progress Metrics]
    V --> W[Return to Settings]
```

**Validation Checks**:
- Valid JSON syntax
- Required fields present (export_metadata, user, journals)
- Export version compatibility (v1.0, v1.1 supported)
- User ID matches or is remapped

**Merge Logic**:
- Existing journal with same ID → Skip import
- New journal → Add to database
- Conflict resolution: Keep existing data (no overwrite)

---

## 12. Delete Account

**Trigger**: User taps "Delete Account" in Data Management  
**Goal**: Permanently delete account and all data

```mermaid
graph TD
    A[Settings Screen] --> B{Tap 'Delete Account'}
    B --> C[Show Warning Dialog:<br/>'⚠️ This will permanently<br/>delete all your data']
    C --> D{Tap 'Continue'<br/>or Cancel}
    D -->|Cancel| E[Return to Settings]
    D -->|Continue| F[Show Download Prompt:<br/>'Download data first?']
    F --> G{User Choice}
    G -->|Skip| H[Show Grace Period Options]
    G -->|Download| I[Trigger Export Flow]
    I --> J[Wait for Download]
    J --> H
    H --> K[Grace Period Dialog:<br/>○ Delete immediately<br/>● 30-day grace period]
    K --> L{User Selects}
    L --> M[Show Final Confirmation:<br/>'Enter username to confirm']
    M --> N{Type Username}
    N --> O{Username Correct?}
    O -->|No| P[Show Error:<br/>'Username does not match']
    P --> N
    O -->|Yes| Q[Tap 'Delete Account']
    Q --> R{Grace Period?}
    R -->|Immediate| S[DELETE /api/account<br/>immediate=true]
    R -->|30 days| T[POST /api/account/delete<br/>grace_period=30]
    S --> U[Delete All Data:<br/>Journals, Progress,<br/>AI Memory, Settings]
    U --> V[Clear Local Storage]
    V --> W[Show Success:<br/>'Account deleted']
    W --> X[Redirect to<br/>Welcome Screen]
    T --> Y[Mark Account:<br/>deleted_at = NOW()]
    Y --> Z[Lock Account<br/>No Login]
    Z --> AA[Schedule Deletion:<br/>30 days from now]
    AA --> AB[Send Email:<br/>'Recovery link valid<br/>until Dec 23, 2025']
    AB --> AC[Show Success:<br/>'Account will be deleted<br/>on Dec 23, 2025']
    AC --> X
```

**Grace Period Recovery**:
- User receives email with recovery link
- Clicking link → "Recover Account?" dialog
- Confirm → Account reactivated, `deleted_at` cleared
- After 30 days → Automatic permanent deletion cron job

**GDPR Compliance**:
- All data deleted from database
- Backups purged within 90 days
- Deletion confirmation email sent
- No data retention after permanent deletion

---

## 13. Toggle AI Personalization

**Trigger**: User toggles AI Personalization switch in AI & Privacy  
**Goal**: Enable or disable AI-driven features

```mermaid
graph TD
    A[AI & Privacy Settings] --> B[AI Personalization: ON]
    B --> C{Toggle Switch OFF}
    C --> D[Show Warning Dialog:<br/>'Disable AI features?']
    D --> E[Impact Explained:<br/>'• No personalized questions<br/>• No AI memory updates<br/>• No smart recommendations<br/>• Journals remain private']
    E --> F{Confirm or Cancel}
    F -->|Cancel| B
    F -->|Confirm| G[Save: ai_privacy.ai_enabled=false]
    G --> H[Stop AI Background Tasks]
    H --> I[Show Toast:<br/>'AI personalization disabled']
    I --> J[Hide AI Memory Button<br/>Gray out 'Your Story']
    J --> K[Future Journals:<br/>No AI Analysis]
```

**When AI is Disabled**:
- Journal entries saved normally
- No sentiment analysis
- No AI memory updates
- No personalized prompts
- Search still works (keyword-based, no semantic)

**When Re-enabled**:
- AI analyzes past journals to catch up
- Memory regenerates from existing data
- Personalized features resume

---

## 14. Logout

**Trigger**: User taps "Logout" button at bottom of Settings  
**Goal**: Sign out and return to welcome screen

```mermaid
graph TD
    A[Settings Screen] --> B{Tap 'Logout' Button}
    B --> C[Show Confirmation Dialog:<br/>'Log out of Tranquara?']
    C --> D[Info Message:<br/>'Your data will remain<br/>synced when you log<br/>back in.']
    D --> E{Confirm or Cancel}
    E -->|Cancel| F[Return to Settings]
    E -->|Confirm| G[Clear Session Token]
    G --> H[Clear Access Token<br/>from Memory]
    H --> I[Keep Local Data<br/>Capacitor storage intact]
    I --> J[Reset Navigation Stack]
    J --> K[Redirect to<br/>Welcome/Login Screen]
    K --> L[Show Toast:<br/>'Logged out successfully']
```

**Logout Behavior**:
- **Session cleared**: Tokens removed, must re-authenticate
- **Local data kept**: Journals, lessons, settings persist offline
- **Sync paused**: No background sync until re-login
- **Biometric/PIN remains**: App lock still active for privacy

**Difference from Delete Account**:
- Logout: Reversible, data intact
- Delete: Permanent, data destroyed

---

## Flow Summary

| Flow | Complexity | User Touches | Success Metric |
|------|-----------|--------------|----------------|
| Access Settings | Low | 1 tap | Screen loads < 500ms |
| Edit Username | Low | 3 taps | Username updates, toast shown |
| Change Theme | Low | 2 taps | Theme applies immediately |
| Enable Reminder | Medium | 3 taps | Notification scheduled |
| Enable PIN Lock | Medium | 5 taps | PIN stored securely |
| Enable Biometric | Medium | 2 taps | Biometric auth works |
| Change PIN | High | 6 taps | New PIN set, old invalidated |
| View AI Memory | Low | 2 taps | Memory screen loads < 1s |
| Update Your Story | Medium | 3 taps | Story saved, AI context updated |
| Export Data | Medium | 4 taps | JSON downloads successfully |
| Import Backup | High | 4 taps | Data merged, duplicates skipped |
| Delete Account | High | 7 taps | Account deleted, email sent |
| Toggle AI | Low | 2 taps | AI features disabled, tasks stopped |
| Logout | Low | 2 taps | Session cleared, redirected |

---

**Last Updated**: November 23, 2025
