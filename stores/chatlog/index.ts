import { Base } from "../base";
import type { BaseFilter } from "~/types/metadatas";
import type { ChatlogResponse } from "~/types/chatlog";

export class Chatlogs extends Base {
    async getChatLogs(journalId: string) {
        const searchParams = new URLSearchParams({
            journal_id: journalId
        })

        let searchString
        if (journalId){    
            searchString = `?${searchParams}`
        }

        return this.fetch<ChatlogResponse>(`${this.config.base_url}/guider_chatlogs${searchString}`)
    }
}
