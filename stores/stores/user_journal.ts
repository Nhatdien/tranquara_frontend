import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import { CreateJournalRequest, Journal, JournalTemplate, JournalTemplateResponse, UserJournalsResponse } from "~/types/user_journal";
import tranquaraSDKClient from "~/plugins/tranquaraSDK.client";


export const userJournalStore = defineStore("user_journal", {
    state: () => ({
        templates: [] as JournalTemplate[],
        journals: [] as Journal[],
        currentJournal: {} as Journal
    }),

    actions: {
        async getAllTemplates() {
            return TranquaraSDK.getInstance().getAllTemplates().then((response: JournalTemplateResponse) => {
                this.templates = response.templates
            })
        },

        async getJournalById(journalId: string) {
            return TranquaraSDK.getInstance().getJournalById(journalId).then((response: Journal) => {
                this.currentJournal = response
            })
        },

        async getJournals() {
            return TranquaraSDK.getInstance().getJournals().then((response: UserJournalsResponse) => {
                this.journals = response.user_journals
            })
        },

        async createJournal(journal: CreateJournalRequest) {
            return TranquaraSDK.getInstance().createJournal(journal).then((response: Journal) => {
                this.journals.push(response)
                this.currentJournal = response
            })
        },

        async updateJournal(journal: Journal) {
            return TranquaraSDK.getInstance().updateJournal(journal).then((response: Journal) => {
                const index = this.journals.findIndex(j => j.id === response.id)
                if (index !== -1) this.journals[index] = response
            })
        },

        async deleteJournal(journalId: string) {
            return TranquaraSDK.getInstance().deleteJournal(journalId).then(() => {
                this.journals = this.journals.filter(j => j.id !== journalId)
            })
        },
    },
        getters: {
            templateGroupedByCategory(): { [key: string]: JournalTemplate[] } {
                const groupedTemplate = this.templates.reduce((acc, template) => {
                    if (!acc[template.category]) {
                        acc[template.category] = [template]
                    }
                    else {
                        acc[template.category].push(template)
                    }

                    return acc
                }, {} as { [key: string]: JournalTemplate[] })

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
