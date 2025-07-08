<script setup lang="ts">
import * as z from "zod";
import { RadioGroupItem, type FormSubmitEvent } from "@nuxt/ui";

const schema = z.object({
  age: z
    .number()
    .min(12, "Age should be more than 12")
    .max(120, "Age should be less than 120"),
  gender: z.string(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>(userInformationStore().onboardingState.profile);

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: "Success",
    description: "The form has been submitted.",
    color: "success",
  });
  console.log(event.data);
}

const genderItems = ref<RadioGroupItem[]>([
  {
    label: "Male",
    value: "Male",
  },
  {
    label: "Female",
    value: "Female",
  },
  {
    label: "Prefer not to say",
    value: "Prefer not to say",
  },
]);


</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-8" @submit="onSubmit">
    <UFormField size='xl' name="gender">
      <h3>Gender</h3>
      <URadioGroup :items="genderItems" v-model="state.gender" />
    </UFormField>

    <UFormField size='xl'  name="age">
      <h3>Age</h3>
      <UInput v-model="state.age" type="number" />
    </UFormField>

    <!-- <UButton type="submit"> Submit </UButton> -->
  </UForm>
</template>
