<template>
  <div class="min-h-screen bg-default pb-20">
    <SettingsSubpageHeader title="Your Data" />

    <UContainer>
      <div class="py-6 space-y-6">
        <!-- Data & Sync -->
        <div class="space-y-4">
          <h2 class="text-sm font-semibold text-muted uppercase tracking-wider px-1">data & sync.</h2>
          <SyncStatusDashboard
            :show-stats="true"
            :show-history="true"
            :show-actions="true"
          />
        </div>

        <!-- Data Management (Export, Delete Account) -->
        <SettingsDataManagementSection />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'detail',
});
</script>
