import { FilterMetaData } from "./metadatas"

export type UserSelfGuideActivity = {
    activity_id: number,
    user_uuid: string,
    exercise_id: number,
    duration_minutes: number,
    completed_at: Date,
    notes: string
}

export type UserSelfGuideActivityResponse = {
    metadata: FilterMetaData
    user_self_guided_activitiies: UserSelfGuideActivity
}
