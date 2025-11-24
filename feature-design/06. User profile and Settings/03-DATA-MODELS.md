# ⚙️ Settings - Data Models

This document defines all database schemas, local storage structures, and data relationships for the Settings feature.

---

## Table of Contents

1. [Database Schema (PostgreSQL)](#database-schema-postgresql)
2. [Local Storage (SQLite/IndexedDB)](#local-storage-sqliteindexeddb)
3. [Secure Storage (Keychain/Keystore)](#secure-storage-keychainKeystore)
4. [Sample Queries](#sample-queries)
5. [Indexes and Performance](#indexes-and-performance)
6. [Data Migration](#data-migration)

---

## Database Schema (PostgreSQL)

### 1. `user_informations` Table (Extended)

Settings stored in JSONB column for flexibility.

_[SQL code implementation removed - to be added during development]_

**Example Row**:
_[JSON code implementation removed - to be added during development]_

---

### 2. `ai_memory` Table (NEW)

Stores AI-generated understanding of user based on journals.

_[SQL code implementation removed - to be added during development]_

**Example Row**:
_[JSON code implementation removed - to be added during development]_

---

### 3. `notification_schedules` Table (NEW)

Tracks scheduled notifications per device (device-specific times).

_[SQL code implementation removed - to be added during development]_

**Example Rows** (same user, 2 devices):
_[JSON code implementation removed - to be added during development]_

---

### 4. `export_jobs` Table (NEW)

Tracks background export jobs for large data exports.

_[SQL code implementation removed - to be added during development]_

**Example Row**:
_[JSON code implementation removed - to be added during development]_

---

## Local Storage (SQLite/IndexedDB)

### Mobile (SQLite)

**Table: `settings_global`** (synced settings)
_[SQL code implementation removed - to be added during development]_

**Table: `settings_local`** (device-specific, not synced)
_[SQL code implementation removed - to be added during development]_

**Table: `ai_memory_cache`** (cached AI memory)
_[SQL code implementation removed - to be added during development]_

### Web (IndexedDB)

**Object Store: `settingsGlobal`**
_[TYPESCRIPT code implementation removed - to be added during development]_

**Object Store: `settingsLocal`**
_[TYPESCRIPT code implementation removed - to be added during development]_

**Object Store: `aiMemoryCache`**
_[TYPESCRIPT code implementation removed - to be added during development]_

---

## Secure Storage (Keychain/Keystore)

### iOS Keychain

_[TYPESCRIPT code implementation removed - to be added during development]_

**Keychain Items**:
- `pin_hash` (string): bcrypt-hashed PIN
- `biometric_enabled` (string): "true" or "false"
- `last_unlock_time` (string): Unix timestamp
- `access_token` (string): User session token

### Android Keystore

Same API as iOS via `expo-secure-store`, backed by Android Keystore system.

**Security Features**:
- Hardware-backed encryption (if available)
- Data tied to app signing key
- Cannot be extracted without device unlock
- Survives app uninstall/reinstall (optional)

---

## Sample Queries

### 1. Get User Settings

_[SQL code implementation removed - to be added during development]_

**Result**:
_[JSON code implementation removed - to be added during development]_

---

### 2. Update Specific Setting (JSONB Path)

_[SQL code implementation removed - to be added during development]_

_[SQL code implementation removed - to be added during development]_

_[SQL code implementation removed - to be added during development]_

---

### 3. Get AI Memory

_[SQL code implementation removed - to be added during development]_

---

### 4. Clear AI Memory

_[SQL code implementation removed - to be added during development]_

**Note**: AI memory regenerates after next journal entry.

---

### 5. Schedule Notification (Device-Specific)

_[SQL code implementation removed - to be added during development]_

---

### 6. Get Notification Schedules for Device

_[SQL code implementation removed - to be added during development]_

---

### 7. Mark Account for Deletion (Grace Period)

_[SQL code implementation removed - to be added during development]_

---

### 8. Recover Deleted Account (Within Grace Period)

_[SQL code implementation removed - to be added during development]_

---

### 9. Find Accounts for Permanent Deletion (Cron Job)

_[SQL code implementation removed - to be added during development]_

---

### 10. Create Export Job

_[SQL code implementation removed - to be added during development]_

---

### 11. Update Export Job Status

_[SQL code implementation removed - to be added during development]_

---

### 12. Get Settings Changed Since Last Sync

_[SQL code implementation removed - to be added during development]_

---

## Indexes and Performance

### Primary Indexes

_[SQL code implementation removed - to be added during development]_

### JSONB Indexes (for complex queries)

_[SQL code implementation removed - to be added during development]_

**Query using JSONB index**:
_[SQL code implementation removed - to be added during development]_

---

## Data Migration

### v1.0 → v1.1 (Add AI Memory Support)

_[SQL code implementation removed - to be added during development]_

### v1.1 → v1.2 (Add Device-Specific Notifications)

_[SQL code implementation removed - to be added during development]_

### v1.2 → v1.3 (Add Account Deletion Tracking)

_[SQL code implementation removed - to be added during development]_

---

## Sample Data Sets

### Test User 1: Default Settings

_[JSON code implementation removed - to be added during development]_

### Test User 2: Privacy-Focused

_[JSON code implementation removed - to be added during development]_

### Test User 3: High Engagement

_[JSON code implementation removed - to be added during development]_

---

**Last Updated**: November 23, 2025
