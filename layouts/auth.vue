<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4">
    <div class="w-full max-w-md flex flex-col">
      <!-- Logo/Branding -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
          TheraPrep
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Your mental wellness companion
        </p>
      </div>

      <!-- Page Content (login/register forms) -->
      <div class="flex-shrink-0">
        <slot />
      </div>

      <!-- Terms & Privacy -->
      <div class="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
        By continuing, you agree to our
        <NuxtLink to="/terms" class="text-primary-600 hover:underline">Terms</NuxtLink>
        and
        <NuxtLink to="/privacy" class="text-primary-600 hover:underline">Privacy Policy</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth layout - provides branding and styling for login/register pages
// Token clearing is handled by individual pages, not the layout
</script>
