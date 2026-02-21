import { Base } from "../base";
import type { UserStreakResponse } from "~/types/user_streak";

export class UserStreaks extends Base {
    async getUserStreak(): Promise<UserStreakResponse> {
        return this.fetch<UserStreakResponse>(`${this.config.base_url}/user_streaks`);
    }

    async updateUserStreak(): Promise<{ message: string }> {
        return this.fetch<{ message: string }>(`${this.config.base_url}/user_streaks`, {
            method: "PUT",
        });
    }
}