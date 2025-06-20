import { defineNuxtPlugin } from '#app';
import VueECharts from 'vue-echarts';
import * as echarts from 'echarts';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('v-chart', VueECharts);
});
