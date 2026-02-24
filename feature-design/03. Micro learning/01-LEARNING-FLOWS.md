# 🗺️ Micro Learning - User Flows

## Overview

This document outlines all user journeys within the micro-learning feature, from discovering lessons in the library to completing them and tracking progress.

---

## Flow A: Browse & Discover Lessons

```mermaid
flowchart TD
    A[User Opens App] --> B{Navigation Choice}
    B -->|Tap Library Tab| C[Library Screen]
    B -->|Tap Home| D[Home Dashboard]
    D -->|See Learn Section| C
    
    C --> E[Library Page:<br/>📚 Collections Section type=learn<br/>📝 Categories Section type=journal]
    
    E --> F{User Action}
    F -->|Browse Collections| G[Horizontal scroll<br/>Learn collections with<br/>progress bars]
    F -->|Browse Categories| H[Tap category chip<br/>e.g., Mindfulness]
    F -->|Use Search Bar| I[Enter keyword/topic]
    
    G --> J{Action on Collection}
    J -->|Tap Collection Card| K[View Slide Groups<br/>in Collection<br/>with completion status]
    J -->|Tap See All| L[All Learn Collections<br/>Grouped by Category]
    
    H --> M[Show all slide groups<br/>from ALL journal-type<br/>collections in category]
    
    I --> N[Search Results<br/>PostgreSQL + Qdrant]
    
    K --> O[Tap Slide Group]
    L --> O
    M --> O
    N --> O
    
    O --> P[Lesson/Session Detail<br/>- Title<br/>- Description<br/>- Start Button]
    P --> Q{User Decision}
    Q -->|Start| R[Begin Slide Flow]
    Q -->|Back| C
```

**Result**: User enters a lesson/session and begins slide-by-slide content. Learn collections show progress bars; journal categories show slide group listings.

---

## Flow B: Complete a Lesson (Slide Progression)

```mermaid
flowchart TD
    A[Start Lesson] --> B[Load First Slide<br/>from slide_groups.content]
    B --> C{Slide Type?}
    
    C -->|doc| D[Display Text Content<br/>Header + Body HTML]
    C -->|cta| E[Interactive Component<br/>Emotion check / Breathing]
    C -->|journal_prompt| F[Journal Prompt<br/>Question + Description]
    C -->|further_reading| G[External Links<br/>Articles / Videos]
    C -->|emotion_log| H[Emotion Slider<br/>Storm → Sunny]
    C -->|sleep_check| I[Sleep Slider<br/>0-12 hours]
    
    D --> J[User Taps Next]
    E --> J
    F --> K{User Chooses}
    K -->|Write Response| L[Open Journal Editor<br/>Pre-filled prompt]
    K -->|Skip| J
    L --> M[Save as Draft<br/>Continue lesson]
    M --> J
    G --> J
    H --> J
    I --> J
    
    J --> N{More Slides?}
    N -->|Yes| O[Load Next Slide]
    O --> C
    N -->|No| P[Final Slide Screen<br/>Summary / Key Takeaway]
    
    P --> Q[Finish Button Visible]
    Q --> R{User Action}
    R -->|Tap Finish| S[Mark Lesson Complete<br/>Save to user_learned_slide_groups]
    R -->|Back/Exit| T[Exit Without Completing<br/>Progress not saved]
    
    S --> U[Show Completion Badge<br/>+1 to Progress Counter]
    U --> V[Optional: Rate Helpfulness<br/>Was this helpful?]
    V --> W[Return to Library]
    T --> W
```

**Result**: Lesson marked complete only when user taps Finish button. Progress counter increments.

---

## Flow C: Journal Integration from Lesson

```mermaid
flowchart TD
    A[User Viewing Lesson] --> B[Encounters journal_prompt Slide]
    B --> C[Slide Shows:<br/>Question Content<br/>Question Description<br/>Write Response Button]
    
    C --> D{User Action}
    D -->|Tap Write Response| E[Navigate to Journal Editor]
    D -->|Tap Next/Skip| F[Continue to Next Slide<br/>No journal created]
    
    E --> G[Journal Editor Opens<br/>Pre-filled:<br/>- Title: Lesson title<br/>- Prompt text as first line]
    G --> H[User Writes Response]
    H --> I{Multiple Prompts<br/>in This Lesson?}
    
    I -->|Yes| J[Append to Same Draft<br/>Continue lesson]
    I -->|No| K[Draft Saved]
    
    J --> L[Return to Lesson]
    K --> L
    L --> M[Continue Lesson Slides]
    
    M --> N[Lesson Completed<br/>User Taps Finish]
    N --> O[Save Journal Entry<br/>if Any Content Written]
    
    O --> P[Journal Saved with Metadata:<br/>- collection_id: lesson ID<br/>- source_type: 'lesson'<br/>- title: lesson title<br/>- content: all prompts combined]
    
    P --> Q[Success Message<br/>Journal saved!]
    Q --> R[Return to Library]
```

**Result**: One journal entry per lesson (even if multiple prompts). Entry links back to source lesson via `collection_id`.

---

## Flow D: View Journal from Lesson History

```mermaid
flowchart TD
    A[User Opens Journal Tab] --> B[Journal History List]
    B --> C[View Journal Entries<br/>Sorted by date]
    
    C --> D{Entry has<br/>source_type = 'lesson'?}
    D -->|Yes| E[Show Lesson Badge<br/>🧠 From: Lesson Title]
    D -->|No| F[Show as Regular Entry]
    
    E --> G{User Action}
    G -->|Tap Entry| H[View Journal Content]
    G -->|Tap Lesson Badge| I[Navigate to Original Lesson]
    
    I --> J[Lesson Detail Screen<br/>Already Completed Badge]
    J --> K{User Action}
    K -->|Retake Lesson| L[Start Lesson Again<br/>Does not re-complete]
    K -->|Back| B
    
    H --> M[Read Journal Entry]
    M --> N{User Action}
    N -->|Edit Entry| O[Edit Journal Text]
    N -->|View Source Lesson| I
    N -->|Back| B
```

**Result**: Users can navigate from journal entries back to source lessons and vice versa.

---

## Flow E: Search & Discovery

```mermaid
flowchart TD
    A[User on Library Screen] --> B[Tap Search Bar]
    B --> C[Enter Search Query<br/>e.g., 'anxiety', 'therapy']
    
    C --> D[Backend Search Process]
    D --> E[PostgreSQL Full-Text Search<br/>collections.title<br/>collections.description<br/>slide_groups.content]
    
    E --> F{Strong Matches Found?}
    F -->|Yes, Score > 0.7| G[Return Results<br/>Sorted by relevance]
    F -->|No, Score < 0.7| H[Fallback: Semantic Search]
    
    H --> I[Send to AI Service<br/>Python + Qdrant]
    I --> J[Vector Embedding Search<br/>Find similar topics]
    J --> K[Return Semantic Matches<br/>with Confidence Scores]
    
    G --> L[Display Results List]
    K --> L
    
    L --> M[Each Result Shows:<br/>- Title<br/>- Category Badge<br/>- Brief Description<br/>- Match Score optional]
    
    M --> N{User Action}
    N -->|Tap Result| O[Open Lesson Detail]
    N -->|Refine Search| C
    N -->|Clear Search| P[Return to Full Library]
    
    O --> Q[Start Lesson Flow]
```

**Result**: Hybrid search (keyword + semantic) helps users find relevant content even with vague queries.

---

## Flow F: AI Recommendations (Opt-In)

```mermaid
flowchart TD
    A[User Opens Settings] --> B[Profile & Preferences]
    B --> C[AI Features Section]
    C --> D[Toggle: Get Personalized<br/>Lesson Suggestions<br/>Default: OFF]
    
    D --> E{User Action}
    E -->|Enable Toggle| F[Confirm Dialog:<br/>AI will analyze journals<br/>for lesson suggestions]
    E -->|Keep OFF| G[No AI Recommendations]
    
    F --> H[User Confirms]
    H --> I[Save Preference<br/>settings.ai_recommendations: true]
    
    I --> J[Background: AI Service Analyzes<br/>Last 7-14 Days of Journals]
    J --> K[Extract Themes:<br/>stress, anxiety, relationships,<br/>sleep, emotions]
    
    K --> L[Match Themes to<br/>Lesson Categories]
    L --> M[Filter Out:<br/>- Already completed lessons<br/>- Recently viewed lessons]
    
    M --> N[Generate Suggestions:<br/>Top 3 Lessons with Reasoning]
    
    N --> O[Display in App:<br/>Home Screen or Library Tab<br/>Suggested for You Section]
    
    O --> P[Show Card:<br/>💡 We noticed you wrote<br/>about 'stress' 3x this week.<br/>Try: Stress Regulation Basics]
    
    P --> Q{User Action}
    Q -->|Tap Suggestion| R[Open Lesson]
    Q -->|Dismiss| S[Hide Suggestion<br/>Don't show this again]
    Q -->|Ignore| T[Leave in Feed]
    
    R --> U[Start Lesson]
    S --> V[Track Rejection<br/>Improve Future Suggestions]
```

**Result**: Proactive, privacy-respecting recommendations only when user opts in. Clear reasoning shown.

---

## Flow G: View Progress

```mermaid
flowchart TD
    A[User Opens Profile/Progress Tab] --> B[Progress Dashboard]
    B --> C[Display Metrics:<br/>📘 Total Lessons Completed: X]
    
    C --> D{Has Completed Lessons?}
    D -->|Yes| E[Show Completed Count<br/>e.g., 12 lessons]
    D -->|No| F[Show Empty State<br/>Start your learning journey!]
    
    E --> G[Optional: Recently Completed<br/>Last 3 lessons with dates]
    G --> H[Category Distribution optional<br/>Future: Radar chart]
    
    H --> I{User Action}
    I -->|Tap Completed Lesson| J[Navigate to Lesson Detail<br/>Show 'Completed' Badge]
    I -->|View All Completed| K[Filter Library:<br/>Show only completed]
    
    J --> L[Option to Retake<br/>Does not re-count completion]
    L --> M[Restart Lesson Slides]
```

**Result**: Simple, encouraging progress view. No pressure or gamification (for now).

---

## Flow H: Offline Access

```mermaid
flowchart TD
    A[User Installs App] --> B[First Launch]
    B --> C[App Initialization]
    C --> D[Check Local SQLite DB]
    
    D --> E{Core Lessons Bundled?}
    E -->|Yes in App Bundle| F[Copy Bundled Lessons<br/>to Local SQLite DB<br/>~20-30 lessons]
    E -->|Not Yet| G[Download Core Pack<br/>Background Sync]
    
    F --> H[Mark as Available Offline]
    G --> H
    
    H --> I[User Browses Library]
    I --> J{Network Available?}
    J -->|Yes| K[Load Latest Lessons<br/>from Server + Local]
    J -->|No| L[Load from Local Only<br/>Show Offline Badge]
    
    K --> M[Sync New Lessons<br/>in Background]
    M --> N[Save to Local DB<br/>for Offline Access]
    
    L --> O[User Selects Lesson]
    O --> P[Load Slides from<br/>Local SQLite DB]
    P --> Q[Lesson Plays Offline<br/>All Slides Available]
    
    Q --> R[User Completes Lesson]
    R --> S[Save Progress Locally<br/>to Sync Queue]
    
    S --> T[When Online:<br/>Sync to Server<br/>user_learned_slide_groups]
```

**Result**: Core lessons work 100% offline. New content syncs when available.

---

## Flow I: Lesson Retake (Revisit)

```mermaid
flowchart TD
    A[User Views Completed Lesson] --> B[Lesson Detail Screen<br/>Shows ✅ Completed Badge]
    B --> C[Retake Lesson Button]
    
    C --> D{User Taps Retake}
    D --> E[Confirm Dialog:<br/>This won't add to your<br/>completion count]
    
    E --> F{User Confirms}
    F -->|Yes| G[Start Lesson Slides]
    F -->|Cancel| H[Return to Library]
    
    G --> I[User Completes All Slides]
    I --> J[Finish Button Appears]
    J --> K{User Taps Finish}
    
    K --> L[Check Database:<br/>Already Completed?]
    L -->|Yes| M[Don't Create Duplicate<br/>user_learned_slide_groups Entry]
    L -->|No somehow| N[Create Entry]
    
    M --> O[Show Message:<br/>You've already completed<br/>this lesson]
    O --> P[Return to Library]
    N --> P
```

**Result**: Users can revisit lessons for review without inflating progress counter.

---

## Summary: Key User Paths

| Flow | Entry Point | Exit Point | Critical Data |
|------|-------------|------------|---------------|
| **Browse & Discover** | Library Tab | Lesson Detail | `journal_templates` (type='learn') query |
| **Complete Lesson** | Start Button | Finish Button → Save | `user_learned_slide_groups` insert |
| **Journal Integration** | journal_prompt Slide | Journal Editor → Save | `user_journals` with `collection_id` |
| **Search** | Search Bar | Results List → Lesson | PostgreSQL + Qdrant |
| **AI Recommendations** | Settings Toggle → Home | Suggested Lessons | AI analysis of journals |
| **Progress View** | Profile Tab | Progress Dashboard | `user_learned_slide_groups` count |
| **Offline Access** | App Launch | Lesson Playback | Local DB sync |
| **Retake Lesson** | Completed Lesson | Finish (no re-save) | No duplicate entries |

---

**Last Updated**: February 24, 2026
