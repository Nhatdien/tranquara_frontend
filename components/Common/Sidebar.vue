<template>
  <UDrawer direction="right">
    <UButton color="neutral" variant="ghost" trailing-icon="i-lucide-menu" />

    <template #content>
      <nav class="flex flex-col w-full p-2 gap-2 rounded-full justify-center">
        <UButton
          variant="ghost"
          @click="navigateTo(sidebar.link)"
          v-for="sidebar in sidebarSchema"
          class="w-min p-3 rounded-full">
          <div class="flex items-center gap-2">
            <component class="" :is="componentMapping[sidebar.icon]" />
            <p>{{ sidebar.title }}</p>
          </div>
        </UButton>
      </nav>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { UButton } from "#components";
import { sidebarSchema } from "./sidebarSchema";
import { Settings, House, User, BotMessageSquare } from "lucide-vue-next";

const componentMapping = {
  settings: Settings,
  house: House,
  user: User,
  "bot-message-square": BotMessageSquare,
} as { [key: string]: any };
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
