export type UserStreak = {
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_active: string;
    total_entries: number;
    updated_at: string;
};

export type UserStreakResponse = {
    user_streak: UserStreak;
};
