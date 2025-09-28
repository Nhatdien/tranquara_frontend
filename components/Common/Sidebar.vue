<template>
  <nav class="flex fixed bottom-0 left-0 w-full h-20 p-2 bg-[var(--ui-bg-elevated)]">
    <UButton
      variant="ghost"
      @click="navigateTo(sidebar.link)"
      v-for="sidebar in sidebarSchema"
      :key="sidebar.link"
      class="flex-1 p-3">
      <div class="flex flex-col flex-1 justify-center items-center gap-2">
        <component class="flex-1" :is="componentMapping[sidebar.icon]" />
        <p>{{ sidebar.title }}</p>
      </div>
    </UButton>
  </nav>
</template>

<script setup lang="ts">
import { UButton } from "#components";
import { sidebarSchema } from "./sidebarSchema";
import { Settings, House, User, Notebook, Library } from "lucide-vue-next";

const componentMapping = {
  settings: Settings,
  house: House,
  user: User,
  notebook: Notebook,
  library: Library,
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
