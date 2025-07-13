<template>
  <UForm :state="model" :schema="schema">
    <div>
      <h3>What is you goal using this webiste ?</h3>
      <URadioGroup
        :variant="'card'"
        class="mt-2"
        v-model="model.goal"
        :items="goalItems"
        :ui="{
          label: 'text-xl',
          item: 'mt-1',
        }" />
    </div>
    <div class="mt-8">
      <h3>Have you had any experience with mental therapy?</h3>
      <URadioGroup
        :variant="'card'"
        class="mt-2"
        v-model="model.experience"
        :items="experienceItems"
        :ui="{
          label: 'text-xl',
          item: 'mt-1',
        }" />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { RadioGroupItem, RadioGroupValue } from "@nuxt/ui";
import * as z from "zod";

const schema = z.object({
  goal: z
    .string()
    .nonempty(),
  experience: z.string().nonempty(),
});

type Schema = z.output<typeof schema>;

const model = defineModel<Schema>({required: true});
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

const experienceItems = ref<RadioGroupItem[]>([
  {
    label: "Yes",
    value: "Yes",
  },
  {
    label: "No",
    value: "No",
  },
  {
    label: "Prefer not to say",
    value: "Prefer not to say",
  },
]);

</script>
