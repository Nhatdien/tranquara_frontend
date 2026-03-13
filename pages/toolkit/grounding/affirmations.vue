<template>
  <section class="min-h-screen px-6 pb-20 lg:pb-0 pt-6">
    <!-- Desktop Breadcrumbs -->
    <DesktopBreadcrumb :items="breadcrumbs" />

    <!-- Back Button (mobile) -->
    <div class="mb-6 lg:hidden">
      <UButton variant="ghost" size="lg" icon="i-lucide-chevron-left" @click="navigateTo('/toolkit')" />
    </div>

    <h1 class="text-xl font-semibold mb-2 lg:text-2xl">{{ $t('toolkit.grounding.affirmations.title') }}</h1>
    <p class="text-muted text-sm mb-6">{{ $t('toolkit.grounding.affirmations.description') }}</p>

    <!-- Add new affirmation -->
    <div class="flex gap-2 mb-6">
      <UInput
        v-model="newAffirmation"
        size="sm"
        class="flex-1"
        :placeholder="$t('toolkit.grounding.affirmations.addPlaceholder')"
        @keyup.enter="handleAdd"
      />
      <UButton
        variant="soft"
        color="neutral"
        size="sm"
        :disabled="!newAffirmation.trim()"
        @click="handleAdd"
      >
        {{ $t('common.add') }}
      </UButton>
    </div>

    <!-- Favorites -->
    <div v-if="favoriteAffirmations.length > 0" class="mb-6">
      <h2 class="text-xs text-dimmed uppercase tracking-wider mb-2">
        {{ $t('toolkit.grounding.affirmations.favorites') }}
      </h2>
      <div class="space-y-2">
        <div
          v-for="item in favoriteAffirmations"
          :key="item.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl border border-muted bg-muted"
        >
          <button
            class="text-yellow-400"
            @click="toolkitStore.toggleAffirmationFavorite(item.id)"
          >
            <Star class="w-4 h-4" />
          </button>
          <span class="text-sm flex-1">{{ item.content }}</span>
          <button
            class="text-toned hover:text-red-400 transition-colors"
            @click="toolkitStore.deleteAffirmation(item.id)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- My affirmations -->
    <div v-if="userAffirmations.length > 0" class="mb-6">
      <h2 class="text-xs text-dimmed uppercase tracking-wider mb-2">
        {{ $t('toolkit.grounding.affirmations.myAffirmations') }}
      </h2>
      <div class="space-y-2">
        <div
          v-for="item in userAffirmations"
          :key="item.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl border border-muted bg-muted"
        >
          <button
            class="text-toned hover:text-yellow-400 transition-colors"
            @click="toolkitStore.toggleAffirmationFavorite(item.id)"
          >
            <Star class="w-4 h-4" />
          </button>
          <span class="text-sm flex-1">{{ item.content }}</span>
          <button
            class="text-toned hover:text-red-400 transition-colors"
            @click="toolkitStore.deleteAffirmation(item.id)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Default affirmations -->
    <div class="mb-6">
      <h2 class="text-xs text-dimmed uppercase tracking-wider mb-2">
        {{ $t('toolkit.grounding.affirmations.defaults') }}
      </h2>
      <div class="space-y-2">
        <div
          v-for="(item, i) in defaultAffirmations"
          :key="i"
          class="px-4 py-3 rounded-xl border border-muted bg-muted text-sm text-default"
        >
          {{ item }}
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from '@nuxt/ui'
import { Star, X } from "lucide-vue-next";
import { useToolkitStore } from "~/stores/stores/therapy_toolkit_store";

definePageMeta({ layout: 'detail' });

const { t } = useI18n();
const toolkitStore = useToolkitStore();
const newAffirmation = ref('');

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: t('nav.toolkit'), icon: 'i-lucide-heart-handshake', to: '/toolkit' },
  { label: t('toolkit.grounding.affirmations.title') },
])

const defaultAffirmations = [
  'This feeling is temporary.',
  'I am safe in this moment.',
  'I can take this one breath at a time.',
  'It is okay to feel what I am feeling.',
  'I am doing the best I can.',
];

const userAffirmations = computed(() =>
  toolkitStore.affirmations.filter(a => !a.is_favorite)
);
const favoriteAffirmations = computed(() =>
  toolkitStore.affirmations.filter(a => a.is_favorite)
);

const handleAdd = async () => {
  const text = newAffirmation.value.trim();
  if (!text) return;
  await toolkitStore.addAffirmation(text);
  newAffirmation.value = '';
};

onMounted(async () => {
  await toolkitStore.loadFromLocal();
});
</script>
