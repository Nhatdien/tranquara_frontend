<template>
  <div
    :class="[
      'flex sm:gap-8 md:gap-8 justify-around items-center',
    
    ]">
    <UserAuthSection />
  </div>
</template>

<script setup lang="ts">
import UserAuthSection from "~/components/HomePage/UserAuthSection.vue";
import LogoSection from "~/components/HomePage/LogoSection.vue";
import { useScreen } from "~/composables/useScreen"; // Assuming you have a useScreen composable

const isSearchActive = ref(false);
const screen = useScreen();

const isMediumOrBelow = computed(() => !screen.isLargerThanMedium);

</script>

<style scoped>
.flex {
  transition: transform 0.3s ease-in-out;
}

.flex.search-active .logo-section {
  transform: translateX(-300%);
  position: absolute;
}

.user-auth-section {
  flex-shrink: 0;
}
</style>
