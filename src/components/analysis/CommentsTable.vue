<script setup>
    import { computed, ref, watch } from 'vue';
    import { useHighlight } from '@/composables/useHighlight';
    import { useExcel } from '@/composables/useExcel';

    const props = defineProps({
        comments: { type: Array, required: true },
        searchQuery: { type: String, default: '' },
        filterSentiment: { type: String, default: 'all' },
    });

    const emit = defineEmits(['update:searchQuery', 'update:filterSentiment']);

    const { highlightText } = useHighlight();
    const { exportToExcel } = useExcel();
    const currentPage = ref(1);
    const pageSize = 12;

    const filteredComments = computed(() => {
        return props.comments.filter((c) => {
            const query = props.searchQuery.toLowerCase();
            const matchesSearch =
                c.content.toLowerCase().includes(query) ||
                c.author_name.toLowerCase().includes(query);

            let matchesSentiment = true;

            if (props.filterSentiment === 'all') {
                matchesSentiment = true;
            } else if (props.filterSentiment === 'toxic') {
                matchesSentiment = c.analysis?.is_toxic === true;
            } else {
                matchesSentiment =
                    c.analysis?.sentiment === props.filterSentiment;
            }

            return matchesSearch && matchesSentiment;
        });
    });

    const totalPages = computed(() => {
        return Math.max(1, Math.ceil(filteredComments.value.length / pageSize));
    });

    const paginatedComments = computed(() => {
        const start = (currentPage.value - 1) * pageSize;
        return filteredComments.value.slice(start, start + pageSize);
    });

    watch(
        [
            () => props.searchQuery,
            () => props.filterSentiment,
            () => props.comments.length,
        ],
        () => {
            currentPage.value = 1;
        },
    );

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

    const handleExport = () => {
        const data = filteredComments.value.map((c) => ({
            Автор: c.author_name,
            Текст: c.content,
            Тональность: c.analysis?.sentiment,
            Уверенность: (c.analysis?.score || 0).toFixed(2),
            Токсичность: c.analysis?.is_toxic ? 'ДА' : 'Нет',
            Дата: new Date().toLocaleDateString(),
        }));

        exportToExcel(data, 'Sentiment_Analysis');
    };
</script>

<template>
    <div
        class="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div
            class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div class="flex gap-3 flex-1 flex-wrap md:flex-nowrap">
                <div class="relative w-full md:max-w-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        :value="searchQuery"
                        @input="emit('update:searchQuery', $event.target.value)"
                        placeholder="Поиск по тексту..."
                        class="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400/20" />
                </div>

                <select
                    :value="filterSentiment"
                    @change="
                        emit('update:filterSentiment', $event.target.value)
                    "
                    class="cursor-pointer rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition hover:bg-white focus:border-transparent focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus:ring-blue-400/20">
                    <option value="all">Все тональности</option>
                    <option value="positive">🟢 Только позитив</option>
                    <option value="negative">🔴 Только негатив</option>
                    <option value="neutral">⚪️ Нейтральные</option>
                    <option value="toxic">☣️ Только токсичные</option>
                </select>
            </div>

            <button
                @click="handleExport"
                class="flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-green-700 hover:shadow-md active:translate-y-px">
                <span>📥</span> Excel
            </button>
        </div>

        <div
            v-if="filteredComments.length > 0"
            class="min-h-[34rem]">
            <transition name="fade" mode="out-in">
                <div
                    :key="`${currentPage}-${searchQuery}-${filterSentiment}`"
                    class="custom-scrollbar overflow-x-auto">
                    <table class="w-full border-collapse text-left">
                        <thead class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                            <tr>
                                <th
                                    class="border-r border-gray-200 p-5 text-xs font-bold uppercase tracking-widest text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    Автор
                                </th>
                                <th
                                    class="w-1/2 border-r border-gray-200 p-5 text-xs font-bold uppercase tracking-widest text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    Комментарий
                                </th>
                                <th
                                    class="p-5 text-center text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                    Анализ ИИ
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr
                                v-for="c in paginatedComments"
                                :key="c.comment_id"
                                class="group transition-colors odd:bg-white even:bg-gray-50/70 hover:bg-blue-50/70 dark:odd:bg-gray-800 dark:even:bg-gray-800/50 dark:hover:bg-gray-700/60">
                                <td
                                    class="border-r border-gray-200 p-5 text-sm font-bold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                                    {{ c.author_name }}
                                </td>

                                <td
                                    class="border-r border-gray-200 p-5 text-sm leading-relaxed text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    <div
                                        v-html="
                                            highlightText(c.content, searchQuery)
                                        "></div>
                                </td>

                                <td class="p-5">
                                    <div class="flex flex-col items-center gap-3">
                                        <span
                                            :class="{
                                                'text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-500/50':
                                                    c.analysis?.sentiment ===
                                                    'positive',
                                                'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-500/50':
                                                    c.analysis?.sentiment ===
                                                    'negative',
                                                'text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-300 dark:bg-gray-800/50 dark:border-gray-500/50':
                                                    c.analysis?.sentiment === 'neutral',
                                            }"
                                            class="w-full rounded-full border px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                            {{ c.analysis?.sentiment }}
                                        </span>

                                        <div
                                            class="relative w-full max-w-[100px] group/bar">
                                            <div
                                                class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700/70">
                                                <div
                                                    class="h-full rounded-full bg-blue-600 transition-all duration-500"
                                                    :style="{
                                                        width:
                                                            (c.analysis?.score || 0) *
                                                                100 +
                                                            '%',
                                                    }"></div>
                                            </div>
                                            <p
                                                class="mt-1 text-center font-mono text-[9px] text-gray-500 dark:text-gray-400">
                                                {{
                                                    Math.round(
                                                        (c.analysis?.score || 0) * 100
                                                    )
                                                }}%
                                            </p>
                                        </div>

                                        <span
                                            v-if="c.analysis?.is_toxic"
                                            class="flex w-full items-center justify-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-1 text-[9px] font-bold uppercase text-purple-700 shadow-sm dark:border-purple-500/50 dark:bg-purple-900/30 dark:text-purple-400">
                                            ⚠️ TOXIC
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </transition>
        </div>

        <div
            v-else
            class="bg-gray-50 p-12 text-center dark:bg-gray-800">
            <p class="mb-4 text-4xl text-gray-400 dark:text-gray-400">🔍</p>
            <p class="font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Ничего не найдено
            </p>
            <button
                @click="
                    emit('update:searchQuery', '');
                    emit('update:filterSentiment', 'all');
                "
                class="mt-4 border-b border-blue-500 pb-0.5 text-xs font-bold uppercase tracking-wider text-blue-600 transition hover:border-blue-700 hover:text-blue-700 dark:border-blue-400 dark:text-blue-300 dark:hover:border-blue-300 dark:hover:text-blue-200">
                Сбросить фильтры
            </button>
        </div>

        <div
            v-if="filteredComments.length > 0"
            class="flex items-center justify-center gap-3 border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-800">
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

    .custom-scrollbar::-webkit-scrollbar {
        height: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #cbd5e1;
        border-radius: 9999px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #94a3b8;
    }

    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #4b5563;
    }

    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #6b7280;
    }
</style>
