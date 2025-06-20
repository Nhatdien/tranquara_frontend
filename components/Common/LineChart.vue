<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>


const option = ref({
  xAxis: {
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: "line",
      smooth: true,
    },
  ],
});
</script>

<style scoped>
.chart {
  min-height: 280px;
  margin-left: 1rem;
}
</style>
