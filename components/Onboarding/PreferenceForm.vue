<template>
  <div>
    <h3>What is you goal using this webiste ?</h3>
    <URadioGroup :variant="'card'" class="mt-2" v-model="goalValue" :items="goalItems" :ui="{
        'label': 'text-xl',
        'item': 'mt-1'
    }" />
  </div>
  <div class="mt-8">
    <h3>Have you had any experience with mental therapy?</h3>
    <URadioGroup :variant="'card'" class="mt-2" v-model="experienceValue" :items="experienceItems" :ui="{
        'label': 'text-xl',
        'item': 'mt-1'
    }" />
  </div>
</template>

<script setup lang="ts">
import type { RadioGroupItem, RadioGroupValue } from "@nuxt/ui";

const userInfoStore = userInformationStore()
const goalItems = ref<RadioGroupItem[]>([
  {
    label: "Journaling emotions",
    // description: "This is the first option.",
    value: "Journaling emotions",
  },
  {
    label: "Preparing for a therapy session",
    // description: "This is the second option.",
    value: "Preparing for a therapy session",
  },
  {
    label: "Tracking emotional patterns",
    // description: "This is the third option.",
    value: "Tracking emotional patterns",
  },
  {
    label: "Self-reflection",
    // description: "This is the third option.",
    value: "Self-reflection",
  },
  {
    label: "Other",
    // description: "This is the third option.",
    value: "Other",
  },
]);
const goalValue = ref<RadioGroupValue>();

const experienceItems = ref<RadioGroupItem[]>([
    {
        "label": "Yes",
        "value": "Yes"
    },
    {
        "label": "No",
        "value": "No"
    },
    {
        "label": "Prefer not to say",
        "value": "Prefer not to say"
    },
])

const experienceValue = ref<RadioGroupValue>()

watch([goalValue, experienceValue], () => {
  userInfoStore.onboardingState.preference.goal = goalValue.value as string
  userInfoStore.onboardingState.preference.therapy_experience = experienceValue.value as string

})
</script>
