<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
    comments: {
        type: Array,
        default: () => [],
    },
    activeKeyword: {
        type: String,
        default: "",
    },
});
const emit = defineEmits(["select"]);
const { t } = useI18n();

const topKeywords = computed(() => {
    if (!props.comments.length) return [];

    const allText = props.comments
        .map((c) => String(c?.content || c?.text || "").toLowerCase())
        .join(" ");
    const words = allText.match(/[а-яА-ЯёЁa-zA-Z]+/g) || [];
    const stopWords = [
        // РУССКИЙ
        "меня",
        "тебе",
        "было",
        "если",
        "этот",
        "того",
        "хотя",
        "через",
        "есть",
        "когда",
        "очень",
        "просто",
        "здесь",
        "быть",
        "даже",
        "того",
        "только",
        "этого",
        "этой",
        "этом",
        "этих",
        "будет",
        "один",
        "такой",
        "которые",
        "который",
        "какой",
        "свой",
        "всех",
        "себя",
        "чтобы",
        "под",
        "над",
        "всего",
        "всегда",
        "тоже",
        "сейчас",
        "можно",
        "после",
        "потом",
        "ничего",
        "больше",
        "зачем",
        "почему",
        "разве",
        "перед",
        "около",
        "нибудь",
        "кажется",
        "вообще",
        "именно",
        "между",
        "вдруг",
        "сразу",
        "таком",
        "надо",
        "нужно",
        "можно",
        "потому",
        "потом",
        // ENGLISH
        "this",
        "that",
        "with",
        "from",
        "they",
        "your",
        "their",
        "there",
        "here",
        "when",
        "where",
        "which",
        "some",
        "other",
        "them",
        "then",
        "than",
        "also",
        "about",
        "after",
        "only",
        "very",
        "just",
        "more",
        "would",
        "could",
        "should",
        "will",
        "been",
        "have",
        "does",
        "were",
        "what",
        "every",
        "each",
        "into",
        "onto",
        "under",
        "above",
        "behind",
        "between",
        "during",
        "without",
        "because",
        "though",
        "since",
        // ҚАЗАҚША
        "үшін",
        "және",
        "бірақ",
        "біздің",
        "сіздің",
        "олар",
        "менің",
        "саған",
        "маған",
        "соңғы",
        "ондай",
        "мұндай",
        "біреу",
        "емес",
        "бірінші",
        "екінші",
        "бірге",
        "сосын",
        "кейін",
        "дейін",
        "сияқты",
        "секілді",
        "арқылы",
        "бойынша",
        "туралы",
        "қазір",
        "сонда",
        "мұнда",
        "солай",
        "қалай",
        "ешқандай",
        "ешкім",
        "ештеңе",
        "біраз",
        "кейбір",
        "бәрі",
        "барлық",
        "деген",
        "артық",
        "бөлек",
        "өйткені",
        "себебі",
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
    <div v-if="topKeywords.length" class="flex h-full flex-col p-2">
        <div class="mb-4 flex items-center justify-between">
            <h3
                class="text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400"
            >
                {{ t("keywordCloud.title") }}
            </h3>

            <button
                v-if="activeKeyword"
                @click="emit('select', '')"
                class="group flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-500 transition hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
            >
                <span>✕ {{ t("keywordCloud.reset") }}</span>
            </button>
        </div>

        <div class="flex flex-1 flex-wrap content-start gap-2">
            <button
                v-for="item in topKeywords"
                :key="item.word"
                @click="emit('select', item.word)"
                :class="
                    activeKeyword === item.word
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                "
                class="flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium transition-all"
            >
                <span>#{{ item.word }}</span>
                <span
                    :class="
                        activeKeyword === item.word
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-800/60 dark:text-blue-200'
                    "
                    class="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                >
                    {{ item.count }}
                </span>
            </button>
        </div>
    </div>
</template>
