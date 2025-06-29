<template>
  <div class="h-full flex w-full flex-col justify-center">
    <UStepper ref="stepper" :disabled="true" :items="items">
      <template #content="{ item }">
        <OnboardingUserProfileForm
          class="flex flex-col items-center mt-20"
          v-if="item.title == 'Profile'">
        </OnboardingUserProfileForm>
        <div class="flex flex-col items-center">
          <CommonEmotionSlider
            v-if="item.title == 'Check-in'"></CommonEmotionSlider>
        </div>
        <div class="flex flex-col items-center">
          <OnboardingPreferenceForm v-if="item.title == 'Preferences'" />
        </div>
      </template>
    </UStepper>

    <div class="flex justify-between mt-auto">
      <UButton
        leading-icon="i-lucide-arrow-left"
        :disabled="!stepper?.hasPrev"
        @click="stepper?.prev()">
        Prev
      </UButton>

      <UButton
        trailing-icon="i-lucide-arrow-right"
        :disabled="!stepper?.hasNext"
        @click="stepper?.next()">
        Next
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StepperItem } from "@nuxt/ui";
import { onboardingSchema } from "~/data/onboardingSchema";

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

const stepper = useTemplateRef("stepper");
</script>
