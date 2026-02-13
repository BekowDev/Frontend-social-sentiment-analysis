<script setup>
    import { computed } from 'vue';
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
        class="bg-white rounded-none shadow-md border-t-4 border-blue-600 overflow-hidden">
        <div
            class="p-4 border-b border-gray-200 bg-white flex flex-wrap gap-4 items-center justify-between">
            <div class="flex gap-3 flex-1 flex-wrap md:flex-nowrap">
                <input
                    :value="searchQuery"
                    @input="emit('update:searchQuery', $event.target.value)"
                    placeholder="🔍 Поиск по тексту..."
                    class="border border-gray-300 bg-gray-50 p-2.5 rounded-none text-sm w-full md:max-w-xs focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-colors" />

                <select
                    :value="filterSentiment"
                    @change="
                        emit('update:filterSentiment', $event.target.value)
                    "
                    class="border border-gray-300 bg-gray-50 p-2.5 rounded-none text-sm outline-none cursor-pointer focus:ring-1 focus:ring-blue-600 focus:border-blue-600 hover:bg-white transition-colors">
                    <option value="all">Все тональности</option>
                    <option value="positive">🟢 Только позитив</option>
                    <option value="negative">🔴 Только негатив</option>
                    <option value="neutral">⚪️ Нейтральные</option>
                    <option value="toxic">☣️ Только токсичные</option>
                </select>
            </div>

            <button
                @click="handleExport"
                class="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-sm hover:shadow-md active:translate-y-px">
                <span>📥</span> Excel
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th
                            class="p-5 text-xs font-bold text-gray-500 uppercase tracking-widest border-r border-gray-100">
                            Автор
                        </th>
                        <th
                            class="p-5 text-xs font-bold text-gray-500 uppercase tracking-widest w-1/2 border-r border-gray-100">
                            Комментарий
                        </th>
                        <th
                            class="p-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">
                            Анализ ИИ
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr
                        v-for="c in filteredComments"
                        :key="c.comment_id"
                        class="hover:bg-blue-50/50 transition-colors group">
                        <td
                            class="p-5 font-bold text-sm text-gray-800 border-r border-gray-50">
                            {{ c.author_name }}
                        </td>

                        <td
                            class="p-5 text-sm text-gray-600 leading-relaxed border-r border-gray-50">
                            <div
                                v-html="
                                    highlightText(c.content, searchQuery)
                                "></div>
                        </td>

                        <td class="p-5">
                            <div class="flex flex-col items-center gap-3">
                                <span
                                    :class="{
                                        'text-green-800 bg-green-100 border-green-200':
                                            c.analysis?.sentiment ===
                                            'positive',
                                        'text-red-800 bg-red-100 border-red-200':
                                            c.analysis?.sentiment ===
                                            'negative',
                                        'text-gray-800 bg-gray-100 border-gray-200':
                                            c.analysis?.sentiment === 'neutral',
                                    }"
                                    class="px-3 py-1 rounded-none text-[10px] font-bold uppercase border tracking-wider w-full text-center shadow-sm">
                                    {{ c.analysis?.sentiment }}
                                </span>

                                <div
                                    class="w-full max-w-[100px] group/bar relative">
                                    <div
                                        class="w-full bg-gray-200 h-2 rounded-none overflow-hidden">
                                        <div
                                            class="h-full bg-blue-600 rounded-none transition-all duration-500"
                                            :style="{
                                                width:
                                                    (c.analysis?.score || 0) *
                                                        100 +
                                                    '%',
                                            }"></div>
                                    </div>
                                    <p
                                        class="text-[9px] text-gray-400 text-center mt-1 font-mono">
                                        {{
                                            Math.round(
                                                (c.analysis?.score || 0) * 100
                                            )
                                        }}%
                                    </p>
                                </div>

                                <span
                                    v-if="c.analysis?.is_toxic"
                                    class="flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-none text-[9px] font-bold uppercase w-full justify-center shadow-sm">
                                    ⚠️ TOXIC
                                </span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div
            v-if="filteredComments.length === 0"
            class="p-12 text-center bg-gray-50">
            <p class="text-4xl mb-4 text-gray-300">🔍</p>
            <p class="text-gray-500 font-bold uppercase tracking-wide">
                Ничего не найдено
            </p>
            <button
                @click="
                    emit('update:searchQuery', '');
                    emit('update:filterSentiment', 'all');
                "
                class="text-blue-600 text-xs font-bold uppercase tracking-wider mt-4 hover:text-blue-800 transition border-b border-blue-600 hover:border-blue-800 pb-0.5">
                Сбросить фильтры
            </button>
        </div>
    </div>
</template>
