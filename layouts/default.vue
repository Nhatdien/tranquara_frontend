<template>
  <div class="body-container">
    <section
      class="flex justify-between p-4 fixed top-0 bg-[var(--ui-bg)] z-3 w-full border-b border-gray-400 cursor-pointer">
      <div
        class="flex gap-2 items-center"
        @click="
          () => {
            navigateTo('/');
          }
        ">
        <Logo :width="32" :height="32" />
        <p class="text-3xl font-bold">
          Thera<span class="text-primary-300">Prep</span>
        </p>
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
import { NotebookPen } from "lucide-vue-next";
</script>
