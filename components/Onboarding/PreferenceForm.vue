<template>
  <UForm :state="model" :schema="schema">
    <div>
      <h3>{{ $t('onboarding.goalQuestion') }}</h3>
      <URadioGroup
      
        :variant="'table'"
        class="mt-2"
        v-model="model.goal"
        :items="goalItems"
        :ui="{
          label: 'text-xl',
          item: 'mt-1',
        }" />
    </div>
    <div class="mt-8">
      <h3>{{ $t('onboarding.experienceQuestion') }}</h3>
      <URadioGroup
        :variant="'table'"
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

const { t } = useI18n();

const schema = z.object({
  goal: z
    .string()
    .nonempty(),
  experience: z.string().nonempty(),
});

type Schema = z.output<typeof schema>;

const model = defineModel<Schema>({required: true});
const goalItems = computed<RadioGroupItem[]>(() => [
  {
    label: t('onboarding.goals.journaling'),
    value: "Journaling emotions",
  },
  {
    label: t('onboarding.goals.therapy'),
    value: "Preparing for a therapy session",
  },
  {
    label: t('onboarding.goals.tracking'),
    value: "Tracking emotional patterns",
  },
  {
    label: t('onboarding.goals.selfReflection'),
    value: "Self-reflection",
  },
  {
    label: t('onboarding.goals.other'),
    value: "Other",
  },
]);

const experienceItems = computed<RadioGroupItem[]>(() => [
  {
    label: t('onboarding.experience.yes'),
    value: "Yes",
  },
  {
    label: t('onboarding.experience.no'),
    value: "No",
  },
  {
    label: t('onboarding.experience.preferNotToSay'),
    value: "Prefer not to say",
  },
]);

</script>
