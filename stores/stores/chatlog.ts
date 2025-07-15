import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import type { BaseFilter } from "~/types/metadatas";
import type { ChatlogResponse, Chatlog } from "~/types/chatlog";

export const useChatlogtore = defineStore("chatlogs", {
    state: () => ({
        chatlogs: [] as Chatlog[],
    }),

    actions: {
        async getChatlogs(filter: BaseFilter) {
            return TranquaraSDK.getInstance().getChatLogs(filter).then((response: ChatlogResponse) => {
                this.chatlogs = response.chat_logs
            })
        },

    }
})
