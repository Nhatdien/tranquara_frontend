import { Base } from "../base";

export interface AIMemory {
  id: string;
  user_id: string;
  content: string;
  category:
    | "values"
    | "habits"
    | "relationships"
    | "goals"
    | "struggles"
    | "preferences"
    | "patterns"
    | "growth";
  source_journal_ids: string[];
  confidence: number;
  created_at: string;
  updated_at: string;
}

export class AIMemories extends Base {
  /**
   * Fetch all AI memories for the authenticated user.
   * Optionally filter by category.
   */
  async getAIMemories(
    category?: string
  ): Promise<{ memories: AIMemory[]; total: number }> {
    const params = category ? `?category=${category}` : "";
    return this.fetch<{ memories: AIMemory[]; total: number }>(
      `${this.config.base_url}/v1/ai-memories${params}`
    );
  }

  /**
   * Hard-delete a single AI memory by ID.
   * Also removes the memory from Qdrant (handled server-side).
   */
  async deleteAIMemory(memoryId: string): Promise<{ message: string }> {
    return this.fetch<{ message: string }>(
      `${this.config.base_url}/v1/ai-memories/${memoryId}`,
      { method: "DELETE" }
    );
  }
}
