<template>
  <div class="body-container">
    <div :class="'main-content'">
      <TopMenu/>
      <UserAuthSection/>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import LogoSection from '~/components/HomePage/LogoSection.vue';
import TopMenu from '~/components/HomePage/TopMenu.vue';
import UserAuthSection from '~/components/HomePage/UserAuthSection.vue';
</script>
