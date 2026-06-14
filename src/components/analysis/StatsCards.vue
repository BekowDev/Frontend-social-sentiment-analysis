<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
    stats: {
        type: Object,
        required: false, // Можно не передавать, если данные грузятся
        default: () => ({
            total: 0,
            positive: 0,
            negative: 0,
            toxic: 0,
            neutral: 0,
        }),
    },
});

const safeStats = computed(() => {
    const source = props.stats || {};
    return {
        total: Number(source.total) || 0,
        positive: Number(source.positive) || 0,
        negative: Number(source.negative) || 0,
        toxic: Number(source.toxic) || 0,
        neutral: Number(source.neutral) || 0,
    };
});

const metricCards = computed(() => {
    const cards = [];

    if (safeStats.value.total > 0) {
        cards.push({
            key: "total",
            label: t("statsCards.total"),
            value: safeStats.value.total,
            valueClass: "text-gray-900 dark:text-gray-100",
        });
    }
    if (safeStats.value.positive > 0) {
        cards.push({
            key: "positive",
            label: t("statsCards.positive"),
            value: safeStats.value.positive,
            valueClass: "text-green-600",
        });
    }
    if (safeStats.value.negative > 0) {
        cards.push({
            key: "negative",
            label: t("statsCards.negative"),
            value: safeStats.value.negative,
            valueClass: "text-red-600",
        });
    }
    if (safeStats.value.toxic > 0) {
        cards.push({
            key: "toxic",
            label: t("statsCards.toxic"),
            value: safeStats.value.toxic,
            valueClass: "text-purple-600",
        });
    }

    return cards;
});
</script>

<template>
    <div v-if="metricCards.length > 0" class="flex h-full w-full flex-col">
        <div class="grid flex-1 grid-cols-1 gap-5 md:grid-cols-2">
            <div v-for="card in metricCards" :key="card.key" class="flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <p class="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {{ card.label }}
                </p>
                <p class="mt-auto text-4xl font-black" :class="card.valueClass">
                    {{ card.value }}
                </p>
            </div>
        </div>
    </div>
</template>
