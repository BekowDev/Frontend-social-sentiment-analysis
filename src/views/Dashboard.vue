<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useAnalysisStore } from '@/store/analysis';
import { storeToRefs } from 'pinia';
import api from '@/api';
import { useNotifications } from '@/composables/useNotifications';

// --- ИМПОРТ КОМПОНЕНТОВ ---
import HistorySidebar from '@/components/analysis/HistorySidebar.vue';
import StatsCards from '@/components/analysis/StatsCards.vue';
import AiSummary from '@/components/analysis/AiSummary.vue';
import KeywordCloud from '@/components/analysis/KeywordCloud.vue';
import CommentsTable from '@/components/analysis/CommentsTable.vue';
import SentimentChart from '@/components/SentimentChart.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

// --- ИНИЦИАЛИЗАЦИЯ ---
const auth = useAuthStore();
const analysisStore = useAnalysisStore();
const { results, isLoading } = storeToRefs(analysisStore);
const { toast, showNotify } = useNotifications();

// --- СОСТОЯНИЕ ---
const form = ref({
    phoneNumber: '+77714594458',
    postLink: 'https://t.me/TrumpJr/10541',
    platform: 'telegram',
});

const codeSent = ref(false);
const verificationCode = ref('');

// Общее состояние фильтров (чтобы Облако Тегов и Таблица работали сообща)
const searchQuery = ref('');
const filterSentiment = ref('all');

// --- ЛОГИКА TELEGRAM ---
const sendTGCode = async () => {
    try {
        if (!form.value.phoneNumber)
            return showNotify('Введите номер телефона', 'error');
        await api.post('/social/send-code', {
            phoneNumber: form.value.phoneNumber,
            platform: 'telegram',
        });
        codeSent.value = true;
        showNotify('Код отправлен!', 'success');
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

// --- ЛОГИКА АНАЛИЗА ---
const startAnalysis = async () => {
    if (!form.value.postLink)
        return showNotify('Введите ссылку на пост', 'error');

    searchQuery.value = '';
    filterSentiment.value = 'all';

    try {
        // Запоминаем время начала на клиенте (для мгновенного отображения)
        // ИЛИ берем данные с сервера, если store возвращает результат
        const start = Date.now();

        await analysisStore.fetchAnalysis(form.value);

        // Получаем реальное время с сервера (оно теперь есть в results.value)
        const serverTime = results.value.executionTime
            ? (results.value.executionTime / 1000).toFixed(1) // Переводим мс в секунды (2400 -> 2.4)
            : ((Date.now() - start) / 1000).toFixed(1); // Фоллбек, если сервер не вернул

        // ОБНОВЛЕННОЕ УВЕДОМЛЕНИЕ
        showNotify(`Готово! Обработано за ${serverTime} сек. ⏱`, 'success');

        analysisStore.fetchHistory();
    } catch (e) {
        showNotify('Ошибка при анализе', 'error');
    }
};

// Обработчик клика по тегу в облаке слов
const handleKeywordSelect = (word) => {
    searchQuery.value = word;
    // Если выбрали слово - скроллим к таблице
    if (word) {
        const tableElement = document.getElementById('comments-table');
        if (tableElement) tableElement.scrollIntoView({ behavior: 'smooth' });
    }
};
</script>

<template>
    <div class="flex min-h-screen bg-gray-50">
        <HistorySidebar />

        <main class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            <nav
                class="bg-white shadow-sm px-8 py-4 flex justify-between items-center z-20 shrink-0"
            >
                <h1 class="text-xl font-black text-blue-600 tracking-tight">
                    Social Analyzer
                </h1>
                <button
                    @click="auth.logout()"
                    class="text-sm font-medium text-red-500 hover:bg-red-50 px-3 py-1 rounded transition"
                >
                    Выйти
                </button>
            </nav>

            <div class="flex-1 overflow-y-auto p-4 md:p-8" id="main-content">
                <div class="max-w-6xl mx-auto space-y-8 pb-20">
                    <LoadingSpinner v-if="isLoading" />

                    <div
                        v-if="!results && !isLoading"
                        class="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-yellow-400 animate-fade-in"
                    >
                        <h2 class="text-xl font-bold mb-2 text-gray-800">
                            Шаг 1: Подключение
                        </h2>
                        <p class="text-sm text-gray-500 mb-6">
                            Введите номер телефона для доступа к API Telegram.
                        </p>

                        <div class="flex gap-4 max-w-md flex-wrap">
                            <input
                                v-model="form.phoneNumber"
                                placeholder="+7 777 ..."
                                class="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-yellow-400 outline-none"
                            />
                            <button
                                @click="sendTGCode"
                                class="bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-600 transition"
                            >
                                Выслать код
                            </button>
                        </div>

                        <div
                            v-if="codeSent"
                            class="mt-4 flex gap-4 max-w-md animate-fade-in flex-wrap"
                        >
                            <input
                                v-model="verificationCode"
                                placeholder="Код из SMS"
                                class="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-black outline-none"
                            />
                            <button
                                @click="verifyTGCode"
                                class="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition"
                            >
                                Подтвердить
                            </button>
                        </div>
                    </div>

                    <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                        <h2 class="text-xl font-bold mb-6 text-gray-800">
                            Новый анализ
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                v-model="form.phoneNumber"
                                placeholder="Ваш номер (для проверки)"
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
                                class="bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                            >
                                {{
                                    isLoading
                                        ? 'Обработка...'
                                        : '🚀 Анализировать'
                                }}
                            </button>
                        </div>
                    </div>

                    <div v-if="results" class="space-y-8 animate-fade-in">
                        <AiSummary :stats="results.stats" />

                        <KeywordCloud
                            :comments="results.comments"
                            :activeKeyword="searchQuery"
                            @select="handleKeywordSelect"
                        />

                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div class="lg:col-span-2">
                                <StatsCards :stats="results.stats" />
                            </div>
                            <div
                                class="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center relative min-h-[300px]"
                            >
                                <h3
                                    class="absolute top-6 left-6 text-xs font-bold text-gray-400 uppercase"
                                >
                                    Диаграмма
                                </h3>
                                <div class="w-full h-64 mt-4">
                                    <SentimentChart :stats="results.stats" />
                                </div>
                            </div>
                        </div>

                        <div id="comments-table">
                            <CommentsTable
                                :comments="results.comments"
                                v-model:searchQuery="searchQuery"
                                v-model:filterSentiment="filterSentiment"
                            />
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
                class="fixed bottom-10 right-10 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-4 transition-all cursor-pointer"
                @click="toast.show = false"
            >
                <span class="text-xl font-bold">{{
                    toast.type === 'error' ? '!' : 'i'
                }}</span>
                <span class="font-medium">{{ toast.message }}</span>
            </div>
        </transition>
    </div>
</template>

<style scoped>
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

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.4s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(100px);
    opacity: 0;
}
</style>
