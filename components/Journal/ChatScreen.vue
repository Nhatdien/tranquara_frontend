<template>
  <section class="h-[50vh]">
    <div class="chat-header">🤖 Tranquara Bot</div>
    <transition-group
      name="message-pop"
      tag="div"
      class="overflow-y-scroll h-2/3">
      <div
        v-for="(msg, i) in useChatlogtore().messages"
        :key="i"
        :class="['chat-message', msg.sender_type]">
        {{ msg.message }}
      </div>
      <div ref="chatBoxBottom" key="999"></div>
    </transition-group>
    <form class="chat-input" @submit.prevent="sendMessage">
      <input
        v-model="input"
        type="text"
        placeholder="Ask something..."
        class="" />
      <button type="submit" class="glass-button">➤</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useChatlogtore } from "~/stores/stores/chatlog";
import { WebSocketClient } from "~/stores/websocket_client";
import { Chatlog } from "~/types/chatlog";
import { InitConnectData, TemplateData } from "~/types/user_journal";

type ChatMessage = {
  sender_type: "user" | "bot";
  message: string;
};

const { $keycloak } = useNuxtApp();
const chatlogStore = useChatlogtore();
const config = useRuntimeConfig();
const socketClient = ref();
const input = ref("");
// const props = defineProps(["templateId", "currentPreviewContent"])
const props = defineProps({
  templateId: {
    type: String,
    required: true,
  },
  currentPreviewContent: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    default: "new",
    required: false,
  },
});

const selectedTemplate = computed(() =>
  userJournalStore().templates.find(
    (template) => props.templateId === template.id
  )
);

const greetChat = computed(() => {
  const greetList = selectedTemplate.value?.greetings as [];

  console.log(greetList);
  const randIdx = Math.floor(Math.random() * greetList?.length || 0);

  return greetList[randIdx] ?? "Hi";
});

const chatBoxBottom = ref<HTMLDivElement | null>(null);
function sendMessage() {
  if (!input.value.trim()) return;

  if (useChatlogtore().messages.length <= 1 && props.mode === "new") {
    // Create new journal
    userJournalStore().createJournal({
      title: "Journal",
      content: props.currentPreviewContent,
      template_id: props.templateId,
      mood: "Neutral",
    });
  }

  // Add user message
  useChatlogtore().messages.push({ sender_type: "user", message: input.value });
  const userMessage = input.value;
  socketClient.value.send(
    JSON.stringify({
      content: userMessage,
      current_journal: props.currentPreviewContent,
      journal_id: userJournalStore().currentJournal.id
    })
  );

  input.value = "";
  // Add bot reply (simple echo for now)
}

const createSocketConnection = () => {
  const initMetadata: InitConnectData = {
    user_info: userInformationStore().userInfomation,
    template_data: {
      title: selectedTemplate.value?.title || "",
      content: selectedTemplate.value?.content || [],
      category: selectedTemplate.value?.category || "",
    },
  };

  socketClient.value = WebSocketClient.getInstance(
    `${config.public.websocketURL}/${$keycloak.getUserUUid()}`,
    initMetadata
  );

  socketClient.value.socket.onmessage = async (event: any) => {
    const response = JSON.parse(event.data);
    useChatlogtore().messages.push({
      sender_type: "bot",
      message: `${response?.content}`,
    });
  };
};

onMounted(async () => {
  await waitForToken();

  // useChatlogtore().messages.push({ sender_type: "bot", message: greetChat.value });
  createSocketConnection();
});

watch(useChatlogtore().messages, async () => {
  console.log("called");
  await nextTick(() => {
    const chatBoxValue = chatBoxBottom.value!;
    console.log(chatBoxValue);
    chatBoxValue.scrollIntoView();
  });

  console.log("called");
});

watch(
  () => chatlogStore.chatlogs,
  async () => {
    useChatlogtore().messages = [
      useChatlogtore().messages[0],
      ...(chatlogStore.chatlogs as ChatMessage[]),
    ];
  }
);
</script>

<style lang="scss" scoped>
.chatbot-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  flex: 1;
  bottom: 24px;
  right: 24px;
  font-family: "Segoe UI", sans-serif;
}

.chat-header {
  text-align: center;
  font-weight: bold;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.chat-message {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 16px;
  max-width: 80%;
  word-wrap: break-word;
}

.chat-message.user {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.4);
  color: #000;
}

.chat-message.bot {
  align-self: flex-start;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
}

.chat-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  outline: none;
  color: #fff;
}

.chat-input button {
  width: 40px;
  height: 40px;
  font-size: 16px;
  color: #000;
  cursor: pointer;
  display: grid;
  place-items: center;
  border: none;
}

.message-pop-enter-active {
  transition: all 0.25s ease-out;
}
.message-pop-enter-from {
  transform: scale(0.9);
  opacity: 0;
}
.message-pop-enter-to {
  transform: scale(1);
  opacity: 1;
}
</style>
