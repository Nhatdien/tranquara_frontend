import { Editor } from "@tiptap/vue-3";
import { defineStore } from "pinia";

export const useTiptapEditorStore = defineStore("editors", {
    state: () => ({
        editors: [] as Editor[],
        currentEditor: {} as Editor
    }),

    actions: {
  

    }
})
