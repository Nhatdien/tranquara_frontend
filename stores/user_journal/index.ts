import { Base } from "../base";
import { JournalTemplate, JournalTemplateResponse, Journal, UserJournalsResponse, CreateJournalRequest } from "~/types/user_journal";

export class UserJournals extends Base {
    async getAllTemplates(): Promise<JournalTemplateResponse> {
        return this.fetch(`${this.config.base_url}/tempalte-gallary`)
    }

    async getJournalById(journalId: string): Promise<Journal> {
        return this.fetch(`${this.config.base_url}/journal?id=${journalId}`)
    }

    async getJournals(): Promise<UserJournalsResponse> {
        return this.fetch(`${this.config.base_url}/journals`)
    }

    async createJournal(journal: CreateJournalRequest): Promise<Journal> {
        return this.fetch(`${this.config.base_url}/journal`, {
            method: "POST",
            body: JSON.stringify(journal)
        })
    }

    async updateJournal(journal: Journal): Promise<Journal> {
        return this.fetch(`${this.config.base_url}/journal`, {
            method: "PUT",
            body: JSON.stringify(journal)
        })
    }


    async deleteJournal(journalId: string): Promise<void> {
        return this.fetch(`${this.config.base_url}/journal`, {
            method: "DELETE",
            body: journalId
        })
    }

}