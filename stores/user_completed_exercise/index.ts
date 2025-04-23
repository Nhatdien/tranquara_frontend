import { Base } from "../base";
import { UserCompletedExercise } from "~/types/user_completed_exercise";

export class UserCompletedExercises extends Base {
    // async getExerciseById(exericseId: number): Promise<ProgramExercise> {
    //     const searchParams = new URLSearchParams({
    //         "exercise_id": `${exericseId}`
    //     })
    //     return this.fetch<Exercise>(`${this.config.base_url}/exercise?${searchParams}`)
    // }

    // async getExercises(filter: ExerciseFilter): Promise<Exercise[]> {
    //     const searchParams = new URLSearchParams({...filter})
    //     return this.fetch<Exercise[]>(`${this.config.base_url}/exercise?${searchParams}`)
    // } 
}