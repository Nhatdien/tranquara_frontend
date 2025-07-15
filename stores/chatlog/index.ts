import { Base } from "../base";
import type { BaseFilter } from "~/types/metadatas";
import type { ChatlogResponse } from "~/types/chatlog";

export class Chatlogs extends Base {
    async getChatLogs(filter?: BaseFilter) {
        const searchParams = new URLSearchParams({
            ...filter
        })

        let searchString
        if (filter){    
            searchString = `?${searchParams}`
        }

        return this.fetch<ChatlogResponse>(`${this.config.base_url}/guider_chatlogs${searchString}`)
    }
}
