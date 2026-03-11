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

// --- Affirmations (local-only)
export interface UserAffirmation {
  id: string;
  user_id: string;
  content: string;
  is_favorite: boolean;
  created_at: string;
}

// ─── API Request/Response (Phase 3) ────────────────────

export interface GeneratePrepPackRequest {
  date_range_start: string;
  date_range_end: string;
  language?: string;
}

export interface GeneratePrepPackResponse {
  prep_pack: PrepPack;
  meta: {
    journals_analyzed: number;
    date_range: string;
    generated_at: string;
  };
}

// ─── Session Input Types ───────────────────────────────

export interface CreateSessionInput {
  session_date?: string;
  status?: SessionStatus;
  mood_before?: number;
  talking_points?: string;
  session_priority?: string;
  prep_pack_id?: string;
}

export interface UpdateSessionInput {
  session_date?: string;
  mood_before?: number;
  talking_points?: string;
  session_priority?: string;
  mood_after?: number;
  key_takeaways?: string;
  session_rating?: number;
  status?: SessionStatus;
}

// ─── Static Session Slide Groups ───────────────────────
// These are frontend-only constants — not stored in the backend.
// They power the slide-based session creation flow.

import type { SlideGroup } from './user_journal';

/** Virtual collection ID for session slide groups (never sent to backend) */
export const SESSION_COLLECTION_ID = 'session-tracker-virtual';

/** Before-session slide group: mood, talking points, priority (date is set at scheduling time) */
export const SESSION_BEFORE_SLIDE_GROUP: SlideGroup = {
  id: 'session-before',
  title: 'Before Your Session',
  description: 'Prepare for your upcoming therapy session',
  position: 0,
  slides: [
    {
      id: 'before-mood',
      type: 'emotion_log',
      question: 'How are you feeling right now?',
      question_vi: 'Bạn đang cảm thấy thế nào?',
    },
    {
      id: 'before-talking-points',
      type: 'journal_prompt',
      question: 'What do you want to talk about?',
      question_vi: 'Bạn muốn nói về điều gì?',
      content: 'Write down the topics, feelings, or events you want to discuss with your therapist.',
      content_vi: 'Ghi lại những chủ đề, cảm xúc, hoặc sự kiện bạn muốn thảo luận với chuyên gia.',
    },
    {
      id: 'before-priority',
      type: 'journal_prompt',
      question: 'My top priority for this session',
      question_vi: 'Ưu tiên hàng đầu của tôi cho buổi này',
      content: 'If you could focus on just one thing, what would it be?',
      content_vi: 'Nếu chỉ có thể tập trung vào một điều, đó sẽ là gì?',
    },
  ],
};

/** After-session slide group: mood, takeaways, homework, rating */
export const SESSION_AFTER_SLIDE_GROUP: SlideGroup = {
  id: 'session-after',
  title: 'After Your Session',
  description: 'Reflect on your therapy session',
  position: 1,
  slides: [
    {
      id: 'after-mood',
      type: 'emotion_log',
      question: 'How do you feel after the session?',
      question_vi: 'Bạn cảm thấy thế nào sau buổi trị liệu?',
    },
    {
      id: 'after-takeaways',
      type: 'journal_prompt',
      question: 'Key takeaways from the session',
      question_vi: 'Những điều rút ra từ buổi trị liệu',
      content: 'What insights, advice, or realizations stood out to you?',
      content_vi: 'Những hiểu biết, lời khuyên, hoặc nhận ra nào nổi bật với bạn?',
    },
    {
      id: 'after-homework',
      type: 'checklist_input',
      question: 'Homework & action items',
      question_vi: 'Bài tập & hành động cần làm',
      content: 'Add the tasks your therapist assigned or actions you want to take.',
      content_vi: 'Thêm các bài tập chuyên gia giao hoặc hành động bạn muốn thực hiện.',
    },
    {
      id: 'after-rating',
      type: 'star_rating',
      question: 'Rate this session',
      question_vi: 'Đánh giá buổi trị liệu này',
      content: 'How helpful was this session overall?',
      content_vi: 'Buổi trị liệu này hữu ích như thế nào?',
    },
  ],
};
