<template>
  <section class="h-[85vh]">
    <div class="chat-header">🤖 Tranquara Bot</div>
    <transition-group
      name="message-pop"
      tag="div"
      class="overflow-y-scroll max-h-[65vh]">
      <div
        v-for="(msg, i) in messages"
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

const route = useRoute();

const selectedTemplate = computed(() =>
  userJournalStore().templates.find((template) => route.query.templateId === template.id)
);

const greetChat = computed(() => {
  console.log(route.query);

  const greetList = selectedTemplate.value?.greetings as [];

  console.log(greetList);
  const randIdx = Math.floor(Math.random() * greetList?.length || 0);

  return greetList[randIdx] ?? "Hi";
});

const messages = ref<ChatMessage[]>([]);

const chatBoxBottom = ref<HTMLDivElement | null>(null);
function sendMessage() {
  if (!input.value.trim()) return;

  // Add user message
  messages.value.push({ sender_type: "user", message: input.value });
  const userMessage = input.value;
  socketClient.value.send(userMessage);

  input.value = "";
 
  if (userJournalStore().currentJournal.status !== "active"){
    userJournalStore().updateJournal({
      ...userJournalStore().currentJournal,
      status: "active",
    })
  }
  // Add bot reply (simple echo for now)
}

const createSocketConnection = () => {
  const initMetadata: InitConnectData = {
    user_info: userInformationStore().userInfomation,
    journal_id: userJournalStore().currentJournal.id,
    template_data: {
      title: selectedTemplate.value?.title || "",
      content: selectedTemplate.value?.content || "",
      category: selectedTemplate.value?.category || "",
    },
  };

  socketClient.value = WebSocketClient.getInstance(
    `${config.public.websocketURL}/${$keycloak.getUserUUid()}`, initMetadata
  );

  socketClient.value.socket.onmessage = async (event: any) => {
    console.log(event.data)
    messages.value.push({
      sender_type: "bot",
      message: `${event.data?.content}`,
    });
  };
};

onMounted(async () => {
  await waitForToken();
  
  messages.value.push({ sender_type: "bot", message: greetChat.value });

  //check if the active journal is equal to the localstorage value to get the chatlog or create a new one
  const prevActiveJounral = localStorage.getItem("active_journal_id") 
  if (prevActiveJounral === userJournalStore().currentJournal.id){
    chatlogStore.getChatlogs(localStorage.getItem("active_journal_id") || "");
  }
  else {
    await userJournalStore().createJournal({
      template_id:  route.query.templateId as string
    })
    localStorage.setItem("active_journal_id",  userJournalStore().currentJournal.id)
  }


  createSocketConnection();
});

watch(messages.value, async () => {
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
    messages.value = [
      messages.value[0],
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
