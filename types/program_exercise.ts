export type ProgramExercise = {
    id: number,
    week_number: number,
    day_number: number,
    exercise_id: number,
}

export type ProgramExerciseResponse = {
    program_exercise: ProgramExercise
}
