<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useAnalysisStore } from "@/store/analysis";
import SkeletonLoader from "@/components/SkeletonLoader.vue";

const analysisStore = useAnalysisStore();
const { t, locale } = useI18n();
const { isLoading, summary } = storeToRefs(analysisStore);

const currentLocale = computed(() => {
    const value = String(locale.value || "ru").toLowerCase();
    if (value === "ru" || value === "kk" || value === "en") {
        return value;
    }
    return "ru";
});

const localizedSummary = computed(() => {
    if (!summary.value || typeof summary.value !== "object") {
        return "";
    }

    const text = summary.value[currentLocale.value];
    if (typeof text === "string" && text.trim().length > 0) {
        return text.trim();
    }

    const fallback = summary.value.ru || summary.value.en || summary.value.kk || "";
    return String(fallback).trim();
});

const hasSummaryData = computed(() => localizedSummary.value.length > 0);
</script>

<template>
    <section v-if="isLoading || hasSummaryData" class="flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div class="mb-4 h-1 w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <h3 class="mb-4 text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            {{ t("aiSummary.title") }}
        </h3>

        <div class="flex-1 rounded-3xl bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-5 dark:from-blue-900/20 dark:to-purple-900/20">
            <div v-if="isLoading" class="space-y-3">
                <SkeletonLoader />
            </div>

            <div v-else class="space-y-4">
                <p v-if="localizedSummary" class="text-lg font-medium leading-relaxed whitespace-pre-line text-gray-900 dark:text-gray-100">
                    {{ localizedSummary }}
                </p>
            </div>
        </div>
    </section>
</template>
