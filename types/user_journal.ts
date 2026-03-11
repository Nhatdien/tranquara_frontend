// Slide configuration types
export type SlideConfig = {
  scale?: string;
  labels?: string[];
  min?: number;
  max?: number;
  allowAI?: boolean;
  minLength?: number;
  [key: string]: any;
}

// Individual slide definition
export type SlideData = {
  id: string;
  type: 'emotion_log' | 'sleep_check' | 'journal_prompt' | 'doc' | 'further_reading' | 'cta' | 'date_picker' | 'star_rating' | 'checklist_input';
  question?: string;
  question_vi?: string;
  title?: string;
  title_vi?: string;
  content?: string;
  content_vi?: string;
  config?: SlideConfig;
}

// Slide group definition
export type SlideGroup = {
  id: string;
  title: string;
  description: string;
  position: number;
  slides: SlideData[];
}

// Collection type discriminator
export type CollectionType = 'journal' | 'learn' | 'prepare';

// Journal Template (Collection)
export type JournalTemplate = {
  id: string;
  title: string;
  description?: string;
  category: string;
  type: CollectionType;
  slide_groups: SlideGroup[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// User Journal Entry
export type Journal = {
  id: string;
  user_id: string;
  collection_id?: string | null;  // Nullable for free-form journals
  title: string;
  content: string;                 // TipTap JSON with embedded emotions + AI
  content_html?: string | null;    // Rendered HTML preview
  mood_score?: number | null;      // 1-10 scale
  mood_label?: string | null;      // "Storm", "Sunny", etc.
  created_at: string;
  updated_at: string;
}

// Create Journal Request
export type CreateJournalRequest = {
  collection_id?: string | null;
  title: string;
  content: string;
  content_html?: string;
  mood_score?: number;
  mood_label?: string;
}

// API Response types
export type UserJournalsResponse = {
  user_journals: Journal[];
}

export type JournalTemplateResponse = {
  templates: JournalTemplate[];
}

// TipTap JSON structure types
export type TipTapNode = {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

export type TipTapDocument = {
  type: 'doc';
  content: TipTapNode[];
}

// Slide response types for TipTap content
export type SlideResponse = {
  type: 'slideResponse';
  attrs: {
    slideId: string;
    slideType: 'emotion_log' | 'sleep_check' | 'journal_prompt';
    question: string;
    moodScore?: number;
    moodLabel?: string;
    hoursSlept?: number;
    userAnswer?: string;
    timestamp: string;
  };
}

export type AIQuestion = {
  type: 'aiQuestion';
  attrs: {
    question: string;
    timestamp: string;
  };
}

// Local SQLite types (for offline storage)
export type LocalJournal = Journal & {
  server_id?: string | null;      // UUID from server after sync
  needs_sync: 0 | 1;              // Boolean as integer
  synced_at?: string | null;      // ISO 8601 when last synced
  is_deleted: 0 | 1;              // Soft delete flag
}

export type LocalTemplate = JournalTemplate & {
  cached_at: string;              // When downloaded from server
  title_vi?: string;              // Vietnamese title
  description_vi?: string;        // Vietnamese description
  slide_groups_vi?: SlideGroup[]; // Vietnamese slide groups
}

// Learned Slide Group (progress tracking for learn-type collections)
export type LearnedSlideGroup = {
  id: string;
  user_id: string;
  collection_id: string;
  slide_group_id: string;
  completed_at: string;
}

export type LocalLearnedSlideGroup = LearnedSlideGroup & {
  server_id?: string | null;      // UUID from server after sync
  needs_sync: 0 | 1;
  synced_at?: string | null;
}

export type LearnedSlideGroupResponse = {
  learned: LearnedSlideGroup[];
}

export type CreateLearnedRequest = {
  collection_id: string;
  slide_group_id: string;
}