import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import type { BaseFilter } from "~/types/metadatas";
import type { ChatlogResponse, Chatlog } from "~/types/chatlog";

type ChatMessage = {
    sender_type: "user" | "bot";
    message: string;
};

export const useChatlogtore = defineStore("chatlogs", {
    state: () => ({
        chatlogs: [] as Chatlog[],
        messages: [] as ChatMessage[]
    }),

    actions: {
        async getChatlogs(journalId: string) {
            return TranquaraSDK.getInstance().getChatLogs(journalId).then((response: ChatlogResponse) => {
                this.chatlogs = response.chat_logs
            })
        },

    }
})
