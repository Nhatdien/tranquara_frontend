<template>
  <NuxtLayout>
    <NuxtPage />
    <Toaster />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useToast } from "./components/ui/toast/use-toast";
const { toast } = useToast();

const { $keycloak, $quizzAppSDK } = useNuxtApp();


</script>
