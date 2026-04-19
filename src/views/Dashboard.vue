<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useAnalysisStore } from '@/store/analysis'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useNotifications } from '@/composables/useNotifications'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import StatsCards from '@/components/analysis/StatsCards.vue'
import AiSummary from '@/components/analysis/AiSummary.vue'
import KeywordCloud from '@/components/analysis/KeywordCloud.vue'
import CommentsTable from '@/components/analysis/CommentsTable.vue'
import SentimentChart from '@/components/SentimentChart.vue'
import SentimentTrendChart from '@/components/analysis/SentimentTrendChart.vue'

const auth = useAuthStore()
const analysisStore = useAnalysisStore()
const { t } = useI18n()
const { results, isLoading, analysisProgress, analysisStatus, history } =
    storeToRefs(analysisStore)
const { toast, showNotify } = useNotifications()

const form = ref({
    url: 'https://t.me/petya_english/5478',
    mode: 'fast',
})
const searchQuery = ref('')
const filterSentiment = ref('all')

const hasStartedAnalysis = computed(
    () => isLoading.value || Boolean(results.value),
)
const recentHistory = computed(() => history.value.slice(0, 3))

onMounted(() => {
    if (history.value.length === 0) {
        analysisStore.fetchHistory()
    }
})

const startAnalysis = async () => {
    if (!form.value.url)
        return showNotify(t('dashboard.invalidLinkError'), 'error')

    searchQuery.value = ''
    filterSentiment.value = 'all'

    try {
        await analysisStore.fetchAnalysis(form.value)
        showNotify(t('dashboard.analysisSuccess'), 'success')
        analysisStore.fetchHistory()
    } catch (e) {
        showNotify(analysisStore.error || t('dashboard.analysisError'), 'error')
    }
}

const handleKeywordSelect = (word) => {
    searchQuery.value = word
    if (word) {
        const tableElement = document.getElementById('comments-table')
        if (tableElement) {
            tableElement.scrollIntoView({ behavior: 'smooth' })
        }
    }
}

onUnmounted(() => {
    analysisStore.clearPollingTimer()
})
</script>

<template>
    <div
        id="main-content"
        class="h-screen overflow-y-auto bg-white font-sans text-gray-900 dark:bg-gray-900 dark:text-gray-100"
    >
        <div class="mx-auto max-w-7xl px-6">
            <div class="flex justify-end py-8">
                <div class="flex items-center gap-3">
                    <LanguageSelector />
                    <ThemeToggle />
                    <RouterLink
                        to="/history"
                        class="rounded-full bg-gray-100 p-3 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        :title="t('common.history')"
                    >
                        <svg
                            class="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 5h18M3 12h18M3 19h18"
                            ></path>
                        </svg>
                    </RouterLink>
                    <button
                        @click="auth.logout()"
                        class="rounded-full bg-gray-100 p-3 text-gray-600 transition hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                        :title="t('common.logout')"
                    >
                        <svg
                            class="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            ></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div
                :class="
                    hasStartedAnalysis
                        ? 'pb-10'
                        : 'flex min-h-[calc(100vh-6rem)] items-center justify-center pb-10'
                "
            >
                <transition name="search-shift" mode="out-in">
                    <div
                        :key="hasStartedAnalysis ? 'compact' : 'centered'"
                        :class="
                            hasStartedAnalysis
                                ? 'mx-auto mt-2 w-full max-w-3xl'
                                : 'mx-auto w-full max-w-3xl'
                        "
                    >
                        <div class="text-center">
                            <h1
                                class="text-5xl font-semibold tracking-tight text-gray-700 dark:text-gray-100"
                            >
                                {{ t('dashboard.title') }}
                            </h1>
                            <p
                                v-if="!hasStartedAnalysis"
                                class="mt-2 text-sm text-gray-500 dark:text-gray-400"
                            >
                                {{ t('dashboard.subtitle') }}
                            </p>
                        </div>

                        <p
                            class="mt-8 mb-2 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                            {{ t('dashboard.enterLink') }}
                        </p>

                        <div
                            class="rounded-full bg-white p-2 shadow-[0_20px_55px_-26px_rgba(15,23,42,0.35)] dark:bg-gray-800 dark:shadow-[0_26px_70px_-34px_rgba(2,6,23,0.75)]"
                        >
                            <div
                                class="flex flex-col gap-3 md:flex-row whitespace-nowrap"
                            >
                                <input
                                    v-model="form.url"
                                    :placeholder="
                                        t('dashboard.linkPlaceholder')
                                    "
                                    class="w-full rounded-full border border-gray-200 bg-gray-50 px-6 py-4 text-base text-gray-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:focus:bg-gray-600 dark:focus:ring-blue-400/20"
                                />
                                <select
                                    v-model="form.mode"
                                    class="rounded-full border border-gray-200 bg-gray-100 px-5 py-3 pr-10 text-sm font-medium text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400/20"
                                >
                                    <option value="fast">
                                        {{ t('dashboard.fastMode') }}
                                    </option>
                                    <option value="deep">
                                        {{ t('dashboard.deepMode') }}
                                    </option>
                                </select>
                                <button
                                    @click="startAnalysis"
                                    :disabled="isLoading"
                                    class="rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {{
                                        isLoading
                                            ? analysisStatus ||
                                              t('dashboard.analyzing')
                                            : t('dashboard.startAnalysis')
                                    }}
                                </button>
                            </div>
                        </div>

                        <div v-if="!hasStartedAnalysis" class="mt-8">
                            <p
                                class="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400"
                            >
                                {{ t('dashboard.recentAnalyses') }}
                            </p>
                            <div class="flex flex-wrap gap-2">
                                <button
                                    v-for="item in recentHistory"
                                    :key="item._id"
                                    @click="
                                        analysisStore.loadFromHistory(item._id)
                                    "
                                    class="max-w-full truncate rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    {{ item.postLink }}
                                </button>
                                <p
                                    v-if="recentHistory.length === 0"
                                    class="text-xs text-gray-400 dark:text-gray-400"
                                >
                                    {{ t('dashboard.historyEmpty') }}
                                </p>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>

            <div
                v-if="hasStartedAnalysis"
                class="mx-auto mt-2 max-w-7xl space-y-8 pb-16"
            >
                <div
                    v-if="isLoading"
                    class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                    <p
                        class="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                        {{ analysisStatus || t('dashboard.progressDefault') }}
                    </p>
                    <div
                        class="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                    >
                        <div
                            class="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
                            :style="{ width: `${analysisProgress}%` }"
                        ></div>
                    </div>
                </div>

                <AiSummary v-if="isLoading || results" />

                <div v-if="results" class="space-y-8">
                    <div
                        class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch"
                    >
                        <StatsCards
                            :stats="results.stats"
                            class="h-full rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        />

                        <div
                            class="h-full flex flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            <h3
                                class="mb-4 text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400"
                            >
                                {{ t('dashboard.reactionsTitle') }}
                            </h3>
                            <div
                                v-if="
                                    results.reactions &&
                                    results.reactions.length > 0
                                "
                                class="flex flex-wrap gap-3 flex-1 content-start"
                            >
                                <div
                                    v-for="(react, index) in results.reactions"
                                    :key="index"
                                    class="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-800"
                                >
                                    <span class="text-xl">{{
                                        react.emoji
                                    }}</span>
                                    <span
                                        class="text-sm font-semibold text-gray-700 dark:text-gray-200"
                                        >{{ react.count }}</span
                                    >
                                </div>
                            </div>
                            <div
                                v-else
                                class="flex-1 flex items-center justify-center text-gray-400 text-sm"
                            >
                                Нет данных о реакциях
                            </div>
                        </div>

                        <div
                            class="h-full flex flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            <h3
                                class="mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400"
                            >
                                {{ t('dashboard.progressRatioTitle') }}
                            </h3>
                            <div
                                class="flex-1 flex items-center justify-center min-h-[200px] w-full"
                            >
                                <SentimentChart :stats="results.stats" />
                            </div>
                        </div>
                    </div>

                    <div
                        class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                        <KeywordCloud
                            :comments="results.comments"
                            :activeKeyword="searchQuery"
                            @select="handleKeywordSelect"
                        />
                    </div>

                    <div
                        class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                        <h3
                            class="mb-6 text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400"
                        >
                            {{ t('dashboard.trendTitle') }}
                        </h3>
                        <div class="h-80 w-full">
                            <SentimentTrendChart :comments="results.comments" />
                        </div>
                    </div>

                    <div
                        id="comments-table"
                        class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                        <CommentsTable
                            :comments="results.comments"
                            v-model:searchQuery="searchQuery"
                            v-model:filterSentiment="filterSentiment"
                        />
                    </div>
                </div>
            </div>
        </div>

        <transition name="slide-fade">
            <div
                v-if="toast.show"
                :class="{
                    'bg-red-700': toast.type === 'error',
                    'bg-green-700': toast.type === 'success',
                    'bg-blue-700': toast.type === 'info',
                }"
                class="fixed right-0 bottom-0 z-50 m-6 flex min-w-[300px] cursor-pointer items-center gap-4 rounded-3xl border border-white/20 px-6 py-4 text-white shadow-xl transition-all"
                @click="toast.show = false"
            >
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

.search-shift-enter-active,
.search-shift-leave-active {
    transition: all 0.4s ease;
}

.search-shift-enter-from,
.search-shift-leave-to {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
}
</style>
