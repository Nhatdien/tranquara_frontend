<template>
  <div class="h-full flex w-full flex-col justify-center">
    <UStepper
      v-model="currentStep"
      ref="stepper"
      :disabled="true"
      :items="items">
      <template #content="{ item }">
        <OnboardingUserProfileForm
          v-model="userProfileInfo"
          class="flex flex-col items-center mt-20"
          v-if="currentStep === 0">
        </OnboardingUserProfileForm>
        <div class="flex flex-col items-center">
          <OnboardingPreferenceForm v-model="userPreferenceInfo" v-if="currentStep === 1" />
        </div>
      </template>
    </UStepper>
    <!-- <pre class="my-4"> {{ userProfileInfo }} {{ userPreferenceInfo }}</pre> -->
    <div class="flex justify-between items-end mt-4">
      <UButton
        leading-icon="i-lucide-arrow-left"
        :disabled="!stepper?.hasPrev"
        @click="stepper?.prev()">
        {{ $t('common.prev') }}
      </UButton>

      <UButton trailing-icon="i-lucide-arrow-right" @click="nextStep">
        {{ nextStepButtonText }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StepperItem } from "@nuxt/ui";
import { onboardingSchema } from "~/data/onboardingSchema";
import InitalJournal from "./InitalJournal.vue";
import { useAuthStore } from '~/stores/stores/auth_store';

const authStore = useAuthStore();
const { t } = useI18n();
const currentStep = ref(0);
const items = computed<StepperItem[]>(() => [
  {
    title: t('onboarding.profile'),
    description: t('onboarding.profileDesc'),
    icon: "i-lucide-user",
  },
  {
    title: t('onboarding.preferences'),
    description: t('onboarding.preferencesDesc'),
    icon: "i-lucide-settings",
  },
]);

const userPreferenceInfo = ref({
  goal: "",
  experience: ""
});

const userProfileInfo = ref({
  age_range: "",
  gender: ""
});

const nextStepButtonText = computed((): string => {
  return stepper.value?.hasNext ? t('common.next') : t('common.submit');
});

const nextStep = async () => {
  if (stepper.value?.hasNext) {
    stepper.value?.next();
  } else {
    // TODO: Onboarding submission - user_information store removed
    // Onboarding data: userProfileInfo + userPreferenceInfo
    console.log('[Onboarding] Submit:', {
      name: authStore.user?.preferred_username || '',
      ...userProfileInfo.value,
      kyc_answers: { ...userPreferenceInfo.value },
    });
  }
};

const stepper = useTemplateRef("stepper");
</script>
