import { Base } from "../base";
import { Exercise, ExerciseFilter } from "~/types/exercise";

export class Exercises extends Base {
    async getExerciseById(exericseId: number): Promise<Exercise> {
        const searchParams = new URLSearchParams({
            "exercise_id": `${exericseId}`
        })
        return this.fetch<Exercise>(`${this.config.base_url}/exercise?${searchParams}`)
    }

    async getExercises(filter: ExerciseFilter): Promise<Exercise[]> {
        const searchParams = new URLSearchParams({...filter})
        return this.fetch<Exercise[]>(`${this.config.base_url}/exercise?${searchParams}`)
    } 
}
