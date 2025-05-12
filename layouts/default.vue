<template>
  <div class="body-container">
    <BackGround />
      <main class="main-content gap-x-4 glass-1">
        <!-- <TopMenu></TopMenu> -->
        <Sidebar></Sidebar>
        <slot />
      </main>
  </div>
</template>

<script setup lang="ts">
import TopMenu from "~/components/HomePage/TopMenu.vue";
import Sidebar from "~/components/Common/Sidebar.vue";
</script>
