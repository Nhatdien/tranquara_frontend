import { FilterMetaData } from "./metadatas"

export type ChatlogContent = {
    content: string
}

export type Chatlog = {
    sender_type: "user" | "bot"
    message: string
    created_at: Date
}

export type ChatlogResponse = {
    chat_logs: Chatlog[]
}