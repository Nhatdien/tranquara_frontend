<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { userJournalStore } from "./stores/stores/user_journal";
import TranquaraSDK from "./stores/tranquara_sdk";
import { useWebSocket } from "@vueuse/core";
import { Capacitor } from "@capacitor/core";

const config = useRuntimeConfig();
const userInfoStore = userInformationStore();

onMounted(async () => {
  // await waitForToken();
  // userJournalStore().getAllTemplates();
  // userInfoStore.getMe();
});
</script>
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  transform: scale(90%);
  opacity: 0;
}


.layout-enter-active,
.layout-leave-active {
  transition: all 0.2s;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>