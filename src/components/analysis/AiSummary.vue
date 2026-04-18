<script setup>
    import { computed } from 'vue';
    import { storeToRefs } from 'pinia';
    import { useI18n } from 'vue-i18n';
    import { useAnalysisStore } from '@/store/analysis';
    import SkeletonLoader from '@/components/SkeletonLoader.vue';

    const analysisStore = useAnalysisStore();
    const { t } = useI18n();
    const { isLoading, summary } = storeToRefs(analysisStore);

    const normalizedSummary = computed(() => {
        const text = String(summary.value?.content || '').trim();
        return text || t('aiSummary.loading');
    });

    const normalizedKeyPoints = computed(() => {
        const list = Array.isArray(summary.value?.keyPoints)
            ? summary.value.keyPoints
            : [];
        return list
            .map((item) => String(item || '').trim())
            .filter(Boolean)
            .slice(0, 4);
    });
</script>

<template>
    <section
        class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-4 text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            {{ t('aiSummary.title') }}
        </h3>

        <div
            v-if="isLoading"
            class="space-y-3">
            <SkeletonLoader />
        </div>

        <div v-else class="space-y-4">
            <p class="text-lg font-medium leading-relaxed text-gray-900 dark:text-gray-100">
                {{ normalizedSummary }}
            </p>

            <ul
                v-if="normalizedKeyPoints.length > 0"
                class="space-y-2">
                <li
                    v-for="(point, index) in normalizedKeyPoints"
                    :key="`${index}-${point}`"
                    class="flex items-start gap-2 text-sm text-gray-900 dark:text-gray-100">
                    <span class="mt-0.5 text-blue-500">✦</span>
                    <span>{{ point }}</span>
                </li>
            </ul>
        </div>
    </section>
</template>
