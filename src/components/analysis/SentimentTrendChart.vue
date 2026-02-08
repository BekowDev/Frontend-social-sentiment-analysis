<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'vue-chartjs';
import zoomPlugin from 'chartjs-plugin-zoom';

// 1. УБЕДИСЬ, ЧТО ЭТО ЗДЕСЬ
import 'hammerjs';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    zoomPlugin,
);

const props = defineProps({
    comments: {
        type: Array,
        required: true,
    },
});

const chartRef = ref(null);
const activeFrame = ref(30 * 60 * 1000); // 30 минут по умолчанию

const frames = [
    { label: '1м', value: 60 * 1000 },
    { label: '30м', value: 30 * 60 * 1000 },
    { label: '1ч', value: 60 * 60 * 1000 },
    { label: '4ч', value: 4 * 60 * 60 * 1000 },
    { label: '12ч', value: 12 * 60 * 60 * 1000 },
    { label: '1д', value: 24 * 60 * 60 * 1000 },
];

const setFrame = async (val) => {
    activeFrame.value = val;
    await nextTick();
    updateChartLimit();
};

// Функция ограничения видимой области (Binance style)
const updateChartLimit = () => {
    const chart = chartRef.value?.chart;
    if (!chart) return;

    chart.resetZoom();

    const totalPoints = chart.data.labels?.length || 0;
    // Показываем последние 30 точек, если их больше
    const MAX_VISIBLE_POINTS = 30;

    if (totalPoints > MAX_VISIBLE_POINTS) {
        chart.options.scales.x.min = totalPoints - MAX_VISIBLE_POINTS;
        chart.options.scales.x.max = totalPoints - 1;
        chart.update();
    } else {
        // Если точек мало, сбрасываем границы
        chart.options.scales.x.min = null;
        chart.options.scales.x.max = null;
        chart.update();
    }
};

const chartData = computed(() => {
    if (!props.comments || props.comments.length === 0)
        return { labels: [], datasets: [] };

    const rawData = props.comments
        .map((c) => {
            if (!c.date) return null;
            let ts;
            if (typeof c.date === 'number') {
                ts = c.date < 10000000000 ? c.date * 1000 : c.date;
            } else {
                ts = new Date(c.date).getTime();
            }
            return isNaN(ts) ? null : { ...c, ts };
        })
        .filter(Boolean);

    if (rawData.length === 0) return { labels: [], datasets: [] };

    const buckets = {};
    const interval = activeFrame.value;

    rawData.forEach((c) => {
        const bucketTime = Math.floor(c.ts / interval) * interval;

        if (!buckets[bucketTime]) {
            buckets[bucketTime] = {
                positive: 0,
                negative: 0,
                toxic: 0,
                ts: bucketTime,
            };
        }

        if (c.analysis?.sentiment === 'positive')
            buckets[bucketTime].positive++;
        if (c.analysis?.sentiment === 'negative')
            buckets[bucketTime].negative++;
        if (c.analysis?.is_toxic) buckets[bucketTime].toxic++;
    });

    const sortedBuckets = Object.values(buckets).sort((a, b) => a.ts - b.ts);

    const labels = sortedBuckets.map((b) => {
        const date = new Date(b.ts);
        if (interval >= 24 * 60 * 60 * 1000) {
            return format(date, 'd MMM', { locale: ru });
        } else {
            return format(date, 'HH:mm', { locale: ru });
        }
    });

    return {
        labels,
        datasets: [
            {
                label: 'Позитив',
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                data: sortedBuckets.map((b) => b.positive),
                tension: 0.2,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Негатив',
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                data: sortedBuckets.map((b) => b.negative),
                tension: 0.2,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Токсичность',
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.0)',
                borderDash: [5, 5],
                data: sortedBuckets.map((b) => b.toxic),
                tension: 0.2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };
});

watch(chartData, () => {
    nextTick(() => {
        updateChartLimit();
    });
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
                title: (items) => {
                    const label = items[0].label;
                    const frameName =
                        frames.find((f) => f.value === activeFrame.value)
                            ?.label || '';
                    return `Время: ${label} (${frameName})`;
                },
            },
        },
        // 👇 НАСТРОЙКИ ЗУМА И ПЕРЕТАСКИВАНИЯ 👇
        zoom: {
            pan: {
                enabled: true, // Разрешить перетаскивание
                mode: 'x', // Только по горизонтали
                modifierKey: null, // 👈 ВАЖНО: Не требовать нажатия клавиш
                threshold: 10, // Чувствительность
            },
            zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: 'x',
            },
            // 👇 ВАЖНО: Я закомментировал лимиты, чтобы проверить движение.
            // Если заработает, можно раскомментировать, но использовать 'original' аккуратно.
            limits: {
                // x: { min: 'original', max: 'original' },
            },
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 10 },
        },
        y: {
            beginAtZero: true,
            grid: { color: '#f3f4f6' },
            ticks: { stepSize: 1 },
        },
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
    },
};
</script>

<template>
    <div class="flex flex-col h-full w-full relative group">
        <div class="flex flex-wrap gap-2 mb-4 justify-between items-center">
            <div class="text-[10px] text-gray-400 font-medium hidden sm:block">
                Группировка:
            </div>

            <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                    v-for="frame in frames"
                    :key="frame.label"
                    @click="setFrame(frame.value)"
                    class="text-[10px] uppercase font-bold px-3 py-1 rounded-full transition-all border shadow-sm whitespace-nowrap"
                    :class="[
                        activeFrame === frame.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-500',
                    ]"
                >
                    {{ frame.label }}
                </button>
            </div>
        </div>

        <div class="flex-1 relative min-h-0 cursor-grab active:cursor-grabbing">
            <Line ref="chartRef" :data="chartData" :options="chartOptions" />

            <div
                v-if="chartData.labels.length === 0"
                class="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] z-10"
            >
                <p class="text-sm text-gray-500 font-medium">Нет данных</p>
            </div>
        </div>
    </div>
</template>
