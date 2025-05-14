<template>
  <nav class="flex p-2 gap-2 rounded-full glass-2 justify-center">
      <button @click="navigateTo(sidebar.link)" v-for="sidebar in sidebarSchema" class="glass-button w-min p-3 rounded-full">

        <component class="" :is="componentMapping[sidebar.icon]"/>
      </button>

  </nav>
</template>

<script setup lang="ts">
import { sidebarSchema } from './sidebarSchema';
import { Settings, House, User, BotMessageSquare } from 'lucide-vue-next';

const componentMapping = {
  "settings": Settings,
  "house": House,
  "user":User,
  "bot-message-square": BotMessageSquare
} as {[key:string]: any}
</script>

<style scoped>
.active {
  background-color: #f0f0f0; /* Change to your desired active background color */
  font-weight: bold;
}

.hover:hover {
  background-color: #e0e0e0; /* Change to your desired hover background color */
}
</style>
