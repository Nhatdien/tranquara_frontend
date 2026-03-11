import { Base } from "../base";
import type { TherapySession, PrepPack, HomeworkItem, GeneratePrepPackResponse } from "~/types/therapy_toolkit";

export class TherapyToolkit extends Base {

  // ─── Sessions ───────────────────────────

  async createSession(session: any): Promise<{ session: TherapySession }> {
    return this.fetch(`${this.config.base_url}/therapy-sessions`, {
      method: "POST",
      body: JSON.stringify(session),
    });
  }

  async getSessions(): Promise<{ sessions: TherapySession[] }> {
    return this.fetch(`${this.config.base_url}/therapy-sessions`);
  }

  async updateSession(id: string, updates: any): Promise<{ session: TherapySession }> {
    return this.fetch(`${this.config.base_url}/therapy-sessions?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteSession(id: string): Promise<void> {
    return this.fetch(`${this.config.base_url}/therapy-sessions?id=${id}`, {
      method: "DELETE",
    });
  }

  // ─── Homework ───────────────────────────

  async getHomework(sessionId?: string): Promise<{ homework: HomeworkItem[] }> {
    const url = sessionId
      ? `${this.config.base_url}/homework?session_id=${sessionId}`
      : `${this.config.base_url}/homework`;
    return this.fetch(url);
  }

  async createHomework(homework: any): Promise<{ homework: HomeworkItem }> {
    return this.fetch(`${this.config.base_url}/homework`, {
      method: "POST",
      body: JSON.stringify(homework),
    });
  }

  async toggleHomework(id: string, completed: boolean): Promise<void> {
    return this.fetch(`${this.config.base_url}/homework?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    });
  }

  async deleteHomework(id: string): Promise<void> {
    return this.fetch(`${this.config.base_url}/homework?id=${id}`, {
      method: "DELETE",
    });
  }

  // ─── Prep Packs (Phase 3) ──────────────

  async generatePrepPack(request: any): Promise<GeneratePrepPackResponse> {
    const aiBaseUrl = this.config.websocket_url || 'http://localhost:8000';
    return this.fetch(`${aiBaseUrl}/api/prep-pack`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getPrepPacks(): Promise<{ prep_packs: PrepPack[] }> {
    return this.fetch(`${this.config.base_url}/prep-packs`);
  }

  async getPrepPack(id: string): Promise<{ prep_pack: PrepPack }> {
    return this.fetch(`${this.config.base_url}/prep-packs/detail?id=${id}`);
  }

  async savePrepPackToServer(pack: any): Promise<{ prep_pack: PrepPack }> {
    return this.fetch(`${this.config.base_url}/prep-packs`, {
      method: "POST",
      body: JSON.stringify(pack),
    });
  }

  async deletePrepPackFromServer(id: string): Promise<void> {
    return this.fetch(`${this.config.base_url}/prep-packs?id=${id}`, {
      method: "DELETE",
    });
  }
}
