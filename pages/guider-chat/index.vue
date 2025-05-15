<template>
  <div class="chat-header glass-2">🤖 Tranquara Bot</div>
  <transition-group class="h-full" name="message-pop" tag="div">
    <div
      v-for="(msg, i) in messages"
      :key="i"
      :class="['chat-message', msg.sender]">
      {{ msg.text }}
    </div>
  </transition-group>
  <form class="chat-input" @submit.prevent="sendMessage">
    <input
      v-model="input"
      type="text"
      placeholder="Ask something..."
      class="glass-2" />
    <button type="submit" class="glass-button">➤</button>
  </form>
</template>

<script setup>
import { ref, nextTick } from "vue";

const input = ref("");
const messages = ref([{ sender: "bot", text: "Hi! I’m here to help. 🌿" }]);

const chatBox = ref(null);
const { $socketClient } = useNuxtApp();
function sendMessage() {
  if (!input.value.trim()) return;

  // Add user message
  messages.value.push({ sender: "user", text: input.value });
  const userMessage = input.value;
  $socketClient.send(userMessage);

  input.value = "";

  // Add bot reply (simple echo for now)
}

onMounted(() => {
  $socketClient.socket.onmessage = (event) => {
    messages.value.push({
      sender: "bot",
      text: `${event.data}`,
    });
    nextTick(() => {
      chatBox.value.scrollTop = chatBox.value.scrollHeight;
    });
  };
});
</script>

<style scoped>
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
