<script setup>
import { computed } from 'vue';

const props = defineProps({
    comments: {
        type: Array,
        default: () => [],
    },
    activeKeyword: {
        // Текущее выбранное слово (для подсветки синим)
        type: String,
        default: '',
    },
});

// Сообщаем родителю, что кликнули на слово
const emit = defineEmits(['select']);

const topKeywords = computed(() => {
    if (!props.comments.length) return [];

    const allText = props.comments
        .map((c) => c.content.toLowerCase())
        .join(' ');
    const words = allText.match(/[а-яА-ЯёЁa-zA-Z]+/g) || [];

    // Твой список стоп-слов (я сократил для примера, но ты вставь полный!)
    const stopWords = [
        'меня',
        'тебе',
        'было',
        'если',
        'этот',
        'того',
        'хотя',
        'через',
        'есть',
        'когда',
        'очень',
        'просто',
        'this',
        'that',
        'with',
        'from',
        'they',
        'your',
        'their',
        'there',
        'here',
        'when',
        'үшін',
        'және',
        'бірақ',
        'біздің',
        'сіздің',
        'олар',
    ];

    const freqMap = {};
    words.forEach((word) => {
        if (word.length > 3 && !stopWords.includes(word)) {
            freqMap[word] = (freqMap[word] || 0) + 1;
        }
    });

    return Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([word, count]) => ({ word, count }));
});
</script>

<template>
    <div v-if="topKeywords.length" class="bg-white p-6 rounded-2xl shadow-sm">
        <div class="flex items-center justify-between mb-4">
            <h3
                class="text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
                Ключевые темы
            </h3>

            <button
                v-if="activeKeyword"
                @click="emit('select', '')"
                class="text-xs text-blue-500 hover:text-blue-700 font-medium transition"
            >
                ✕ Сбросить
            </button>
        </div>

        <div class="flex flex-wrap gap-2">
            <button
                v-for="item in topKeywords"
                :key="item.word"
                @click="emit('select', item.word)"
                :class="
                    activeKeyword === item.word
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                "
                class="px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 font-medium group"
            >
                <span>#{{ item.word }}</span>
                <span
                    :class="
                        activeKeyword === item.word
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                    "
                    class="text-[10px] px-1.5 rounded-md font-bold"
                >
                    {{ item.count }}
                </span>
            </button>
        </div>
    </div>
</template>
