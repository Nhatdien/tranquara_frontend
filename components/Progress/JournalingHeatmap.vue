<template>
  <div class="heatmap-chart">
    <div v-if="hasData" class="heatmap-scroll-wrapper">
      <div class="heatmap-inner" :style="{ minWidth: chartWidth + 'px' }">
        <v-chart
          class="chart"
          :style="{ height: chartHeight + 'px' }"
          :option="chartOption"
          autoresize
        />
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-center py-8 text-center">
      <UIcon name="i-lucide-calendar" class="w-10 h-10 text-muted mb-3" />
      <p class="text-sm text-muted">
        No journaling activity yet. Start writing to see your activity calendar.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import {
  CalendarComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { LocalJournal } from '~/types/user_journal'

use([HeatmapChart, CalendarComponent, TooltipComponent, VisualMapComponent, CanvasRenderer])

const props = defineProps<{
  journals: LocalJournal[]
  /** Number of months to show. Defaults to 6. */
  months?: number
}>()

const monthsToShow = computed(() => props.months ?? 6)

/**
 * Cell size — large enough to be tappable and visible.
 * The container scrolls horizontally on mobile if needed.
 */
const CELL_SIZE = 18
const CELL_BORDER = 4 // borderWidth acts as gap between cells

/**
 * Compute start and end dates for the calendar range.
 */
const dateRange = computed(() => {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - monthsToShow.value)
  start.setDate(1)

  return {
    start: formatDate(start),
    end: formatDate(end),
  }
})

/**
 * Calculated chart width based on actual weeks in the date range.
 * Ensures the chart never shrinks — mobile scrolls instead.
 */
const chartWidth = computed(() => {
  const start = new Date(dateRange.value.start)
  const end = new Date(dateRange.value.end)
  const diffMs = end.getTime() - start.getTime()
  const totalWeeks = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000))
  // day labels (left) + cells + right margin
  return 30 + totalWeeks * (CELL_SIZE + CELL_BORDER) + 16
})

/**
 * Chart height: 7 rows of cells + month labels + top/bottom padding.
 */
const chartHeight = computed(() => {
  return 7 * (CELL_SIZE + CELL_BORDER) + 40
})

/**
 * Count journal entries per day within the date range.
 * Returns array of [date, count] tuples for ECharts.
 */
const heatmapData = computed(() => {
  const dayCounts: Record<string, number> = {}

  props.journals
    .filter(j => !j.is_deleted)
    .forEach(j => {
      const date = new Date(j.created_at)
      const key = formatDate(date)
      dayCounts[key] = (dayCounts[key] || 0) + 1
    })

  return Object.entries(dayCounts)
    .map(([date, count]) => [date, count])
    .filter(([date]) => date >= dateRange.value.start && date <= dateRange.value.end)
})

const hasData = computed(() => {
  return props.journals.filter(j => !j.is_deleted).length > 0
})

/**
 * Max entries in a single day, used for visualMap scaling.
 */
const maxCount = computed(() => {
  if (heatmapData.value.length === 0) return 3
  return Math.max(...heatmapData.value.map(d => d[1] as number), 3)
})

const chartOption = computed(() => ({
  tooltip: {
    formatter: (params: any) => {
      const date = params.data[0]
      const count = params.data[1]
      return `${date}<br/>${count} ${count === 1 ? 'entry' : 'entries'}`
    },
  },
  visualMap: {
    min: 0,
    max: maxCount.value,
    show: false,
    inRange: {
      color: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    },
  },
  calendar: {
    range: [dateRange.value.start, dateRange.value.end],
    cellSize: [CELL_SIZE, CELL_SIZE],
    top: 24,
    left: 24,
    right: 8,
    bottom: 4,
    splitLine: {
      show: false,
    },
    itemStyle: {
      borderWidth: CELL_BORDER,
      borderColor: 'transparent',
      borderRadius: 3,
      color: '#161b22',
    },
    yearLabel: {
      show: false,
    },
    monthLabel: {
      color: '#94a3b8',
      fontSize: 11,
      nameMap: 'en',
    },
    dayLabel: {
      firstDay: 1,
      color: '#94a3b8',
      fontSize: 10,
      nameMap: ['', 'M', '', 'W', '', 'F', ''],
      margin: 6,
    },
  },
  series: [
    {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: heatmapData.value,
    },
  ],
}))

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
</script>

<style scoped>
.heatmap-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.heatmap-inner {
  min-width: fit-content;
}

.chart {
  width: 100%;
}
</style>
