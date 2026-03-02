import { Base } from "./base";

export class AIService extends Base {
  /**
   * Analyze journal content and get a follow-up question from AI.
   * Enhanced with RAG: AI service queries user's past journals from Qdrant
   * to generate more personalized, pattern-aware follow-up questions.
   */
  async analyzeJournal(params: {
    user_id: string;              // Required: user UUID for Qdrant filtering
    content: string;
    mood_score: number;
    slide_prompt?: string;
    slide_group_context?: any;    // Full slide group data
    current_slide_id?: string;    // Current slide ID
    collection_title?: string;    // Collection name
    direction?: 'why' | 'emotions' | 'patterns' | 'challenge' | 'growth';
    your_story?: string;          // User's personal context from settings
  }): Promise<{ question: string }> {
    const url = `${this.config.websocket_url || 'http://localhost:8000'}/api/analyze-journal`;
    
    const response = await this.fetch<{ question: string }>(url, {
      method: "POST",
      body: JSON.stringify(params),
    });

    return response;
  }
}
