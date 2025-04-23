import { Base } from "../base";
import {ProgramExercise } from "~/types/program_exercise";

export class ProgramExercises extends Base {
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
