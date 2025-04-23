import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
;

export const useExerciseStore = defineStore("exercises", {
    state: () => ({
        exercises: [],
    })
})
