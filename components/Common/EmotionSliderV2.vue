<template>
  <div class="emotion-slider-container" :data-mood="moodType">
    <!-- Animated Face Display -->
    <div class="face-container">
      <div class="face" :style="faceStyle">
        <!-- Eyes -->
        <div class="eyes">
          <div class="eye left">
            <svg class="eye-bg" viewBox="0 0 80 75" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M42 69C27.6 74.6 10 32.6667 3 11C24.3333 9.33332 68.2 6.99999 73 11C79 16 60 62 42 69Z" fill="white" stroke="currentColor" stroke-width="3"/>
            </svg>
            <svg class="pupil" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" :style="pupilStyle">
              <circle cx="5" cy="5" r="5" fill="currentColor"/>
            </svg>
          </div>
          <div class="eye right">
            <svg class="eye-bg" viewBox="0 0 80 75" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M31 69C25.4 69 10 30.3333 3 11C16.6 11 52.6667 5 69 2C82 26 38 69 31 69Z" fill="white" stroke="currentColor" stroke-width="3"/>
            </svg>
            <svg class="pupil" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" :style="pupilStyle">
              <circle cx="5" cy="5" r="5" fill="currentColor"/>
            </svg>
          </div>
        </div>
        
        <!-- Mouth - morphs from frown to smile -->
        <svg class="mouth" viewBox="0 0 117 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path :d="mouthPath" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none"/>
        </svg>
      </div>
    </div>

    <!-- Mood Label -->
    <div class="mood-label-container">
      <span class="mood-label" :style="{ color: moodColor }">{{ moodLabel }}</span>
      <span class="mood-score">{{ currentValue }}/10</span>
    </div>

    <!-- Slider -->
    <div class="slider-container">
      <div class="slider-labels">
        <span class="label-icon">😢</span>
        <span class="label-icon">😊</span>
      </div>
      <div class="slider-track" :style="sliderTrackStyle">
        <input 
          type="range"
          :value="currentValue"
          @input="onSliderInput"
          min="1"
          max="10"
          step="1"
          class="emotion-range"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<number>({ default: 5 });
const currentValue = ref(model.value || 5);

// Sync with v-model
watch(model, (val) => {
  if (val !== undefined && val !== currentValue.value) {
    currentValue.value = val;
  }
});

watch(currentValue, (val) => {
  model.value = val;
});

// Mood type for data attribute (0=sad, 1=neutral, 2=happy)
const moodType = computed(() => {
  const v = currentValue.value;
  if (v <= 3) return 0; // Sad
  if (v <= 7) return 1; // Neutral
  return 2; // Happy
});

// Face background color based on mood
const faceStyle = computed(() => {
  const v = currentValue.value;
  // Interpolate from red (sad) -> yellow (neutral) -> green (happy)
  const colors = [
    '#e74c3c', // 1 - red
    '#e85d4a', // 2
    '#e96f58', // 3
    '#ea8266', // 4
    '#f39c12', // 5 - yellow/orange (neutral)
    '#d4ac0d', // 6
    '#b4bc0a', // 7
    '#7dcea0', // 8
    '#52be80', // 9
    '#27ae60', // 10 - green
  ];
  return {
    backgroundColor: colors[v - 1] || colors[4],
  };
});

// Pupil position based on mood (follows the slider conceptually)
const pupilStyle = computed(() => {
  const v = currentValue.value;
  // Move pupils based on mood: looking down when sad, up when happy
  const yOffset = ((v - 1) / 9) * 20 - 10; // -10 to +10
  return {
    transform: `translateY(${-yOffset}px)`,
  };
});

// Mouth path - use different SVG paths for different mood ranges
const mouthPath = computed(() => {
  const v = currentValue.value;
  
  // Define clear mouth shapes for different moods
  if (v <= 2) {
    // Very sad - deep frown
    return 'M20 35 Q58 10 97 35';
  } else if (v <= 4) {
    // Sad - slight frown  
    return 'M25 30 Q58 18 92 30';
  } else if (v <= 6) {
    // Neutral - straight or very slight curve
    return 'M30 25 Q58 28 87 25';
  } else if (v <= 8) {
    // Happy - smile
    return 'M25 18 Q58 38 92 18';
  } else {
    // Very happy - big smile (open mouth)
    return 'M20 15 Q58 45 97 15';
  }
});

// Mood color for text
const moodColor = computed(() => {
  const v = currentValue.value;
  if (v <= 2) return '#e74c3c';
  if (v <= 4) return '#e67e22';
  if (v <= 6) return '#f39c12';
  if (v <= 8) return '#27ae60';
  return '#2ecc71';
});

// Slider track style with filled progress
const sliderTrackStyle = computed(() => {
  const v = currentValue.value;
  const percent = ((v - 1) / 9) * 100;
  const color = moodColor.value;
  return {
    background: `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, rgba(255, 255, 255, 0.2) ${percent}%, rgba(255, 255, 255, 0.2) 100%)`,
    '--thumb-color': color,
  };
});

// Handle slider input
const onSliderInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  currentValue.value = parseInt(target.value);
};

// Mood labels (1-10 scale)
const moodLabels: Record<number, string> = {
  1: 'Terrible',
  2: 'Very Bad',
  3: 'Bad',
  4: 'Poor',
  5: 'Okay',
  6: 'Fine',
  7: 'Good',
  8: 'Very Good',
  9: 'Great',
  10: 'Fantastic',
};

const moodLabel = computed(() => moodLabels[currentValue.value] || 'Okay');
</script>

<style scoped>
.emotion-slider-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 20rem;
  margin: 0 auto;
  padding: 1rem 0;
}

/* Face Container */
.face-container {
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.face {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: background-color 0.3s ease;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 0 -5px 20px rgba(0, 0, 0, 0.1),
    inset 0 5px 20px rgba(255, 255, 255, 0.2);
}

/* Eyes */
.eyes {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.eye {
  position: relative;
  width: 45px;
  height: 40px;
}

.eye-bg {
  width: 100%;
  height: 100%;
  color: #333;
}

.eye-bg path {
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
}

.pupil {
  position: absolute;
  width: 14px;
  height: 14px;
  color: #333;
  transition: transform 0.3s ease;
}

.eye.left .pupil {
  top: 45%;
  left: 40%;
}

.eye.right .pupil {
  top: 45%;
  left: 35%;
}

/* Mouth */
.mouth {
  width: 70px;
  height: 30px;
  color: #333;
  margin-top: 5px;
}

.mouth path {
  transition: d 0.3s ease;
}

/* Mood Label */
.mood-label-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.mood-label {
  font-size: 1.5rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

.mood-score {
  font-size: 0.875rem;
  color: #888;
}

/* Slider */
.slider-container {
  width: 100%;
  padding: 0 1rem;
  min-width: 200px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0 0.25rem;
}

.label-icon {
  font-size: 1.5rem;
}

/* Slider Track Wrapper */
.slider-track {
  position: relative;
  height: 10px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Custom Range Slider */
.emotion-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: transparent;
  outline: none;
  cursor: pointer;
  margin: 0;
  position: absolute;
  top: 0;
  left: 0;
}

.emotion-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 3px solid var(--thumb-color, #f39c12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: transform 0.15s ease;
}

.emotion-range::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.emotion-range::-webkit-slider-thumb:active {
  transform: scale(0.95);
}

.emotion-range::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 3px solid var(--thumb-color, #f39c12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: transform 0.15s ease;
}

.emotion-range::-moz-range-thumb:hover {
  transform: scale(1.1);
}

.emotion-range::-moz-range-track {
  background: transparent;
}

/* Animation for face entrance */
.face-container {
  animation: face-entrance 0.5s ease-out;
}

@keyframes face-entrance {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Subtle bounce when mood changes */
[data-mood="0"] .face {
  animation: slight-shake 0.3s ease;
}

[data-mood="2"] .face {
  animation: happy-bounce 0.4s ease;
}

@keyframes slight-shake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-2deg); }
  75% { transform: rotate(2deg); }
}

@keyframes happy-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>
