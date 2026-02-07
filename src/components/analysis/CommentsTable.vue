<script setup>
import { computed } from 'vue';
import { useHighlight } from '@/composables/useHighlight';
import { useExcel } from '@/composables/useExcel';

// Принимаем данные и модели (v-model) от родителя
const props = defineProps({
    comments: { type: Array, required: true },
    searchQuery: { type: String, default: '' },
    filterSentiment: { type: String, default: 'all' },
});

const emit = defineEmits(['update:searchQuery', 'update:filterSentiment']);

// Подключаем наши Composables
const { highlightText } = useHighlight();
const { exportToExcel } = useExcel();

// --- ОБНОВЛЕННАЯ ЛОГИКА ФИЛЬТРАЦИИ ---
const filteredComments = computed(() => {
    return props.comments.filter((c) => {
        // 1. Поиск по тексту и автору
        const query = props.searchQuery.toLowerCase();
        const matchesSearch =
            c.content.toLowerCase().includes(query) ||
            c.author_name.toLowerCase().includes(query);

        // 2. Фильтр по тональности (С УЧЕТОМ ТОКСИЧНОСТИ)
        let matchesSentiment = true;

        if (props.filterSentiment === 'all') {
            matchesSentiment = true;
        } else if (props.filterSentiment === 'toxic') {
            // Специальная проверка для токсичности (это булево значение)
            matchesSentiment = c.analysis?.is_toxic === true;
        } else {
            // Стандартная проверка (positive, negative, neutral)
            matchesSentiment = c.analysis?.sentiment === props.filterSentiment;
        }

        return matchesSearch && matchesSentiment;
    });
});

// Подготовка данных для Excel
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
        class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
    >
        <div
            class="p-4 border-b bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between"
        >
            <div class="flex gap-3 flex-1">
                <input
                    :value="searchQuery"
                    @input="emit('update:searchQuery', $event.target.value)"
                    placeholder="🔍 Поиск по тексту..."
                    class="border border-gray-300 p-2.5 rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />

                <select
                    :value="filterSentiment"
                    @change="
                        emit('update:filterSentiment', $event.target.value)
                    "
                    class="border border-gray-300 p-2.5 rounded-lg text-sm outline-none bg-white cursor-pointer hover:border-blue-400 transition"
                >
                    <option value="all">Все тональности</option>
                    <option value="positive">🟢 Только позитив</option>
                    <option value="negative">🔴 Только негатив</option>
                    <option value="neutral">⚪️ Нейтральные</option>
                    <option value="toxic">☣️ Только токсичные</option>
                </select>
            </div>

            <button
                @click="handleExport"
                class="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-green-600/20"
            >
                <span>📥</span> Скачать Excel
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th
                            class="p-5 text-xs font-bold text-gray-500 uppercase"
                        >
                            Автор
                        </th>
                        <th
                            class="p-5 text-xs font-bold text-gray-500 uppercase w-1/2"
                        >
                            Комментарий
                        </th>
                        <th
                            class="p-5 text-xs font-bold text-gray-500 uppercase text-center"
                        >
                            Анализ ИИ
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr
                        v-for="c in filteredComments"
                        :key="c.comment_id"
                        class="hover:bg-blue-50/30 transition-colors"
                    >
                        <td class="p-5 font-medium text-sm text-gray-900">
                            {{ c.author_name }}
                        </td>

                        <td class="p-5 text-sm text-gray-600 leading-relaxed">
                            <div
                                v-html="highlightText(c.content, searchQuery)"
                            ></div>
                        </td>

                        <td class="p-5">
                            <div class="flex flex-col items-center gap-2">
                                <span
                                    :class="{
                                        'text-green-700 bg-green-100 border-green-200':
                                            c.analysis?.sentiment ===
                                            'positive',
                                        'text-red-700 bg-red-100 border-red-200':
                                            c.analysis?.sentiment ===
                                            'negative',
                                        'text-gray-700 bg-gray-100 border-gray-200':
                                            c.analysis?.sentiment === 'neutral',
                                    }"
                                    class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-wider"
                                >
                                    {{ c.analysis?.sentiment }}
                                </span>

                                <div class="w-24 group relative">
                                    <div
                                        class="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden"
                                    >
                                        <div
                                            class="h-full bg-blue-500 rounded-full"
                                            :style="{
                                                width:
                                                    (c.analysis?.score || 0) *
                                                        100 +
                                                    '%',
                                            }"
                                        ></div>
                                    </div>
                                    <p
                                        class="text-[9px] text-gray-400 text-center mt-1 font-mono"
                                    >
                                        {{
                                            Math.round(
                                                (c.analysis?.score || 0) * 100,
                                            )
                                        }}%
                                    </p>
                                </div>

                                <span
                                    v-if="c.analysis?.is_toxic"
                                    class="flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase mt-1 animate-pulse"
                                >
                                    ☣️ Toxic
                                </span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="filteredComments.length === 0" class="p-12 text-center">
            <p class="text-4xl mb-4">🔍</p>
            <p class="text-gray-500 font-medium">Ничего не найдено</p>
            <button
                @click="
                    emit('update:searchQuery', '');
                    emit('update:filterSentiment', 'all');
                "
                class="text-blue-500 text-sm mt-2 hover:underline"
            >
                Сбросить фильтры
            </button>
        </div>
    </div>
</template>
