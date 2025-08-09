<script setup lang="ts">
import * as z from "zod";
import { RadioGroupItem, type FormSubmitEvent } from "@nuxt/ui";

const schema = z.object({
  age_range: z.string(),
  gender: z.string(),
});

type Schema = z.output<typeof schema>;

const model = defineModel<Schema>({required: true})

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
      <h3>Gender</h3>
      <URadioGroup variant="table" :items="genderItems" v-model="model.gender" />
    </UFormField>

    <UFormField size='xl'  name="age">
      <h3>Age Range</h3>
      <URadioGroup variant="table" :items="ageRangeItem" v-model="model.age_range" />
    </UFormField>

    <!-- <UButton type="submit"> Submit </UButton> -->
  </UForm>
</template>
