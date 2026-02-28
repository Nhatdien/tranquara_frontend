<template>
  <div class="emotion-chart">
    <v-chart
      v-if="hasData"
      class="chart"
      :option="chartOption"
      autoresize
    />
    <div v-else class="flex flex-col items-center justify-center py-8 text-center">
      <UIcon name="i-lucide-pie-chart" class="w-10 h-10 text-muted mb-3" />
      <p class="text-sm text-muted">
        No mood data yet. Start journaling to see your emotion distribution.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { LocalJournal } from '~/types/user_journal'

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{
  journals: LocalJournal[]
}>()

/**
 * Color palette mapping mood labels to colors.
 * Goes from red (negative) through yellow (neutral) to green (positive).
 */
const moodColors: Record<string, string> = {
  'Terrible': '#e74c3c',
  'Very Bad': '#e85d4a',
  'Bad': '#e96f58',
  'Poor': '#e67e22',
  'Okay': '#f39c12',
  'Fine': '#d4ac0d',
  'Good': '#52be80',
  'Very Good': '#27ae60',
  'Great': '#2ecc71',
  'Fantastic': '#1abc9c',
}

/**
 * Mood order for consistent sorting (negative → positive).
 */
const moodOrder: string[] = [
  'Terrible', 'Very Bad', 'Bad', 'Poor', 'Okay',
  'Fine', 'Good', 'Very Good', 'Great', 'Fantastic',
]

/**
 * Compute emotion frequency from journal mood_label values.
 */
const emotionDistribution = computed(() => {
  const counts: Record<string, number> = {}

  props.journals
    .filter(j => !j.is_deleted && j.mood_label)
    .forEach(j => {
      const label = j.mood_label!
      counts[label] = (counts[label] || 0) + 1
    })

  return Object.entries(counts)
    .map(([name, value]) => ({
      name,
      value,
      itemStyle: { color: moodColors[name] || '#94a3b8' },
    }))
    .sort((a, b) => moodOrder.indexOf(a.name) - moodOrder.indexOf(b.name))
})

const hasData = computed(() => emotionDistribution.value.length > 0)

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      const percent = params.percent?.toFixed(1)
      return `${params.name}: ${params.value} (${percent}%)`
    },
  },
  legend: {
    orient: 'horizontal',
    bottom: 0,
    textStyle: {
      color: '#94a3b8',
      fontSize: 11,
    },
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 8,
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      padAngle: 2,
      itemStyle: {
        borderRadius: 4,
      },
      label: {
        show: false,
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold',
          formatter: '{b}\n{c}',
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
      },
      data: emotionDistribution.value,
    },
  ],
}))
</script>

<style scoped>
.chart {
  min-height: 280px;
  width: 100%;
}
</style>
