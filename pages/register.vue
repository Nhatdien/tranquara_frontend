<template>
  <div>
    <!-- Register Card -->
    <UCard class="shadow-2xl">
      <template #header>
        <h2 class="text-2xl font-semibold text-highlighted">
          {{ $t('auth.createAccount') }}
        </h2>
        <p class="text-sm text-muted mt-1">
          {{ $t('auth.joinTheraPrep') }}
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

        <!-- Success Message -->
        <UAlert
          v-if="successMessage"
          color="success"
          variant="soft"
          icon="i-heroicons-check-circle"
          :title="successMessage"
          class="mb-6"
        />

        <!-- Registration Form -->
        <form @submit.prevent="handleRegister">
          <!-- Email Field -->
          <UFormField :label="$t('auth.email')" name="email" required class="w-full">
            <UInput
              v-model="email"
              type="email"
              :placeholder="$t('auth.enterEmail')"
              icon="i-heroicons-envelope"
              size="xl"
              :disabled="isLoading"
              required
              class="w-full text-base py-4"
            />
          </UFormField>

          <!-- Username Field -->
          <UFormField :label="$t('auth.username')" name="username" required class="w-full">
            <UInput
              v-model="username"
              type="text"
              :placeholder="$t('auth.chooseUsername')"
              icon="i-heroicons-user"
              size="xl"
              :disabled="isLoading"
              required
              class="w-full text-base py-4"
            />
            <template #hint>
              <span class="text-xs text-muted">
                {{ $t('auth.usernameHint') }}
              </span>
            </template>
          </UFormField>

          <!-- Password Field -->
          <UFormField :label="$t('auth.password')" name="password" required class="w-full">
            <UInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('auth.createPassword')"
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
            <template #hint>
              <span class="text-xs text-muted">
                {{ $t('auth.passwordHint') }}
              </span>
            </template>
          </UFormField>

          <!-- Confirm Password Field -->
          <UFormField :label="$t('auth.confirmPassword')" name="confirmPassword" required class="w-full">
            <UInput
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('auth.confirmYourPassword')"
              icon="i-heroicons-lock-closed"
              size="xl"
              :disabled="isLoading"
              required
              class="w-full text-base py-4"
            />
          </UFormField>

          <!-- Terms Agreement -->
          <UCheckbox
            v-model="agreeToTerms"
            :disabled="isLoading"
            required
            class="pt-4"
          >
            <template #label>
              <span class="text-sm">
                {{ $t('auth.agreeToTerms') }}
                <NuxtLink to="/terms" class="text-primary-600 hover:underline">{{ $t('auth.termsOfService') }}</NuxtLink>
                {{ $t('auth.and') }}
                <NuxtLink to="/privacy" class="text-primary-600 hover:underline">{{ $t('auth.privacyPolicy') }}</NuxtLink>
              </span>
            </template>
          </UCheckbox>

          <!-- Register Button -->
          <UButton
            type="submit"
            block
            size="xl"
            :loading="isLoading"
            :disabled="!isFormValid"
            class="w-full mt-8 py-4 text-lg"
          >
            {{ $t('auth.createAccount') }}
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
              {{ $t('auth.alreadyHaveAccount') }}
            </span>
          </div>
        </div>

        <!-- Login Link -->
        <NuxtLink to="/login">
          <UButton variant="outline" block size="lg">
            {{ $t('auth.signIn') }}
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
const { t } = useI18n();

// Form state
const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const agreeToTerms = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Form validation
const isFormValid = computed(() => {
  return (
    email.value &&
    username.value &&
    password.value &&
    confirmPassword.value &&
    password.value === confirmPassword.value &&
    password.value.length >= 8 &&
    agreeToTerms.value
  );
});

// Handle registration
const handleRegister = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    errorMessage.value = t('auth.passwordsNoMatch');
    return;
  }

  // Validate password length
  if (password.value.length < 8) {
    errorMessage.value = t('auth.passwordHint');
    return;
  }

  isLoading.value = true;

  try {
    await authStore.register({
      email: email.value,
      username: username.value,
      password: password.value,
    });

    successMessage.value = t('auth.registrationSuccess');

    // Navigate to home page
    setTimeout(async () => {
      await navigateTo('/', { replace: true });
    }, 1000);
  } catch (error: any) {
    errorMessage.value = error.message || t('auth.registrationFailed');
  } finally {
    isLoading.value = false;
  }
};
</script>
