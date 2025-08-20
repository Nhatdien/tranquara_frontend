import { FilterMetaData } from "./metadatas"

export type Chatlog = {
    sender_type: string
    message: string
    created_at: Date
}

export type ChatlogResponse = {
    chat_logs: Chatlog[]
}