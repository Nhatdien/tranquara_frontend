<template>
  <div class="body-container">
      <main class="main-content gap-x-4 ">
        <slot />
        <Sidebar></Sidebar>
      </main>
  </div>
</template>

<script setup lang="ts">
import TopMenu from "~/components/HomePage/TopMenu.vue";
import Sidebar from "~/components/Common/Sidebar.vue";
</script>
