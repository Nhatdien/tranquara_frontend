export type Exercise = {
    exercise_id: number
    title: string
    description: string
    duration_minutes: number
    exercise_type: string
}

export type ExerciseFilter = {
    title: string
    exercise_type: string,
    page:  string
    page_size:  string
    sort: string
}