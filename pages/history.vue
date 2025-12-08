<template>
  <div class="flex flex-col w-full min-h-screen pb-20 px-4">
    <div class="py-6">
      <h1 class="text-3xl font-bold mb-2">History</h1>
      <p class="text-muted text-sm">Your journal entries over time</p>
    </div>

    <!-- Filter/Search Bar -->
    <div class="mb-6">
      <UInput 
        v-model="searchQuery"
        placeholder="Search entries..."
        icon="i-heroicons-magnifying-glass"
        size="lg"
      />
    </div>

    <!-- Calendar View Toggle (Future Enhancement) -->
    <div class="mb-6 flex gap-2">
      <UButton 
        :variant="viewMode === 'list' ? 'solid' : 'outline'"
        size="sm"
        @click="viewMode = 'list'"
      >
        List
      </UButton>
      <UButton 
        :variant="viewMode === 'calendar' ? 'solid' : 'outline'"
        size="sm"
        @click="viewMode = 'calendar'"
      >
        Calendar
      </UButton>
    </div>

    <!-- Entries List -->
    <div v-if="viewMode === 'list'" class="space-y-6">
      <!-- Group by Month -->
      <div v-for="(entries, month) in groupedEntries" :key="month">
        <h2 class="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          {{ month }}
        </h2>
        
        <div class="space-y-3">
          <div 
            v-for="entry in entries" 
            :key="entry.id"
            class="bg-muted rounded-lg p-4 cursor-pointer hover:bg-accented transition"
            @click="navigateTo(`/journaling/${entry.id}`)"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="text-xs text-muted uppercase tracking-wide">{{ entry.category }}</span>
              <span class="text-xs text-muted">{{ entry.time }}</span>
            </div>
            <h3 class="font-semibold text-highlighted mb-2">{{ entry.title }}</h3>
            
            <!-- Tags -->
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tag in entry.tags" 
                :key="tag"
                class="px-3 py-1 bg-accented rounded-full text-xs text-default"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar View Placeholder -->
    <div v-else class="text-center py-12">
      <p class="text-muted">Calendar view coming soon...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref('');
const viewMode = ref<'list' | 'calendar'>('list');

// TODO: Replace with actual data from store/API
const groupedEntries = ref({
  "November 2024": [
    {
      id: 1,
      category: "REFLECTION",
      title: "Daily check-in",
      time: "3:25 PM",
      tags: ["Good mood", "Sleep 3/5", "Work", "Reading"]
    },
    {
      id: 2,
      category: "GRATITUDE",
      title: "Three good things",
      time: "9:15 AM",
      tags: ["Happy", "Family", "Exercise"]
    }
  ],
  "October 2024": [
    {
      id: 3,
      category: "REFLECTION",
      title: "Weekly review",
      time: "7:45 PM",
      tags: ["Productive", "Growth", "Learning"]
    }
  ]
});
</script>
