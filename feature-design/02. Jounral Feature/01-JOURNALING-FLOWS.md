# 🗺️ Journaling Flows

## Overview

This document outlines all user journeys within the journaling feature, from selecting a collection to completing a session and managing past entries.

---

## Flow A: Template-Based Journaling (From Collection)

```mermaid
flowchart TD
    A[User on Home Page] --> B{Tap Daily Prompt<br/>or Library Tab}
    B -->|Daily Prompt| C[View Featured Slide Group]
    B -->|Library Tab| D[View All Collections]
    D --> E[Tap Collection<br/>e.g., Daily Reflection]
    E --> F[View Slide Groups<br/>Morning, Evening, Weekly]
    F --> G[Tap Slide Group<br/>e.g., Morning]
    C --> H[Session Starts]
    G --> H
    H --> I[Load First Slide<br/>type: emotion_log]
    I --> J{User Interacts}
    J -->|Slide emotion_log| K[Move slider<br/>Storm → Sunny]
    J -->|Slide sleep_check| L[Select hours slept<br/>0-12 hours]
    J -->|Slide journal_prompt| M[Type or speak input]
    J -->|Slide doc| N[Read content<br/>Tap Next]
    K --> O[Auto-save response]
    L --> O
    M --> O
    N --> O
    O --> P{More slides?}
    P -->|Yes| Q[Load Next Slide]
    Q --> J
    P -->|No| R[Session Complete Screen]
    R --> S[Rate helpfulness:<br/>No / A little / Yes]
    S --> T[Return to Home/Library]
```

**Result**: Journal entry created with all slide responses saved. Streak counter increments if daily goal met.

---

## Flow B: Free-Form Journaling (Blank Journal)

```mermaid
flowchart TD
    A[User on Home Page] --> B[Tap + Floating Button<br/>or Start Blank Journal]
    B --> C[Blank Journal Screen<br/>type: journal_prompt]
    C --> D{User Input}
    D -->|Type text| E[Auto-save as typing]
    D -->|Tap mic button| F[Tap-to-speak<br/>Native voice recognition]
    F --> G[Transcribe to text]
    G --> E
    E --> H{User taps<br/>Go Deeper?}
    H -->|Yes| I[AI generates<br/>follow-up question]
    I --> J[Question appears<br/>in gray text]
    J --> K[User continues writing]
    K --> E
    H -->|No| L[User finishes]
    L --> M[Tap Done/Back]
    M --> N{Has any input?}
    N -->|Yes| O[Save journal entry]
    N -->|No| P[Discard - nothing saved]
    O --> Q[Return to Home]
    P --> Q
```

**Result**: Single journal entry created with user's free-form text. No structured slides - just open writing.

---

## Flow C: AI "Go Deeper" Assistance (Within Journal Prompt)

```mermaid
flowchart TD
    A[User on journal_prompt slide] --> B[User typing response]
    B --> C[User pauses or finishes thought]
    C --> D[Taps Go Deeper button]
    D --> E[Loading state<br/>Generating...]
    E --> F[AI analyzes:<br/>- Current question<br/>- User's response<br/>- Template context]
    F --> G[AI generates<br/>follow-up question]
    G --> H[Question inserted<br/>in gray text below]
    H --> I{User accepts?}
    I -->|Yes, continues writing| J[Types below AI question]
    I -->|No, ignores| K[Deletes or ignores text]
    J --> L[Auto-save response]
    K --> L
    L --> M[Can tap Go Deeper again]
    M --> D
```

**AI Behavior**:
- Keeps topic relevant to slide group theme
- Allows brief emotional tangents if relevant
- Asks open-ended questions (e.g., "What triggered that feeling?")
- Never suggests actions or diagnoses
- Questions feel like user asking themselves

---

## Flow D: Edit Past Entry

```mermaid
flowchart TD
    A[User on History/Library Tab] --> B[View Past Journal Entries]
    B --> C[Tap Entry to View]
    C --> D[View All Slide Responses<br/>Read-only mode]
    D --> E[Tap Edit button]
    E --> F[Enter Edit Mode]
    F --> G{Select Slide to Edit}
    G -->|emotion_log slide| H[Adjust slider value]
    G -->|sleep_check slide| I[Change hours slept]
    G -->|journal_prompt slide| J[Edit text response]
    H --> K[Auto-save changes]
    I --> K
    J --> K
    K --> L{More edits?}
    L -->|Yes| G
    L -->|No| M[Tap Done]
    M --> N[Return to Entry View]
```

**Result**: Journal entry updated with new responses. `updated_at` timestamp refreshed.

---

## Flow E: Delete Entry

```mermaid
flowchart TD
    A[User viewing Entry] --> B[Tap Delete button]
    B --> C[Confirmation Alert:<br/>Delete permanently?]
    C --> D{User confirms?}
    D -->|Yes| E[Delete entry from<br/>local SQLite DB]
    D -->|No| F[Cancel - return to entry]
    E --> G{Online?}
    G -->|Yes| H[Sync deletion to backend]
    G -->|No| I[Mark for deletion<br/>in sync queue]
    H --> J[Remove from UI]
    I --> J
    J --> K[Return to History]
    F --> L[Stay on Entry View]
```

**Result**: Entry permanently deleted from local and cloud storage (when synced).

---

## Flow F: Resume Incomplete Session (Draft)

```mermaid
flowchart TD
    A[User on History/Library] --> B[View Drafts Section]
    B --> C[See Incomplete Entry<br/>e.g., Morning - 2/4 slides]
    C --> D[Tap to Resume]
    D --> E[Load Session at<br/>Last Completed Slide]
    E --> F[Show Next Unanswered Slide]
    F --> G{User Interacts}
    G -->|Complete slide| H[Auto-save response]
    G -->|Skip slide| I[Move to next]
    H --> J{More slides?}
    I --> J
    J -->|Yes| F
    J -->|No| K[Session Complete Screen]
    K --> L[Entry marked complete]
    L --> M[Move from Drafts<br/>to Completed Entries]
```

**Result**: Draft entry completed and moved to regular journal history.

---

## Flow G: Session Navigation & Progress

```mermaid
flowchart TD
    A[User in Active Session] --> B[Progress Bar at Top<br/>Shows current/total slides]
    B --> C{User Action}
    C -->|Tap Back arrow| D[Go to Previous Slide]
    C -->|Tap Close X| E[Show Save Draft Alert]
    C -->|Complete slide| F[Tap Next/Continue]
    D --> G[Load Previous Slide<br/>with saved response]
    E --> H{Save Draft?}
    H -->|Discard| I[Exit without saving]
    H -->|Save| J[Save current progress]
    J --> K[Return to Home]
    I --> K
    F --> L[Auto-save current slide]
    L --> M{Last slide?}
    M -->|Yes| N[Show Completion Screen]
    M -->|No| O[Load Next Slide]
    O --> C
```

**Key Navigation Rules**:
- Back button: Returns to previous slide (preserves responses)
- Close X: Shows "Save Draft?" alert
- Progress bar: Visual indicator of session progress (e.g., "Slide 3 of 6")
- Auto-save: Every slide response saved immediately

---

## Flow H: Speech Input (Tap-to-Speak)

```mermaid
flowchart TD
    A[User on journal_prompt slide] --> B[Tap Microphone Icon]
    B --> C[Start Recording<br/>Mic icon animates]
    C --> D[User speaks]
    D --> E[Tap Mic again to Stop]
    E --> F[Native Speech Recognition<br/>iOS/Android]
    F --> G{Transcription Success?}
    G -->|Yes| H[Insert transcribed text<br/>into text input]
    G -->|No| I[Show error message:<br/>Try again]
    H --> J[User can edit text]
    J --> K[Auto-save response]
    I --> L{Retry?}
    L -->|Yes| B
    L -->|No| M[User types manually]
    M --> K
```

**Technical Notes**:
- Uses native device speech recognition (no third-party API)
- Tap-to-speak pattern (not real-time/continuous)
- Processes on-device when possible (privacy)
- Fallback to manual typing if speech recognition fails

---

## Flow I: Offline Journaling & Sync

```mermaid
flowchart TD
    A[User Offline] --> B[Start Journal Session]
    B --> C[All slides load from<br/>local SQLite DB]
    C --> D[User completes slides]
    D --> E[Responses saved to<br/>local SQLite DB]
    E --> F[Entry marked needs_sync = 1]
    F --> G{User goes Online?}
    G -->|Yes| H[Background sync starts]
    G -->|No| I[Entry stays local<br/>User can still edit]
    H --> J[Upload to PostgreSQL]
    J --> K{Sync success?}
    K -->|Yes| L[Mark needs_sync = 0]
    K -->|No| M[Retry on next online]
    L --> N[Entry synced across devices]
    I --> O[User can continue journaling]
```

**Offline Capabilities**:
- All collections, slide groups, and slides cached locally
- User can read, write, edit, delete entries offline
- Sync queue tracks pending changes
- Auto-sync when connection restored
- No data loss - local-first architecture

---

## Related Documentation

- **[00-OVERVIEW.md](./00-OVERVIEW.md)** - Feature purpose and design decisions
- **[02-AI-ASSISTANT-SPEC.md](./02-AI-ASSISTANT-SPEC.md)** - AI behavior and safety guidelines
- **[03-SLIDE-TYPES.md](./03-SLIDE-TYPES.md)** - Detailed slide type specifications
- **[04-DATA-MODELS.md](./04-DATA-MODELS.md)** - Database schemas and relationships
- **[User Authentication](../01.%20User%20register/)** - Required for journaling sessions

---

**Last Updated**: November 21, 2025
