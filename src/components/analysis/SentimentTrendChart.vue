<script setup>
import { computed, ref, watch, nextTick } from "vue";
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
} from "chart.js";
import { Line } from "vue-chartjs";
import zoomPlugin from "chartjs-plugin-zoom";
import "hammerjs";
import { useI18n } from "vue-i18n";

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
const { t } = useI18n();

const chartRef = ref(null);
const activeFrame = ref(30 * 60 * 1000);

const frames = computed(() => [
    { label: t("trendChart.frames.1m"), value: 60 * 1000 },
    { label: t("trendChart.frames.30m"), value: 30 * 60 * 1000 },
    { label: t("trendChart.frames.1h"), value: 60 * 60 * 1000 },
    { label: t("trendChart.frames.4h"), value: 4 * 60 * 60 * 1000 },
    { label: t("trendChart.frames.12h"), value: 12 * 60 * 60 * 1000 },
    { label: t("trendChart.frames.1d"), value: 24 * 60 * 60 * 1000 },
]);

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

const formatBucketLabel = (bucketTs, intervalMs) => {
    const date = new Date(bucketTs);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    if (intervalMs >= 24 * 60 * 60 * 1000) {
        return `${year}-${month}-${day}`;
    }

    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const chartData = computed(() => {
    if (!props.comments || props.comments.length === 0)
        return { labels: [], datasets: [] };

    const comments = Array.isArray(props.comments) ? props.comments : [];
    const interval = activeFrame.value;

    const validComments = comments
        .map((c) => {
            if (!c?.date) {
                return null;
            }

            const dateObj = new Date(c.date);
            const ts = dateObj.getTime();
            if (Number.isNaN(ts)) {
                return null;
            }
            const bucketTs = Math.floor(ts / interval) * interval;

            return {
                ...c,
                ts,
                bucketTs,
            };
        })
        .filter(Boolean);

    if (validComments.length === 0) return { labels: [], datasets: [] };

    const buckets = {};

    validComments.forEach((c) => {
        if (!buckets[c.bucketTs]) {
            buckets[c.bucketTs] = {
                bucketTs: c.bucketTs,
                positive: 0,
                negative: 0,
                neutral: 0,
                toxic: 0,
            };
        }

        const sentiment = String(c.analysis?.sentiment || "").toLowerCase();
        if (sentiment === "positive") buckets[c.bucketTs].positive += 1;
        else if (sentiment === "negative") buckets[c.bucketTs].negative += 1;
        else buckets[c.bucketTs].neutral += 1;

        if (c.analysis?.is_toxic === true) {
            buckets[c.bucketTs].toxic += 1;
        }
    });

    const sortedBuckets = Object.values(buckets).sort(
        (a, b) => a.bucketTs - b.bucketTs,
    );
    const labels = sortedBuckets.map((bucket) =>
        formatBucketLabel(bucket.bucketTs, interval),
    );
    const positiveData = sortedBuckets.map((bucket) => bucket.positive || 0);
    const negativeData = sortedBuckets.map((bucket) => bucket.negative || 0);
    const neutralData = sortedBuckets.map((bucket) => bucket.neutral || 0);
    const toxicData = sortedBuckets.map((bucket) => bucket.toxic || 0);

    return {
        labels,
        datasets: [
            {
                label: t("trendChart.datasets.positive"),
                borderColor: "#22c55e",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                data: positiveData,
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 2,
                pointHoverRadius: 6,
            },
            {
                label: t("trendChart.datasets.negative"),
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                data: negativeData,
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 2,
                pointHoverRadius: 6,
            },
            {
                label: t("trendChart.datasets.neutral"),
                borderColor: "#94a3b8",
                backgroundColor: "rgba(148, 163, 184, 0.1)",
                borderDash: [5, 5],
                data: neutralData,
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 2,
                pointHoverRadius: 6,
            },
            {
                label: t("trendChart.datasets.toxic"),
                borderColor: "#9333ea",
                backgroundColor: "rgba(147, 51, 234, 0.1)",
                data: toxicData,
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 2,
                pointHoverRadius: 6,
            },
        ],
    };
});

const chartRenderKey = computed(() => {
    const labels = chartData.value.labels.join("|");
    const values = chartData.value.datasets
        .map((dataset) => dataset.data.join(","))
        .join("|");
    return `${activeFrame.value}-${labels}-${values}`;
});

watch(
    [chartData, activeFrame],
    () => {
        nextTick(() => {
            updateChartLimit();
        });
    },
    { immediate: true },
);

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "top",
            labels: {
                usePointStyle: true,
                pointStyle: "rect", // Квадратная легенда
                boxWidth: 10,
                color: "#6b7280",
            },
        },
        tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            cornerRadius: 0, // Квадратный тултип
            callbacks: {
                title: (items) => {
                    const label = items[0].label;
                    const frameName =
                        frames.value.find((f) => f.value === activeFrame.value)
                            ?.label || "";
                    return `${t("trendChart.tooltip.time")}: ${label} (${frameName})`;
                },
            },
        },
        zoom: {
            pan: {
                enabled: true,
                mode: "x",
                modifierKey: null,
                threshold: 10,
            },
            zoom: {
                wheel: { enabled: false },
                pinch: { enabled: true },
                mode: "x",
            },
            limits: {},
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: {
                maxTicksLimit: 6,
                color: "#6b7280",
            },
        },
        y: {
            beginAtZero: true,
            grid: {
                color: () =>
                    document.documentElement.classList.contains("dark")
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(15, 23, 42, 0.04)",
            },
            ticks: {
                stepSize: 1,
                color: "#6b7280",
            },
        },
    },
    interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
    },
}));
</script>

<template>
    <div
        class="relative flex h-full w-full flex-col rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800"
    >
        <div
            class="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2 dark:border-gray-700"
        >
            <div
                class="hidden text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 sm:block"
            >
                {{ t("trendChart.grouping") }}
            </div>

            <div
                class="no-scrollbar flex overflow-x-auto rounded-full border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700"
            >
                <button
                    v-for="frame in frames"
                    :key="frame.value"
                    @click="setFrame(frame.value)"
                    class="whitespace-nowrap border-r border-gray-200 px-4 py-2 text-[10px] font-bold uppercase transition-all last:border-r-0 focus:outline-none dark:border-gray-600"
                    :class="[
                        activeFrame === frame.value
                            ? 'bg-blue-600 text-white shadow-inner'
                            : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-blue-300',
                    ]"
                >
                    {{ frame.label }}
                </button>
            </div>
        </div>

        <div class="flex-1 relative min-h-0 cursor-grab active:cursor-grabbing">
            <Line
                :key="chartRenderKey"
                ref="chartRef"
                :data="chartData"
                :options="chartOptions"
            />

            <div
                v-if="chartData.labels.length === 0"
                class="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/80 backdrop-blur-[2px] dark:bg-gray-800/80"
            >
                <p
                    class="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                    {{ t("trendChart.empty") }}
                </p>
            </div>
        </div>
    </div>
</template>
