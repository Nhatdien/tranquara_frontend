export type UserSelfGuideActivity = {
    activity_id: number,
    user_uuid: string,
    exercise_id: number,
    duration_minutes: number,
    completed_at: Date,
    notes: string
}