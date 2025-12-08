<template>
  <div>
    <!-- Login Card -->
    <UCard class="shadow-2xl">
      <template #header>
        <h2 class="text-2xl font-semibold text-highlighted">
          Welcome Back
        </h2>
        <p class="text-sm text-muted mt-1">
          Sign in to continue your journey
        </p>
      </template>

      <div class="p-2">
        <!-- Error Message -->
        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          icon="i-heroicons-exclamation-triangle"
          :title="errorMessage"
          class="mb-6"
          @close="errorMessage = ''"
        />

        <!-- Login Form -->
        <form @submit.prevent="handleLogin">
          <!-- Username/Email Field -->
          <UFormField label="Username or Email" name="username" required class="w-full">
            <UInput
              v-model="username"
              type="text"
              placeholder="Enter your username"
              icon="i-heroicons-user"
              size="xl"
              :disabled="isLoading"
              required
              class="w-full text-base py-4"
            />
          </UFormField>

          <!-- Password Field -->
          <UFormField label="Password" name="password" required class="w-full">
            <UInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              icon="i-heroicons-lock-closed"
              size="xl"
              :disabled="isLoading"
              required
              class="w-full text-base py-4"
            >
              <template #trailing>
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between pt-4">
            <UCheckbox v-model="rememberMe" label="Remember me" />
            <NuxtLink
              to="/forgot-password"
              class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Forgot password?
            </NuxtLink>
          </div>

          <!-- Login Button -->
          <UButton
            type="submit"
            block
            size="xl"
            :loading="isLoading"
            :disabled="!username || !password"
            class="w-full mt-8 py-4 text-lg"
          >
            Sign In
          </UButton>
        </form>
      </div>

      <template #footer>
        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-elevated text-muted">
              Don't have an account?
            </span>
          </div>
        </div>

        <!-- Register Link -->
        <NuxtLink to="/register">
          <UButton variant="outline" block size="lg">
            Create Account
          </UButton>
        </NuxtLink>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/stores/auth_store';

// Define page meta (use auth layout)
definePageMeta({
  layout: 'auth',
});

const authStore = useAuthStore();

// Form state
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

// Handle login
const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login({
      username: username.value,
      password: password.value,
    });

    // Navigate to home page
    await navigateTo('/', { replace: true });
  } catch (error: any) {
    errorMessage.value = error.message || 'Login failed. Please check your credentials.';
  } finally {
    isLoading.value = false;
  }
};
</script>
