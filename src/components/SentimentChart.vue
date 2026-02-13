<script setup>
    import { Pie } from 'vue-chartjs';
    import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
    import { computed } from 'vue';

    ChartJS.register(ArcElement, Tooltip, Legend);

    const props = defineProps({
        stats: {
            type: Object,
            required: true,
        },
    });

    const chartData = computed(() => ({
        labels: ['Позитив', 'Негатив', 'Нейтрально', 'Токсично'],
        datasets: [
            {
                backgroundColor: ['#16a34a', '#dc2626', '#94a3b8', '#9333ea'],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 4,
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
                labels: {
                    usePointStyle: true,
                    pointStyle: 'rect', // Квадратные маркеры в легенде
                    padding: 20,
                    font: {
                        size: 11,
                        family: 'sans-serif',
                        weight: 'bold',
                    },
                },
            },
            tooltip: {
                cornerRadius: 0, // Убираем скругление у тултипа
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleFont: { size: 13, weight: 'bold' },
                padding: 12,
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
                usePointStyle: true,
            },
        },
        layout: {
            padding: 10,
        },
    };
</script>

<template>
    <div class="h-64 w-full">
        <Pie
            :data="chartData"
            :options="chartOptions" />
    </div>
</template>
