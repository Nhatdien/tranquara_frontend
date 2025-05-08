<template>
  <div class="rounded-full">
    <pre>{{ currentUserName }}</pre>
    <!-- <button class="z-30" @click="socket.send('Siuuu')"> Siuuuuu</button> -->
  
    <div>

      <BackGround class="z-0"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import nuxtConfig from '~/nuxt.config';
import BackGround from '../BackGround/BackGround.vue';
import { WebSocketClient } from '~/stores/websocket_client';

const isLoading = ref();
const { $keycloak, $tranquaraSDK } = useNuxtApp();
const currentUserName = ref($keycloak?.getTokenParsed()?.preferred_username);

const socket = ref()

onMounted(async () => {
  isLoading.value = true;
  try {
    await waitForToken();
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
  console.log($keycloak?.getTokenParsed())

  // currentUserName.value = $tranquaraSDK.config.current_username;
});
</script>
