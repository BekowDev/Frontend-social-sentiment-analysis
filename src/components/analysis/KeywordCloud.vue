<script setup>
    import { computed } from 'vue';

    const props = defineProps({
        comments: {
            type: Array,
            default: () => [],
        },
        activeKeyword: {
            type: String,
            default: '',
        },
    });
    const emit = defineEmits(['select']);

    const topKeywords = computed(() => {
        if (!props.comments.length) return [];

        const allText = props.comments
            .map((c) => c.content.toLowerCase())
            .join(' ');
        const words = allText.match(/[а-яА-ЯёЁa-zA-Z]+/g) || [];
        const stopWords = [
            // РУССКИЙ
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
            'здесь',
            'быть',
            'даже',
            'того',
            'только',
            'этого',
            'этой',
            'этом',
            'этих',
            'будет',
            'один',
            'такой',
            'которые',
            'который',
            'какой',
            'свой',
            'всех',
            'себя',
            'чтобы',
            'под',
            'над',
            'всего',
            'всегда',
            'тоже',
            'сейчас',
            'можно',
            'после',
            'потом',
            'ничего',
            'больше',
            'зачем',
            'почему',
            'разве',
            'перед',
            'около',
            'нибудь',
            'кажется',
            'вообще',
            'именно',
            'между',
            'вдруг',
            'сразу',
            // ENGLISH
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
            'where',
            'which',
            'some',
            'other',
            'them',
            'then',
            'than',
            'also',
            'about',
            'after',
            'only',
            'very',
            'just',
            'more',
            'would',
            'could',
            'should',
            'will',
            'been',
            'have',
            'does',
            'were',
            'what',
            'every',
            'each',
            'into',
            'onto',
            'under',
            'above',
            'behind',
            'between',
            'during',
            'without',
            'because',
            'though',
            'since',
            // ҚАЗАҚША
            'үшін',
            'және',
            'бірақ',
            'біздің',
            'сіздің',
            'олар',
            'менің',
            'саған',
            'маған',
            'соңғы',
            'ондай',
            'мұндай',
            'біреу',
            'емес',
            'бірінші',
            'екінші',
            'бірге',
            'сосын',
            'кейін',
            'дейін',
            'сияқты',
            'секілді',
            'арқылы',
            'бойынша',
            'туралы',
            'қазір',
            'сонда',
            'мұнда',
            'солай',
            'қалай',
            'ешқандай',
            'ешкім',
            'ештеңе',
            'біраз',
            'кейбір',
            'бәрі',
            'барлық',
            'деген',
            'артық',
            'бөлек',
            'өйткені',
            'себебі',
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
    <div
        v-if="topKeywords.length"
        class="bg-white p-6 shadow-md border-t-4 border-gray-800 rounded-none">
        <div
            class="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
            <h3
                class="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Ключевые темы
            </h3>

            <button
                v-if="activeKeyword"
                @click="emit('select', '')"
                class="group flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider transition">
                <span>✕ Сбросить</span>
            </button>
        </div>

        <div class="flex flex-wrap gap-2">
            <button
                v-for="item in topKeywords"
                :key="item.word"
                @click="emit('select', item.word)"
                :class="
                    activeKeyword === item.word
                        ? 'bg-blue-600 text-white shadow-md transform -translate-y-0.5'
                        : 'bg-gray-100 text-gray-700 hover:bg-white hover:shadow-sm hover:border-gray-300 border border-transparent'
                "
                class="px-4 py-2 rounded-none text-sm transition-all flex items-center gap-2 font-medium">
                <span>#{{ item.word }}</span>
                <span
                    :class="
                        activeKeyword === item.word
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-200 text-gray-600'
                    "
                    class="text-[10px] px-1.5 py-0.5 rounded-none font-bold">
                    {{ item.count }}
                </span>
            </button>
        </div>
    </div>
</template>
