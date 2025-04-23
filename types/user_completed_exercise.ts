export type UserCompletedExercise = {
    id: number,
    user_uuid: string,
    week_number: number,
    day_number: number,
    exercise_id: number,
    completed_at: Date,
    notes: string
}