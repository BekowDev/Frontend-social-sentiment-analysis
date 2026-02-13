<script setup>
    import { ref } from 'vue';
    import { useAuthStore } from '@/store/auth';
    import { useAnalysisStore } from '@/store/analysis';
    import { storeToRefs } from 'pinia';
    import api from '@/api';
    import { useNotifications } from '@/composables/useNotifications';
    import HistorySidebar from '@/components/analysis/HistorySidebar.vue';
    import StatsCards from '@/components/analysis/StatsCards.vue';
    import AiSummary from '@/components/analysis/AiSummary.vue';
    import KeywordCloud from '@/components/analysis/KeywordCloud.vue';
    import CommentsTable from '@/components/analysis/CommentsTable.vue';
    import SentimentChart from '@/components/SentimentChart.vue';
    import SentimentTrendChart from '@/components/analysis/SentimentTrendChart.vue';
    import LoadingSpinner from '@/components/LoadingSpinner.vue';

    const auth = useAuthStore();
    const analysisStore = useAnalysisStore();
    const { results, isLoading } = storeToRefs(analysisStore);
    const { toast, showNotify } = useNotifications();

    const form = ref({
        phoneNumber: '+77714594458',
        postLink: 'https://t.me/petya_english/5478',
        platform: 'telegram',
    });

    const codeSent = ref(false);
    const verificationCode = ref('');

    const searchQuery = ref('');
    const filterSentiment = ref('all');

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
            if (!verificationCode.value)
                return showNotify('Введите код', 'error');
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

    const startAnalysis = async () => {
        if (!form.value.postLink)
            return showNotify('Введите ссылку на пост', 'error');

        searchQuery.value = '';
        filterSentiment.value = 'all';

        try {
            const start = Date.now();
            await analysisStore.fetchAnalysis(form.value);

            const serverTime = results.value.executionTime
                ? (results.value.executionTime / 1000).toFixed(1)
                : ((Date.now() - start) / 1000).toFixed(1);

            showNotify(`Готово! Обработано за ${serverTime} сек. ⏱`, 'success');
            analysisStore.fetchHistory();
        } catch (e) {
            showNotify('Ошибка при анализе', 'error');
        }
    };

    const handleKeywordSelect = (word) => {
        searchQuery.value = word;
        if (word) {
            const tableElement = document.getElementById('comments-table');
            if (tableElement)
                tableElement.scrollIntoView({
                    behavior: 'smooth',
                });
        }
    };
</script>

<template>
    <div class="flex min-h-screen bg-gray-100 font-sans">
        <HistorySidebar />
        <main class="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
            <nav
                class="z-20 flex shrink-0 items-center justify-between bg-white px-8 py-4 shadow-md">
                <h1
                    class="text-xl font-bold text-blue-700 tracking-tight uppercase">
                    Social Analyzer
                    <span class="text-gray-400 font-normal text-sm ml-2"
                        >v2.0</span
                    >
                </h1>
                <button
                    @click="auth.logout()"
                    class="rounded-none border border-red-500 px-4 py-2 text-sm font-bold uppercase tracking-wider text-red-600 transition hover:bg-red-50 focus:ring-2 focus:ring-red-200">
                    Выйти
                </button>
            </nav>

            <div
                class="flex-1 overflow-y-auto p-4 md:p-8"
                id="main-content">
                <div class="mx-auto max-w-6xl space-y-8 pb-20">
                    <div
                        v-if="!results && !isLoading"
                        class="animate-fade-in rounded-none border-t-4 border-yellow-500 bg-white p-8 shadow-md">
                        <h2
                            class="mb-2 text-xl font-bold text-gray-800 uppercase tracking-wide">
                            Шаг 1: Подключение
                        </h2>
                        <p class="mb-6 text-sm text-gray-600">
                            Введите номер телефона для доступа к API Telegram.
                        </p>

                        <div class="flex max-w-md flex-wrap gap-4">
                            <input
                                v-model="form.phoneNumber"
                                placeholder="+7 777 ..."
                                class="flex-1 rounded-none border border-gray-400 bg-gray-50 p-3 outline-none transition focus:border-yellow-500 focus:bg-white focus:ring-1 focus:ring-yellow-500" />
                            <button
                                @click="sendTGCode"
                                class="rounded-none bg-yellow-500 px-6 py-2 font-bold uppercase tracking-wider text-white shadow transition hover:bg-yellow-600 hover:shadow-md active:translate-y-px">
                                Выслать код
                            </button>
                        </div>

                        <div
                            v-if="codeSent"
                            class="animate-fade-in mt-6 flex max-w-md flex-wrap gap-4">
                            <input
                                v-model="verificationCode"
                                placeholder="Код из SMS"
                                class="flex-1 rounded-none border border-gray-400 bg-gray-50 p-3 outline-none transition focus:border-black focus:bg-white focus:ring-1 focus:ring-black" />
                            <button
                                @click="verifyTGCode"
                                class="rounded-none bg-gray-900 px-6 py-2 font-bold uppercase tracking-wider text-white shadow transition hover:bg-black hover:shadow-md active:translate-y-px">
                                Подтвердить
                            </button>
                        </div>
                    </div>

                    <div
                        class="rounded-none bg-white p-6 shadow-md md:p-8 border-t-4 border-blue-600">
                        <h2
                            class="mb-6 text-xl font-bold text-gray-800 uppercase tracking-wide">
                            Новый анализ
                        </h2>
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <input
                                v-model="form.phoneNumber"
                                placeholder="Ваш номер"
                                class="rounded-none border border-gray-400 bg-gray-50 p-3 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600" />
                            <input
                                v-model="form.postLink"
                                placeholder="Ссылка на пост"
                                class="rounded-none border border-gray-400 bg-gray-50 p-3 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600" />
                            <button
                                @click="startAnalysis"
                                :disabled="isLoading"
                                class="flex items-center justify-center gap-2 rounded-none bg-blue-600 font-bold uppercase tracking-wider text-white shadow transition hover:bg-blue-700 hover:shadow-md disabled:opacity-50 disabled:shadow-none">
                                {{
                                    isLoading ? 'Обработка...' : 'Анализировать'
                                }}
                            </button>
                        </div>
                    </div>

                    <LoadingSpinner v-if="isLoading" />

                    <div
                        v-if="results"
                        class="animate-fade-in space-y-6">
                        <div class="rounded-none shadow-md bg-white">
                            <AiSummary :stats="results.stats" />
                        </div>

                        <div class="rounded-none shadow-md bg-white p-4">
                            <KeywordCloud
                                :comments="results.comments"
                                :activeKeyword="searchQuery"
                                @select="handleKeywordSelect" />
                        </div>

                        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div class="space-y-6 lg:col-span-2">
                                <div
                                    v-if="
                                        results.reactions &&
                                        results.reactions.length > 0
                                    "
                                    class="animate-fade-in rounded-none bg-white p-6 shadow-md">
                                    <h3
                                        class="mb-4 text-xs font-bold tracking-widest text-gray-500 uppercase border-b pb-2">
                                        Реакции на пост
                                    </h3>
                                    <div class="flex flex-wrap gap-3">
                                        <div
                                            v-for="(
                                                react, index
                                            ) in results.reactions"
                                            :key="index"
                                            class="flex cursor-default items-center gap-2 rounded-none border border-gray-300 bg-gray-50 px-4 py-2 transition-colors hover:bg-gray-100 hover:shadow-sm">
                                            <span class="text-xl">{{
                                                react.emoji
                                            }}</span>
                                            <span
                                                class="text-sm font-bold text-gray-700"
                                                >{{ react.count }}</span
                                            >
                                        </div>
                                    </div>
                                </div>

                                <StatsCards
                                    :stats="results.stats"
                                    class="rounded-none shadow-md" />
                            </div>

                            <div
                                class="relative flex flex-col items-center justify-center rounded-none bg-white p-6 shadow-md">
                                <h3
                                    class="absolute top-6 left-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Общее соотношение
                                </h3>
                                <div class="mt-4 h-64 w-full">
                                    <SentimentChart :stats="results.stats" />
                                </div>
                            </div>
                        </div>

                        <div class="rounded-none bg-white p-6 shadow-md">
                            <div
                                class="mb-6 flex items-center justify-between border-b pb-2">
                                <h3
                                    class="text-xs font-bold tracking-widest text-gray-500 uppercase">
                                    📈 Динамика настроения по времени
                                </h3>
                            </div>
                            <div class="h-80 w-full">
                                <SentimentTrendChart
                                    :comments="results.comments" />
                            </div>
                        </div>

                        <div
                            id="comments-table"
                            class="rounded-none shadow-md bg-white">
                            <CommentsTable
                                :comments="results.comments"
                                v-model:searchQuery="searchQuery"
                                v-model:filterSentiment="filterSentiment" />
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <transition name="slide-fade">
            <div
                v-if="toast.show"
                :class="{
                    'bg-red-700': toast.type === 'error',
                    'bg-green-700': toast.type === 'success',
                    'bg-blue-700': toast.type === 'info',
                }"
                class="fixed right-0 bottom-0 z-50 m-6 flex min-w-[300px] cursor-pointer items-center gap-4 rounded-none px-6 py-4 text-white shadow-xl transition-all border-l-4 border-white/20"
                @click="toast.show = false">
                <span class="text-xl font-bold">{{
                    toast.type === 'error' ? '!' : 'i'
                }}</span>
                <span class="font-medium tracking-wide">{{
                    toast.message
                }}</span>
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
