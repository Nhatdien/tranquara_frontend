import { Base } from "../base";
import { JournalTemplate, JournalTemplateResponse } from "~/types/user_journal";

export class UserJournals extends Base {
    async getAllTemplates(): Promise<JournalTemplateResponse> {
        return this.fetch(`${this.config.base_url}/tempalte-gallary`)
    }


}