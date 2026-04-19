<script setup>
    import { computed, onMounted, ref, watch } from 'vue';
    import { useRouter } from 'vue-router';
    import { useI18n } from 'vue-i18n';
    import { useAnalysisStore } from '@/store/analysis';
    import { storeToRefs } from 'pinia';

    const router = useRouter();
    const { t } = useI18n();
    const analysisStore = useAnalysisStore();
    const { history } = storeToRefs(analysisStore);
    const historySearch = ref('');
    const currentPage = ref(1);
    const pageSize = 10;

    const sortedHistory = computed(() => {
        return [...history.value].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
    });

    const filteredHistory = computed(() => {
        const query = historySearch.value.trim().toLowerCase();
        if (!query) return sortedHistory.value;

        return sortedHistory.value.filter((item) => {
            const link = String(item.postLink || '').toLowerCase();
            const createdAt = new Date(item.createdAt);
            const dateLabel = createdAt.toLocaleString().toLowerCase();
            const isoDate = createdAt.toISOString().toLowerCase();
            return (
                link.includes(query) ||
                dateLabel.includes(query) ||
                isoDate.includes(query)
            );
        });
    });

    const totalPages = computed(() => {
        return Math.max(1, Math.ceil(filteredHistory.value.length / pageSize));
    });

    const paginatedHistory = computed(() => {
        const start = (currentPage.value - 1) * pageSize;
        return filteredHistory.value.slice(start, start + pageSize);
    });

    watch([historySearch, () => history.value.length], () => {
        currentPage.value = 1;
    });

    watch(totalPages, (value) => {
        if (currentPage.value > value) {
            currentPage.value = value;
        }
    });

    const goToPrevPage = () => {
        if (currentPage.value > 1) currentPage.value -= 1;
    };

    const goToNextPage = () => {
        if (currentPage.value < totalPages.value) currentPage.value += 1;
    };

    onMounted(() => {
        analysisStore.fetchHistory();
    });

    const openAnalysis = async (id) => {
        await analysisStore.loadFromHistory(id);
        router.push('/');
    };
</script>

<template>
    <div class="h-screen overflow-y-auto bg-white dark:bg-gray-900">
        <div class="mx-auto max-w-6xl p-8">
            <div class="mb-8 flex items-center justify-between">
                <h1 class="text-3xl font-semibold text-gray-800 dark:text-gray-100">
                    {{ t('historyView.title') }}
                </h1>
                <RouterLink
                    to="/"
                    class="rounded-full bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700">
                    {{ t('historyView.back') }}
                </RouterLink>
            </div>

            <div
                class="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <input
                    v-model="historySearch"
                    type="text"
                    placeholder="Поиск по ссылке или дате..."
                    class="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400/20" />
            </div>

            <div
                v-if="filteredHistory.length === 0"
                class="rounded-3xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                {{ t('historyView.empty') }}
            </div>

            <div
                v-else
                class="min-h-[36rem] space-y-4">
                <transition name="fade" mode="out-in">
                    <div
                        :key="`${currentPage}-${historySearch}`"
                        class="space-y-4">
                        <button
                            v-for="item in paginatedHistory"
                            :key="item._id"
                            @click="openAnalysis(item._id)"
                            class="w-full rounded-3xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                            <div class="mb-3 flex items-center gap-3">
                                <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                    {{ item.platform }}
                                </span>
                                <span class="text-xs text-gray-400 dark:text-gray-400">
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
                                <span class="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">
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
                </transition>
            </div>

            <div
                v-if="filteredHistory.length > 0"
                class="mt-6 flex items-center justify-center gap-3">
                <button
                    @click="goToPrevPage"
                    :disabled="currentPage === 1"
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                    ←
                </button>
                <span
                    class="flex h-10 min-w-10 items-center justify-center rounded-full bg-blue-100 px-3 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:ring-blue-800">
                    {{ currentPage }}
                </span>
                <button
                    @click="goToNextPage"
                    :disabled="currentPage === totalPages"
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                    →
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.2s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>
