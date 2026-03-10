<script setup lang="ts">
import * as z from "zod";
import { RadioGroupItem, type FormSubmitEvent } from "@nuxt/ui";

const { t } = useI18n();

const schema = z.object({
  age_range: z.string(),
  gender: z.string(),
});

type Schema = z.output<typeof schema>;

const model = defineModel<Schema>({required: true})

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: t('onboarding.success'),
    description: t('onboarding.formSubmitted'),
    color: "success",
  });
  console.log(event.data);
}

const genderItems = computed<RadioGroupItem[]>(() => [
  {
    label: t('onboarding.male'),
    value: "Male",
  },
  {
    label: t('onboarding.female'),
    value: "Female",
  },
  {
    label: t('onboarding.preferNotToSay'),
    value: "Prefer not to say",
  },
]);

const ageRangeItem = ref<RadioGroupItem[]>([
  {
    label: "< 13",
    value: "< 13",
  },
  {
    label: "13 - 18",
    value: "13 - 18",
  },
  {
    label: "> 18",
    value: "> 18",
  },
]);


</script>

<template>
  <UForm :schema="schema" :state="model" class="space-y-8" @submit="onSubmit">
    <UFormField size='xl' name="gender">
      <h3>{{ $t('onboarding.gender') }}</h3>
      <URadioGroup variant="table" :items="genderItems" v-model="model.gender" />
    </UFormField>

    <UFormField size='xl'  name="age">
      <h3>{{ $t('onboarding.ageRange') }}</h3>
      <URadioGroup variant="table" :items="ageRangeItem" v-model="model.age_range" />
    </UFormField>

    <!-- <UButton type="submit"> Submit </UButton> -->
  </UForm>
</template>
