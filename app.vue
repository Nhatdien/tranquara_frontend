<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import TranquaraSDK from "./stores/tranquara_sdk";
import { useWebSocket } from "@vueuse/core";
const config = useRuntimeConfig();
const exerciseStore = useExerciseStore();
const { $keycloak, $tranquaraSDK } = useNuxtApp();

// const { status, data, send, open, close } = useWebSocket($tranquaraSDK.config.websocket_url || "", {
//   onConnected(ws) {
//     console.log("Connected to: ", ws)
//   },
//   autoReconnect: {
//     retries: 5,
//     delay: 3000,
//   },
//   immediate: true,
//   onDisconnected(ws, event) {
//     console.log("Disconnected with reason: ", event.reason)
//   },
// })
// await callOnce('exercise', async () => {
//   await waitForToken()
//   exerciseStore.getExercises({})
//   console.log(exerciseStore.exercises)
//   console.log()
// }, {
//   mode: "navigation"
// })

onMounted(async () => {
  await waitForToken();
});
</script>
