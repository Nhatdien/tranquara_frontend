import { Base } from "./base";

export class AIService extends Base {
  /**
   * Analyze journal content and get a follow-up question from AI
   */
  async analyzeJournal(params: {
    content: string;
    mood_score: number;
    slide_prompt?: string;
  }): Promise<{ question: string }> {
    const url = `${this.config.websocket_url || 'http://localhost:8000'}/api/analyze-journal`;
    
    const response = await this.fetch<{ question: string }>(url, {
      method: "POST",
      body: JSON.stringify(params),
    });

    return response;
  }
}
