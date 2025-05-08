export type UserStreak = {
    user_uuid: string,
    current_streak: number, 
    longest_streak: number,
    last_active: Date,
}

export type UserStreakResponse = {
    user_streak: UserStreak
}
