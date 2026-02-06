<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useAnalysisStore } from '@/store/analysis';
import { storeToRefs } from 'pinia';
import api from '@/api';
import * as XLSX from 'xlsx';

// Импорт компонентов
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import SentimentChart from '@/components/SentimentChart.vue';

// --- СОСТОЯНИЕ УВЕДОМЛЕНИЙ (TOAST) ---
const toast = ref({
    show: false,
    message: '',
    type: 'info', // 'success', 'error', 'info'
});

const showNotify = (msg, type = 'info') => {
    toast.value = { show: true, message: msg, type };
    setTimeout(() => {
        toast.value.show = false;
    }, 3000);
};

// --- ИНИЦИАЛИЗАЦИЯ ---
const auth = useAuthStore();
const analysisStore = useAnalysisStore();
const { results, isLoading } = storeToRefs(analysisStore);

const form = ref({
    phoneNumber: '',
    postLink: '',
    platform: 'telegram',
});

const codeSent = ref(false);
const verificationCode = ref('');
const searchQuery = ref('');
const filterSentiment = ref('all');

// --- ЗАГРУЗКА ИСТОРИИ ---
onMounted(() => {
    analysisStore.fetchHistory();
});

const selectFromHistory = async (id) => {
    await analysisStore.loadFromHistory(id);
    // Скролл к результатам на мобильных устройствах или если список длинный
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth' });
    }
};

// --- ТЕЛЕГРАМ ЛОГИКА ---
const sendTGCode = async () => {
    try {
        if (!form.value.phoneNumber)
            return showNotify('Введите номер телефона', 'error');
        await api.post('/social/send-code', {
            phoneNumber: form.value.phoneNumber,
            platform: 'telegram',
        });
        codeSent.value = true;
        showNotify('Код успешно отправлен в Telegram!', 'success');
    } catch (e) {
        showNotify(e.response?.data?.message || 'Ошибка отправки', 'error');
    }
};

const verifyTGCode = async () => {
    try {
        if (!verificationCode.value) return showNotify('Введите код', 'error');
        await api.post('/social/verify', {
            phoneNumber: form.value.phoneNumber,
            code: verificationCode.value,
            platform: 'telegram',
        });
        showNotify('Успешно подключено!', 'success');
        codeSent.value = false;
        verificationCode.value = '';
    } catch (e) {
        showNotify(e.response?.data?.message || 'Неверный код', 'error');
    }
};

// --- АНАЛИЗ ---
const startAnalysis = async () => {
    if (!form.value.postLink)
        return showNotify('Введите ссылку на пост', 'error');
    // Сбрасываем фильтры при новом анализе
    searchQuery.value = '';
    filterSentiment.value = 'all';

    try {
        await analysisStore.fetchAnalysis(form.value);
        showNotify('Анализ завершен!', 'success');
        analysisStore.fetchHistory(); // Обновляем историю после нового анализа
    } catch (e) {
        showNotify('Ошибка при анализе', 'error');
    }
};

// --- ВЫЧИСЛЯЕМЫЕ СВОЙСТВА (ЛОГИКА) ---

// 1. Фильтрация таблицы
const filteredComments = computed(() => {
    if (!results.value?.comments) return [];
    return results.value.comments.filter((c) => {
        const matchesSearch =
            c.content.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            c.author_name
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase());

        const matchesSentiment =
            filterSentiment.value === 'all' ||
            c.analysis?.sentiment === filterSentiment.value;

        return matchesSearch && matchesSentiment;
    });
});

// 2. Умное резюме ИИ
const aiSummary = computed(() => {
    if (!results.value) return '';

    const { positive, negative, toxic, total } = results.value.stats;
    if (total === 0) return 'Нет данных для анализа.';

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

// 3. Облако тегов (Ключевые слова)
const topKeywords = computed(() => {
    if (!results.value || !results.value.comments) return [];

    const allText = results.value.comments
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

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

const highlightText = (text, query) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(
        regex,
        '<mark class="bg-yellow-200 px-0.5 rounded text-black">$1</mark>',
    );
};

const selectKeyword = (word) => {
    searchQuery.value = word;
    // Плавный скролл к таблице
    const table = document.querySelector('table');
    if (table) {
        table.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

const exportToExcel = () => {
    if (!filteredComments.value.length)
        return showNotify('Нет данных для экспорта', 'error');

    const data = filteredComments.value.map((c) => ({
        Автор: c.author_name,
        Текст: c.content,
        Тональность: c.analysis?.sentiment,
        Уверенность: (c.analysis?.score || c.analysis?.confidence || 0).toFixed(
            2,
        ),
        Токсичность: c.analysis?.is_toxic ? 'ДА' : 'Нет',
        Дата: new Date().toLocaleDateString(), // Можно добавить реальную дату, если есть
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Анализ');
    XLSX.writeFile(wb, `Report_${Date.now()}.xlsx`);
    showNotify('Excel файл скачан!', 'success');
};
</script>

<template>
    <div class="flex min-h-screen bg-gray-50">
        <aside
            class="w-72 bg-white border-r hidden lg:flex flex-col sticky top-0 h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
        >
            <div class="p-6 border-b bg-gray-50/50">
                <h2
                    class="text-xs font-bold text-gray-400 uppercase tracking-widest"
                >
                    История анализов
                </h2>
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <div
                    v-if="analysisStore.history.length === 0"
                    class="text-center py-10"
                >
                    <p class="text-xs text-gray-400 italic">
                        История пока пуста
                    </p>
                </div>

                <button
                    v-for="item in analysisStore.history"
                    :key="item._id"
                    @click="selectFromHistory(item._id)"
                    class="w-full text-left p-4 rounded-xl border border-transparent bg-white hover:border-blue-200 hover:bg-blue-50 hover:shadow-md transition-all group relative overflow-hidden"
                >
                    <div class="flex items-center gap-2 mb-2">
                        <span
                            class="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold uppercase tracking-wide"
                        >
                            {{ item.platform }}
                        </span>
                        <span class="text-[10px] text-gray-400 ml-auto">
                            {{ new Date(item.createdAt).toLocaleDateString() }}
                        </span>
                    </div>
                    <p
                        class="text-xs font-bold text-gray-700 truncate w-full mb-2"
                        :title="item.postLink"
                    >
                        {{ item.postLink }}
                    </p>
                    <div class="flex gap-3 text-[10px] text-gray-500">
                        <span class="flex items-center gap-1">
                            💬 <b>{{ item.stats?.total || 0 }}</b>
                        </span>
                        <span
                            class="flex items-center gap-1 text-red-500"
                            v-if="item.stats?.toxic > 0"
                        >
                            ☣️ <b>{{ item.stats?.toxic }}</b>
                        </span>
                    </div>
                    <div
                        class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    ></div>
                </button>
            </div>
        </aside>

        <main class="flex-1 flex flex-col min-w-0">
            <nav
                class="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-20"
            >
                <h1 class="text-xl font-black text-blue-600 tracking-tight">
                    Social Analyzer
                    <span class="text-gray-300 font-normal">v1.0</span>
                </h1>
                <button
                    @click="auth.logout()"
                    class="text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition"
                >
                    Выйти
                </button>
            </nav>

            <div class="flex-1 p-8 overflow-y-auto" id="main-content">
                <div class="max-w-6xl mx-auto space-y-8">
                    <LoadingSpinner v-if="isLoading" />

                    <div
                        v-if="!results && !isLoading"
                        class="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-yellow-400"
                    >
                        <h2 class="text-xl font-bold mb-2 text-gray-800">
                            Шаг 1: Подключение к Telegram
                        </h2>
                        <p class="text-sm text-gray-500 mb-6">
                            Введите номер телефона, чтобы получить код доступа к
                            API Telegram.
                        </p>

                        <div class="flex gap-4 max-w-md">
                            <input
                                v-model="form.phoneNumber"
                                placeholder="+7 777 123 45 67"
                                class="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-yellow-400 outline-none transition"
                            />
                            <button
                                @click="sendTGCode"
                                class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold transition shadow-lg shadow-yellow-500/30"
                            >
                                Выслать код
                            </button>
                        </div>

                        <div
                            v-if="codeSent"
                            class="mt-4 flex gap-4 max-w-md animate-fade-in"
                        >
                            <input
                                v-model="verificationCode"
                                placeholder="Код из SMS/Telegram"
                                class="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-black outline-none transition"
                            />
                            <button
                                @click="verifyTGCode"
                                class="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-bold transition shadow-lg"
                            >
                                Подтвердить
                            </button>
                        </div>
                    </div>

                    <div class="bg-white p-8 rounded-2xl shadow-sm">
                        <h2 class="text-xl font-bold mb-6 text-gray-800">
                            Новый анализ
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                v-model="form.phoneNumber"
                                placeholder="Ваш номер телефона"
                                class="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input
                                v-model="form.postLink"
                                placeholder="Ссылка на пост (https://t.me/...)"
                                class="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                @click="startAnalysis"
                                :disabled="isLoading"
                                class="bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                            >
                                {{
                                    isLoading
                                        ? '🤖 Обработка...'
                                        : '🚀 Запустить анализ'
                                }}
                            </button>
                        </div>
                    </div>

                    <div v-if="results" class="animate-fade-in space-y-8">
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
                                    <p
                                        class="text-blue-900 text-lg leading-relaxed font-medium"
                                    >
                                        {{ aiSummary }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            v-if="topKeywords.length"
                            class="bg-white p-6 rounded-2xl shadow-sm"
                        >
                            <div class="flex items-center justify-between mb-4">
                                <h3
                                    class="text-xs font-bold text-gray-400 uppercase tracking-widest"
                                >
                                    Ключевые темы обсуждения
                                </h3>
                                <button
                                    v-if="searchQuery"
                                    @click="searchQuery = ''"
                                    class="text-xs text-blue-500 hover:text-blue-700 font-medium"
                                >
                                    ✕ Сбросить фильтр
                                </button>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button
                                    v-for="item in topKeywords"
                                    :key="item.word"
                                    @click="selectKeyword(item.word)"
                                    :class="
                                        searchQuery === item.word
                                            ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                            : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    "
                                    class="px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 font-medium"
                                >
                                    <span>#{{ item.word }}</span>
                                    <span
                                        :class="
                                            searchQuery === item.word
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                        "
                                        class="text-[10px] px-1.5 rounded-md font-bold"
                                        >{{ item.count }}</span
                                    >
                                </button>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div class="lg:col-span-2 grid grid-cols-2 gap-4">
                                <div
                                    class="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-500"
                                >
                                    <p
                                        class="text-gray-400 text-xs uppercase font-bold"
                                    >
                                        Всего комментариев
                                    </p>
                                    <p
                                        class="text-4xl font-black text-gray-800 mt-2"
                                    >
                                        {{ results.stats.total }}
                                    </p>
                                </div>
                                <div
                                    class="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-green-500"
                                >
                                    <p
                                        class="text-gray-400 text-xs uppercase font-bold text-green-600"
                                    >
                                        Позитив
                                    </p>
                                    <p
                                        class="text-4xl font-black text-green-600 mt-2"
                                    >
                                        {{ results.stats.positive }}
                                    </p>
                                </div>
                                <div
                                    class="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-red-500"
                                >
                                    <p
                                        class="text-gray-400 text-xs uppercase font-bold text-red-600"
                                    >
                                        Негатив
                                    </p>
                                    <p
                                        class="text-4xl font-black text-red-600 mt-2"
                                    >
                                        {{ results.stats.negative }}
                                    </p>
                                </div>
                                <div
                                    class="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-purple-500"
                                >
                                    <p
                                        class="text-gray-400 text-xs uppercase font-bold text-purple-600"
                                    >
                                        Токсично
                                    </p>
                                    <p
                                        class="text-4xl font-black text-purple-600 mt-2"
                                    >
                                        {{ results.stats.toxic }}
                                    </p>
                                </div>
                            </div>

                            <div
                                class="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center relative"
                            >
                                <h3
                                    class="absolute top-6 left-6 text-xs font-bold text-gray-400 uppercase"
                                >
                                    Соотношение
                                </h3>
                                <div class="w-full h-48 mt-4">
                                    <SentimentChart :stats="results.stats" />
                                </div>
                            </div>
                        </div>

                        <div
                            class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                        >
                            <div
                                class="p-4 border-b bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between"
                            >
                                <div class="flex gap-3 flex-1">
                                    <input
                                        v-model="searchQuery"
                                        placeholder="🔍 Поиск по тексту..."
                                        class="border border-gray-300 p-2.5 rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    />
                                    <select
                                        v-model="filterSentiment"
                                        class="border border-gray-300 p-2.5 rounded-lg text-sm outline-none bg-white cursor-pointer hover:border-blue-400 transition"
                                    >
                                        <option value="all">
                                            Все тональности
                                        </option>
                                        <option value="positive">
                                            🟢 Только позитив
                                        </option>
                                        <option value="negative">
                                            🔴 Только негатив
                                        </option>
                                        <option value="neutral">
                                            ⚪️ Нейтральные
                                        </option>
                                    </select>
                                </div>
                                <button
                                    @click="exportToExcel"
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
                                            <td
                                                class="p-5 font-medium text-sm text-gray-900"
                                            >
                                                {{ c.author_name }}
                                            </td>
                                            <td
                                                class="p-5 text-sm text-gray-600 leading-relaxed"
                                            >
                                                <div
                                                    v-html="
                                                        highlightText(
                                                            c.content,
                                                            searchQuery,
                                                        )
                                                    "
                                                ></div>
                                            </td>
                                            <td class="p-5">
                                                <div
                                                    class="flex flex-col items-center gap-2"
                                                >
                                                    <span
                                                        :class="{
                                                            'text-green-700 bg-green-100 border-green-200':
                                                                c.analysis
                                                                    ?.sentiment ===
                                                                'positive',
                                                            'text-red-700 bg-red-100 border-red-200':
                                                                c.analysis
                                                                    ?.sentiment ===
                                                                'negative',
                                                            'text-gray-700 bg-gray-100 border-gray-200':
                                                                c.analysis
                                                                    ?.sentiment ===
                                                                'neutral',
                                                        }"
                                                        class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-wider"
                                                    >
                                                        {{
                                                            c.analysis
                                                                ?.sentiment
                                                        }}
                                                    </span>

                                                    <div
                                                        class="w-24 group relative"
                                                    >
                                                        <div
                                                            class="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden"
                                                        >
                                                            <div
                                                                class="h-full bg-blue-500 rounded-full"
                                                                :style="{
                                                                    width:
                                                                        (c
                                                                            .analysis
                                                                            ?.score ||
                                                                            c
                                                                                .analysis
                                                                                ?.confidence ||
                                                                            0) *
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
                                                                    (c.analysis
                                                                        ?.score ||
                                                                        c
                                                                            .analysis
                                                                            ?.confidence ||
                                                                        0) *
                                                                        100,
                                                                )
                                                            }}% conf.
                                                        </p>
                                                    </div>

                                                    <span
                                                        v-if="
                                                            c.analysis?.is_toxic
                                                        "
                                                        class="flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase animate-pulse"
                                                    >
                                                        ☣️ Toxic
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div
                                v-if="filteredComments.length === 0"
                                class="p-12 text-center"
                            >
                                <p class="text-4xl mb-4">🔍</p>
                                <p class="text-gray-500 font-medium">
                                    Ничего не найдено по вашему запросу
                                </p>
                                <button
                                    @click="
                                        searchQuery = '';
                                        filterSentiment = 'all';
                                    "
                                    class="text-blue-500 text-sm mt-2 hover:underline"
                                >
                                    Сбросить фильтры
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <transition name="slide-fade">
            <div
                v-if="toast.show"
                :class="{
                    'bg-red-600': toast.type === 'error',
                    'bg-green-600': toast.type === 'success',
                    'bg-blue-600': toast.type === 'info',
                }"
                class="fixed bottom-10 right-10 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-4 transition-all transform hover:scale-105"
            >
                <span class="text-xl" v-if="toast.type === 'error'">🚨</span>
                <span class="text-xl" v-if="toast.type === 'success'">✅</span>
                <span class="text-xl" v-if="toast.type === 'info'">ℹ️</span>

                <span class="font-bold text-sm tracking-wide">{{
                    toast.message
                }}</span>

                <button
                    @click="toast.show = false"
                    class="ml-2 opacity-60 hover:opacity-100 text-xl leading-none"
                >
                    &times;
                </button>
            </div>
        </transition>
    </div>
</template>

<style scoped>
/* Анимация уведомлений */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-enter-from {
    transform: translateX(100px);
    opacity: 0;
}
.slide-fade-leave-to {
    transform: translateX(100px);
    opacity: 0;
}

/* Простая анимация появления блоков */
.animate-fade-in {
    animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Кастомный скроллбар для сайдбара */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e2e8f0;
    border-radius: 4px;
}
</style>
