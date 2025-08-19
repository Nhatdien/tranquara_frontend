import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import { JournalTemplate, JournalTemplateResponse } from "~/types/user_journal";
import tranquaraSDKClient from "~/plugins/tranquaraSDK.client";


export const userJournalStore = defineStore("user_journal", {
    state: () => ({
        templates: [] as JournalTemplate[],
    }),

    actions: {
        async getAllTemplates() {
            return TranquaraSDK.getInstance().getAllTemplates().then((response: JournalTemplateResponse) => {
                this.templates = response.templates
            })
        },
    },

    getters: {
        templateGroupedByCategory(): {[key: string]: JournalTemplate[]} {
            const groupedTemplate =  this.templates.reduce((acc, template) => {
                if (!acc[template.category]) {
                    acc[template.category] = [template]
                }
                else {
                    acc[template.category].push(template)
                }

                return acc
            }, {} as {[key: string]: JournalTemplate[]})

            const keys = Object.keys(groupedTemplate);
            keys.sort()

            const reorderedObject = {} as typeof groupedTemplate;
            for (const key of keys) {
              reorderedObject[key] = groupedTemplate[key];
            }

            return reorderedObject
        }
    }
})
