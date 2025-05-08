import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import { Exercise, ExerciseResponse, ExerciseFilter } from "~/types/exercise";


export const useExerciseStore = defineStore("exercises", {
    state: () => ({
        exercises: [] as Exercise[],
    }),

    actions: {
        async getExercises(filter: ExerciseFilter) {
            return TranquaraSDK.getInstance().getExercises(filter).then((response: ExerciseResponse) => {
                this.exercises = response.exercise
            })
        },

        // async getExerciseByID(exerciseId:number) {
        //     return TranquaraSDK.getInstance().getExerciseById
        // }

    }
})
