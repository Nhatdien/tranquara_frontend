import { FilterMetaData } from "./metadatas"

export type UserCompletedExercise = {
    id: number,
    user_uuid: string,
    week_number: number,
    day_number: number,
    exercise_id: number,
    completed_at: Date,
    notes: string
}

export type UserSelfGuideActivityResponse = {
    metadata: FilterMetaData
    user_completed_exercises: UserCompletedExercise
}