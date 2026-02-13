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
        zoomPlugin
    );

    const props = defineProps({
        comments: {
            type: Array,
            required: true,
        },
    });

    const chartRef = ref(null);
    const activeFrame = ref(30 * 60 * 1000);

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

    const updateChartLimit = () => {
        const chart = chartRef.value?.chart;
        if (!chart) return;

        chart.resetZoom();

        const totalPoints = chart.data.labels?.length || 0;
        const MAX_VISIBLE_POINTS = 30;

        if (totalPoints > MAX_VISIBLE_POINTS) {
            chart.options.scales.x.min = totalPoints - MAX_VISIBLE_POINTS;
            chart.options.scales.x.max = totalPoints - 1;
            chart.update();
        } else {
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

        const sortedBuckets = Object.values(buckets).sort(
            (a, b) => a.ts - b.ts
        );

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
                    pointRadius: 0, // Material charts often cleaner without dots
                    pointHoverRadius: 6,
                },
                {
                    label: 'Негатив',
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    data: sortedBuckets.map((b) => b.negative),
                    tension: 0.2,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                },
                {
                    label: 'Токсичность',
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.0)',
                    borderDash: [5, 5],
                    data: sortedBuckets.map((b) => b.toxic),
                    tension: 0.2,
                    pointRadius: 0,
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
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'rect', // Квадратная легенда
                    boxWidth: 10,
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 13 },
                bodyFont: { size: 13 },
                cornerRadius: 0, // Квадратный тултип
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
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x',
                    modifierKey: null,
                    threshold: 10,
                },
                zoom: {
                    wheel: { enabled: false },
                    pinch: { enabled: true },
                    mode: 'x',
                },
                limits: {},
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
        <div
            class="flex flex-wrap gap-2 mb-4 justify-between items-center border-b border-gray-100 pb-2">
            <div
                class="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                Группировка
            </div>

            <div
                class="flex gap-0 overflow-x-auto no-scrollbar border border-gray-200 bg-gray-50">
                <button
                    v-for="frame in frames"
                    :key="frame.label"
                    @click="setFrame(frame.value)"
                    class="text-[10px] uppercase font-bold px-4 py-2 transition-all border-r last:border-r-0 border-gray-200 whitespace-nowrap focus:outline-none"
                    :class="[
                        activeFrame === frame.value
                            ? 'bg-blue-600 text-white shadow-inner'
                            : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-blue-600',
                    ]">
                    {{ frame.label }}
                </button>
            </div>
        </div>

        <div class="flex-1 relative min-h-0 cursor-grab active:cursor-grabbing">
            <Line
                ref="chartRef"
                :data="chartData"
                :options="chartOptions" />

            <div
                v-if="chartData.labels.length === 0"
                class="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px] z-10 rounded-none">
                <p
                    class="text-sm text-gray-500 font-bold uppercase tracking-wide">
                    Нет данных
                </p>
            </div>
        </div>
    </div>
</template>
