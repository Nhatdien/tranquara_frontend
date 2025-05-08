import { Base } from "../base";
import { Exercise, ExerciseResponse, ExerciseFilter } from "~/types/exercise";

export class Exercises extends Base {
    async getExerciseById(exericseId: number) {
        const searchParams = new URLSearchParams({
            "exercise_id": `${exericseId}`
        })
        return this.fetch<Exercise>(`${this.config.base_url}/exercise${searchParams}`)
    }

    async getExercises(filter: ExerciseFilter) {
        const searchParams = new URLSearchParams({...filter})
        return this.fetch<ExerciseResponse>(`${this.config.base_url}/exercise${searchParams}`)
    } 
}
