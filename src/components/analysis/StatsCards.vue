<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const props = defineProps({
    stats: {
        type: Object,
        required: false,
        default: () => ({
            total: 0,
            positive: 0,
            negative: 0,
            toxic: 0,
            neutral: 0,
            positivePercent: null,
            negativePercent: null,
            neutralPercent: null,
            toxicityScore: null,
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
        positivePercent: Number(source.positivePercent),
        negativePercent: Number(source.negativePercent),
        neutralPercent: Number(source.neutralPercent),
        toxicityScore: Number(source.toxicityScore),
    };
});

const formatCount = (value) => {
    return new Intl.NumberFormat(locale.value || "en").format(value);
};

const formatPercent = (value, digits = 0) => {
    if (!Number.isFinite(value)) return null;
    return `${value.toFixed(digits)}%`;
};

const metricCards = computed(() => {
    const cards = [];
    const stats = safeStats.value;

    if (stats.total > 0) {
        cards.push({
            key: "total",
            label: t("statsCards.totalComments"),
            value: formatCount(stats.total),
            valueClass: "text-gray-900 dark:text-gray-100",
        });
    }

    const positiveValue = formatPercent(stats.positivePercent) || (stats.positive > 0 ? formatCount(stats.positive) : null);
    if (positiveValue) {
        cards.push({
            key: "positive",
            label: t("statsCards.positive"),
            value: positiveValue,
            valueClass: "text-green-600",
        });
    }

    const negativeValue = formatPercent(stats.negativePercent) || (stats.negative > 0 ? formatCount(stats.negative) : null);
    if (negativeValue) {
        cards.push({
            key: "negative",
            label: t("statsCards.negative"),
            value: negativeValue,
            valueClass: "text-red-600",
        });
    }

    const neutralValue = formatPercent(stats.neutralPercent) || (stats.neutral > 0 ? formatCount(stats.neutral) : null);
    if (neutralValue) {
        cards.push({
            key: "neutral",
            label: t("statsCards.neutral"),
            value: neutralValue,
            valueClass: "text-slate-500 dark:text-slate-300",
        });
    }

    const toxicityValue =
        formatPercent(stats.toxicityScore, 1) || (stats.toxic > 0 ? formatCount(stats.toxic) : null);
    if (toxicityValue) {
        cards.push({
            key: "toxic",
            label: t("statsCards.toxicityScore"),
            value: toxicityValue,
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
