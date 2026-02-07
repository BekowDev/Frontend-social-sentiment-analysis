<script setup>
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { computed } from 'vue';

// Регистрируем компоненты Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
    stats: {
        type: Object,
        required: true,
    },
});

// Настройка данных для графика
const chartData = computed(() => ({
    labels: ['Позитив', 'Негатив', 'Нейтрально', 'Токсично'],
    datasets: [
        {
            backgroundColor: ['#22c55e', '#ef4444', '#94a3b8', '#a855f7'],
            data: [
                props.stats.positive,
                props.stats.negative,
                props.stats.neutral,
                props.stats.toxic,
            ],
        },
    ],
}));

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
        },
    },
};
</script>

<template>
    <div class="h-64">
        <Pie :data="chartData" :options="chartOptions" />
    </div>
</template>
