<script setup>
    import { computed, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { useI18n } from 'vue-i18n';
    import { useAnalysisStore } from '@/store/analysis';
    import { storeToRefs } from 'pinia';

    const router = useRouter();
    const { t } = useI18n();
    const analysisStore = useAnalysisStore();
    const { history } = storeToRefs(analysisStore);

    const sortedHistory = computed(() => {
        return [...history.value].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
    });

    onMounted(() => {
        analysisStore.fetchHistory();
    });

    const openAnalysis = async (id) => {
        await analysisStore.loadFromHistory(id);
        router.push('/');
    };
</script>

<template>
    <div class="h-screen overflow-y-auto bg-gray-50 dark:bg-gray-950">
        <div class="mx-auto max-w-6xl p-6">
            <div class="mb-8 flex items-center justify-between">
                <h1 class="text-3xl font-semibold text-gray-800 dark:text-gray-100">
                    {{ t('historyView.title') }}
                </h1>
                <RouterLink
                    to="/"
                    class="rounded-full bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:shadow dark:bg-gray-900 dark:text-gray-100">
                    {{ t('historyView.back') }}
                </RouterLink>
            </div>

            <div
                v-if="sortedHistory.length === 0"
                class="rounded-3xl bg-white p-10 text-center text-gray-400 shadow-sm dark:bg-gray-900 dark:text-gray-500">
                {{ t('historyView.empty') }}
            </div>

            <div
                v-else
                class="space-y-4">
                <button
                    v-for="item in sortedHistory"
                    :key="item._id"
                    @click="openAnalysis(item._id)"
                    class="w-full rounded-3xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900">
                    <div class="mb-3 flex items-center gap-3">
                        <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            {{ item.platform }}
                        </span>
                        <span class="text-xs text-gray-400 dark:text-gray-500">
                            {{ new Date(item.createdAt).toLocaleString() }}
                        </span>
                        <span class="ml-auto text-xs text-gray-500 dark:text-gray-400">
                            {{ (item.executionTime / 1000).toFixed(1) }}s
                        </span>
                    </div>
                    <p
                        class="truncate text-sm font-medium text-gray-800 dark:text-gray-100"
                        :title="item.postLink">
                        {{ item.postLink }}
                    </p>
                    <div class="mt-3 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <span class="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
                            {{ t('historyView.comments') }}: {{ item.stats?.total || 0 }}
                        </span>
                        <span class="rounded-full bg-green-100 px-3 py-1 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                            {{ t('historyView.positive') }}: {{ item.stats?.positive || 0 }}
                        </span>
                        <span class="rounded-full bg-red-100 px-3 py-1 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                            {{ t('historyView.negative') }}: {{ item.stats?.negative || 0 }}
                        </span>
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>
