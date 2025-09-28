<template>
  <div class="body-container">
    <section
      class="flex justify-between items-center p-4 fixed top-0 bg-[var(--ui-bg)] z-3 w-full border-b border-gray-400 cursor-pointer">
      <div
        class="flex gap-2 items-center"
        @click="gotoHome">
        <Logo :width="32" :height="32" />
        <p class="text-2xl font-bold">
          Thera<span class="text-primary-300">Prep</span>
        </p>
      </div>
      <div class="flex justify-center item-center gap-4">
        <Bell class="w-6 h-6 mt-1 text-gray-600 hover:text-gray-400 cursor-pointer" />
        <div class="h-8 w-8 rounded-full border"></div>
      </div>
      <Sidebar></Sidebar>
    </section>
    <main class="main-content gap-x-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import TopMenu from "~/components/HomePage/TopMenu.vue";
import Sidebar from "~/components/Common/Sidebar.vue";
import Logo from "~/assets/img/Logo.vue";
import { Bell } from "lucide-vue-next";

const gotoHome = () => {
  navigateTo("/")
}
</script>
