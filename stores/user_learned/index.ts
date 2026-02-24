import { Base } from "../base";
import type { LearnedSlideGroup, LearnedSlideGroupResponse, CreateLearnedRequest } from "~/types/user_journal";

export class UserLearned extends Base {
    async createLearned(request: CreateLearnedRequest): Promise<{ learned: LearnedSlideGroup }> {
        return this.fetch(`${this.config.base_url}/learned`, {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    async getLearnedByCollection(collectionId: string): Promise<LearnedSlideGroupResponse> {
        return this.fetch(`${this.config.base_url}/learned/${collectionId}`);
    }

    async getAllLearned(): Promise<LearnedSlideGroupResponse> {
        return this.fetch(`${this.config.base_url}/learned`);
    }

    async deleteLearned(id: string): Promise<void> {
        return this.fetch(`${this.config.base_url}/learned/${id}`, {
            method: "DELETE",
        });
    }
}
