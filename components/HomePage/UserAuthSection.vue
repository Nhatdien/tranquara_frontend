<template>
  <div class="rounded-full">
    <pre>{{ currentUserName }}</pre>
    <BackGround/>
  </div>
</template>

<script setup lang="ts">
import BackGround from '../BackGround/BackGround.vue';


const isLoading = ref();
const { $keycloak, $tranquaraSDK } = useNuxtApp();
const currentUserName = ref($keycloak.getTokenParsed()?.preferred_username);

onMounted(async () => {
  isLoading.value = true;

  try {
    await waitForToken();
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
  currentUserName.value = $tranquaraSDK.config.current_username;
});
</script>
