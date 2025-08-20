import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import type { BaseFilter } from "~/types/metadatas";
import type { ChatlogResponse, Chatlog } from "~/types/chatlog";

export const useChatlogtore = defineStore("chatlogs", {
    state: () => ({
        chatlogs: [] as Chatlog[],
    }),

    actions: {
        async getChatlogs(journalId: string) {
            return TranquaraSDK.getInstance().getChatLogs(journalId).then((response: ChatlogResponse) => {
                this.chatlogs = response.chat_logs
            })
        },

    }
})
