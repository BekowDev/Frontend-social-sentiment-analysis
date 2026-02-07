<script setup>
import { computed } from 'vue';

const props = defineProps({
    stats: {
        type: Object,
        required: true,
    },
});

// Логика генерации текста переехала сюда
const summaryText = computed(() => {
    const { positive, negative, toxic, total } = props.stats;
    if (!total) return 'Нет данных для анализа.';

    const positivePercent = Math.round((positive / total) * 100);

    if (positivePercent > 70) {
        return `Аудитория настроена крайне лояльно (${positivePercent}% позитива). Рекомендуется поддерживать вовлеченность.`;
    } else if (negative > positive) {
        return `Внимание! Количество негативных отзывов преобладает. Рекомендуется проанализировать причины недовольства.`;
    } else if (toxic > 0) {
        return `Обнаружено ${toxic} токсичных комментариев. Рекомендуется очистка чата для предотвращения конфликтов.`;
    }
    return 'Тональность комментариев стабильна, аномалий не обнаружено.';
});
</script>

<template>
    <div
        class="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500 p-6 rounded-r-2xl shadow-sm"
    >
        <div class="flex items-start gap-4">
            <span class="text-4xl">💡</span>
            <div>
                <h4
                    class="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1"
                >
                    AI Insights (Заключение системы):
                </h4>
                <p class="text-blue-900 text-lg leading-relaxed font-medium">
                    {{ summaryText }}
                </p>
            </div>
        </div>
    </div>
</template>
