<template>
  <div class="flexbox">
    <div class="flex-item">
      <div class="mood-box">
        <div class="face-wrapper">
          <div id="eyes" :class="`case${currentValue + 1}`">
            <div class="eyebrow left"></div>
            <div class="eye right-0 z-1">
              <div class="eyelid right-0 z-2"></div>
            </div>
            <div class="eye left">
              <div class="eyelid"></div>
            </div>
            <div class="bottomlid left"></div>
            <div class="eyebrow right"></div>
   
            <div class="bottomlid right-0 z-2"></div>
          </div>
          <div id="mouth" :class="`case${currentValue + 1}`">
            <div id="mouth-open"></div>
          </div>
          <div id="face-bg" :class="`case${currentValue + 1}`">
            <div class="face-light"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex-item mt-8">
      <USlider v-model="currentValue" :min="0" :max="4" :step="1"> </USlider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { emotions } from '~/data/emotionArray';

const model = defineModel()
const currentValue = ref(2);

watch(currentValue, ()=> {
  model.value = currentValue.value
})
</script>
