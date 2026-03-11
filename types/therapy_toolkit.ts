// ─── Journey Configuration ─────────────────────────────

export interface JourneyStep {
  collectionId: string;
  step: number;
  labelKey: string;          // i18n key for title
  descriptionKey: string;    // i18n key for description
  icon: string;              // Lucide icon name
}

// Static configuration — not stored in DB
export const JOURNEY_STEPS: JourneyStep[] = [
  {
    collectionId: '33333333-3333-3333-3333-333333333333',
    step: 1,
    labelKey: 'toolkit.journey.step1.label',
    descriptionKey: 'toolkit.journey.step1.description',
    icon: 'book-open',
  },
  {
    collectionId: '88888888-8888-8888-8888-888888888888',
    step: 2,
    labelKey: 'toolkit.journey.step2.label',
    descriptionKey: 'toolkit.journey.step2.description',
    icon: 'history',
  },
  {
    collectionId: '99999999-9999-9999-9999-999999999999',
    step: 3,
    labelKey: 'toolkit.journey.step3.label',
    descriptionKey: 'toolkit.journey.step3.description',
    icon: 'heart',
  },
  {
    collectionId: '44444444-4444-4444-4444-444444444444',
    step: 4,
    labelKey: 'toolkit.journey.step4.label',
    descriptionKey: 'toolkit.journey.step4.description',
    icon: 'clipboard-check',
  },
];

// IDs of collections that moved from Library to Toolkit
export const TOOLKIT_COLLECTION_IDS = JOURNEY_STEPS.map(s => s.collectionId);

// ─── Breathing ─────────────────────────────────────────

export interface BreathingConfig {
  pattern: 'box';            // only box breathing for now
  inhale: number;            // seconds
  holdIn: number;
  exhale: number;
  holdOut: number;
  duration: number;          // total minutes
}

export const BOX_BREATHING_CONFIG: BreathingConfig = {
  pattern: 'box',
  inhale: 4,
  holdIn: 4,
  exhale: 4,
  holdOut: 4,
  duration: 3,              // 3 minutes default
};

// ─── Prep Pack (Phase 3) ───────────────────────────────

export interface PrepPack {
  id: string;
  user_id: string;
  date_range_start: string;
  date_range_end: string;
  mood_overview: MoodOverview;
  key_themes: string[];
  emotional_highlights: EmotionalHighlight[];
  patterns: DetectedPattern[];
  discussion_points: string[];
  growth_moments: string[];
  personal_notes?: string;
  journal_count: number;
  created_at: string;
  needs_sync?: boolean;
}

export interface MoodOverview {
  average: number;
  trend: 'improving' | 'declining' | 'stable';
  data_points: { date: string; score: number }[];
  highest: { score: number; date: string; title: string };
  lowest: { score: number; date: string; title: string };
}

export interface EmotionalHighlight {
  date: string;
  title: string;
  mood: number;
  excerpt: string;
  significance: string;
  journal_id?: string;
}

export interface DetectedPattern {
  pattern: string;
  category: 'triggers' | 'patterns' | 'coping' | 'relationships' | 'growth';
  confidence: number;
  source?: string;
}

// ─── Therapy Session (Phase 2) ─────────────────────────

export interface TherapySession {
  id: string;
  user_id: string;
  session_date?: string;
  status: SessionStatus;
  mood_before?: number;
  talking_points?: string;
  session_priority?: string;
  prep_pack_id?: string;
  mood_after?: number;
  key_takeaways?: string;
  session_rating?: number;
  homework_items?: HomeworkItem[];
  created_at: string;
  updated_at: string;
  needs_sync?: boolean;
}

export type SessionStatus = 'scheduled' | 'before_completed' | 'completed';

// ─── Homework (Phase 2) ───────────────────────────────

export interface HomeworkItem {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  needs_sync?: boolean;
}
