<template>
  <div class="go-deep-directions">
    <!-- Mobile: Bottom Sheet Drawer -->
    <USlideover
      v-if="isMobile"
      v-model:open="isOpen"
      :title="$t('goDeeper.title')"
      :description="$t('goDeeper.subtitle')"
      :overlay="true"
    >
      <UButton
        color="primary"
        variant="soft"
        trailing-icon="i-heroicons-chevron-down-20-solid"
        :loading="loading"
        :disabled="disabled"
      >
        <span class="flex items-center gap-2">
          <span>{{ buttonLabel }}</span>
        </span>
      </UButton>

      <template #body>
        <div class="direction-options">
          <button
            v-for="dir in directions"
            :key="dir.value"
            class="direction-button"
            @click="selectDirection(dir.value)"
          >
            <div class="direction-icon">{{ dir.icon }}</div>
            <div class="direction-content">
              <div class="direction-label">{{ $t(`goDeeper.directions.${dir.value}.label`) }}</div>
              <div class="direction-description">{{ $t(`goDeeper.directions.${dir.value}.description`) }}</div>
            </div>
          </button>
        </div>
      </template>
    </USlideover>

    <!-- Desktop: Dropdown Menu -->
    <UDropdownMenu
      v-else
      :items="dropdownItems"
    >
      <UButton
        color="primary"
        variant="soft"
        trailing-icon="i-heroicons-chevron-down-20-solid"
        :loading="loading"
        :disabled="disabled"
      >
        <span class="flex items-center gap-2">
          <span>{{ buttonLabel }}</span>
        </span>
      </UButton>
    </UDropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Define props
const props = defineProps<{
  loading?: boolean;
  disabled?: boolean;
  modelValue?: boolean; // For controlling open state
}>();

// Define emits
const emit = defineEmits<{
  (e: 'select', direction: string): void;
  (e: 'update:modelValue', value: boolean): void;
}>();

// Reactive state
const isOpen = ref(false);

// Watch for prop changes
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined) {
    isOpen.value = newVal;
  }
});

// Watch for internal changes
watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal);
});

// Detect mobile
const isMobile = computed(() => {
  if (process.client) {
    return window.innerWidth < 768;
  }
  return false;
});

// Button label
const { t } = useI18n();

const buttonLabel = computed(() => {
  return props.loading ? t('goDeeper.thinking') : t('goDeeper.button');
});

// Direction options (icons + values only; labels come from i18n)
const directions = [
  { value: 'why', icon: '🧠' },
  { value: 'emotions', icon: '💭' },
  { value: 'patterns', icon: '🔁' },
  { value: 'challenge', icon: '🧩' },
  { value: 'growth', icon: '🌱' },
];

// Dropdown items for desktop
const dropdownItems = computed(() => [
  directions.map((dir) => ({
    label: t(`goDeeper.directions.${dir.value}.label`),
    icon: dir.icon,
    onSelect: () => selectDirection(dir.value),
  })),
]);

// Handle direction selection
function selectDirection(direction: string) {
  emit('select', direction);
  isOpen.value = false; // Close drawer/dropdown
}
</script>

<style scoped>
.go-deep-directions {
  display: inline-block;
}

.direction-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.direction-button {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.direction-button:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.direction-button:active {
  transform: translateY(0);
}

.direction-icon {
  font-size: 32px;
  line-height: 1;
  flex-shrink: 0;
}

.direction-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.direction-label {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.direction-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .direction-button {
    border-color: #374151;
    background: #1f2937;
  }

  .direction-button:hover {
    border-color: #3b82f6;
    background: #1e3a5f;
  }

  .direction-label {
    color: #f9fafb;
  }

  .direction-description {
    color: #9ca3af;
  }
}
</style>
