<script setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalysisStore } from "@/store/analysis";
import { storeToRefs } from "pinia";

const store = useAnalysisStore();
const { t } = useI18n();
const { history } = storeToRefs(store);

onMounted(() => {
    store.fetchHistory().catch((error) => {
        console.error("Не удалось загрузить историю в сайдбаре:", error);
    });
});

const handleSelect = async (id) => {
    try {
        await store.loadFromHistory(id);
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
            mainContent.scrollIntoView({ behavior: "smooth" });
        }
    } catch (error) {
        console.error("Не удалось открыть анализ из сайдбара:", error);
    }
};

const formatExecutionTimeSeconds = (executionTimeMs) => {
    const numeric = Number(executionTimeMs);
    if (!Number.isFinite(numeric) || numeric < 0) {
        return "0.0s";
    }
    return `${(numeric / 1000).toFixed(1)}s`;
};

const formatHistoryDate = (rawDate) => {
    const date = new Date(rawDate);
    return Number.isFinite(date.getTime()) ? date.toLocaleDateString() : "—";
};
</script>

<template>
    <aside class="flex h-full w-72 shrink-0 flex-col border-r border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-6">
            <h2 class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {{ t("historyView.title") }}
            </h2>
        </div>

        <div class="custom-scrollbar flex-1 overflow-y-auto p-0">
            <div v-if="history.length === 0" class="py-10 text-center opacity-50">
                <p class="mb-2 text-2xl">📂</p>
                <p class="text-xs italic text-gray-400">
                    {{ t("historyView.empty") }}
                </p>
            </div>

            <button v-for="item in history" :key="item._id" @click="handleSelect(item._id)" class="group relative w-full border-b border-gray-200 bg-white p-4 text-left transition-all hover:bg-blue-50">
                <div class="mb-2 flex items-center gap-2">
                    <span class="bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        {{ item.platform }}
                    </span>
                    <span class="ml-auto text-[10px] text-gray-400">
                        {{ formatHistoryDate(item.createdAt) }}
                    </span>
                </div>

                <p class="mb-2 w-full truncate text-xs font-bold text-gray-800" :title="item.postLink">
                    {{ item.postLink }}
                </p>

                <div class="mt-1 flex gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                    <span class="flex items-center gap-1">
                        💬 <b>{{ item.stats?.total || 0 }}</b>
                    </span>

                    <span class="flex items-center gap-1 text-red-600" v-if="item.stats?.toxic > 0">
                        ☣️ <b>{{ item.stats?.toxic }}</b>
                    </span>

                    <span class="ml-auto flex items-center gap-1 bg-gray-200 px-1 font-mono text-gray-700"> ⏱ {{ formatExecutionTimeSeconds(item.executionTime) }} </span>
                </div>

                <div class="absolute top-0 bottom-0 left-0 w-1 bg-blue-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
            </button>
        </div>
    </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #f3f4f6;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 0; /* Убрано скругление */
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
}
</style>
