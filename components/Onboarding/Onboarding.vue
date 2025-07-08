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
          v-if="item.title == 'Profile'">
        </OnboardingUserProfileForm>
        <div class="flex flex-col items-center">
          <OnboardingInitalJournal
            v-if="item.title == 'Check-in'"></OnboardingInitalJournal>
        </div>
        <div class="flex flex-col items-center">
          <OnboardingPreferenceForm v-if="item.title == 'Preferences'" />
        </div>
      </template>
    </UStepper>
    <pre class="my-4">{{ userInformationStore().onboardingState }}</pre>
    <div class="flex justify-between mt-auto">
      <UButton
        leading-icon="i-lucide-arrow-left"
        :disabled="!stepper?.hasPrev"
        @click="stepper?.prev()">
        Prev
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

const { $keycloak } = useNuxtApp();
const currentStep = ref(0);
const items: StepperItem[] = [
  {
    title: "Profile",
    description: "Tell us about yourself",
    icon: "i-lucide-user",
  },
  {
    title: "Preferences",
    description: "Choose your goals and therapy experience",
    icon: "i-lucide-settings",
  },
  {
    title: "Check-in",
    description: "Log your current mood and emotions",
    icon: "i-lucide-smile",
  },
];

const userProfileInfo = ref({});

const nextStepButtonText = computed((): string => {
  return stepper.value?.hasNext ? "Next" : "Submit";
});

const onboardingState = userInformationStore().onboardingState;
const nextStep = async () => {
  if (stepper.value?.hasNext) {
    stepper.value?.next();
  } else {
    await userInformationStore().sendOnboardingInfo({
      name: $keycloak.getTokenParsed()?.preferred_username,
      ...onboardingState.profile,
      kyc_answers: {
        ...onboardingState.preference,
      },
      user_settings: {},
    });
  }
};

const stepper = useTemplateRef("stepper");
</script>
