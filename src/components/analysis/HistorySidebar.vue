<script setup>
import { onMounted } from 'vue';
import { useAnalysisStore } from '@/store/analysis';
import { storeToRefs } from 'pinia';

// Подключаем Store
const store = useAnalysisStore();
const { history } = storeToRefs(store);

// Загружаем историю при появлении компонента
onMounted(() => {
    store.fetchHistory();
});

// Функция клика по элементу
const handleSelect = async (id) => {
    await store.loadFromHistory(id);

    // На мобильных устройствах скроллим к контенту
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth' });
    }
};
</script>

<template>
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
                v-if="history.length === 0"
                class="text-center py-10 opacity-50"
            >
                <p class="text-2xl mb-2">📂</p>
                <p class="text-xs text-gray-400 italic">История пока пуста</p>
            </div>

            <button
                v-for="item in history"
                :key="item._id"
                @click="handleSelect(item._id)"
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

                <div class="flex gap-3 text-[10px] text-gray-500 mt-1">
                    <span class="flex items-center gap-1">
                        💬 <b>{{ item.stats?.total || 0 }}</b>
                    </span>

                    <span
                        class="flex items-center gap-1 text-red-500"
                        v-if="item.stats?.toxic > 0"
                    >
                        ☣️ <b>{{ item.stats?.toxic }}</b>
                    </span>

                    <span
                        class="flex items-center gap-1 ml-auto text-blue-400 font-mono bg-blue-50 px-1 rounded"
                    >
                        ⏱ {{ (item.executionTime / 1000).toFixed(1) }}s
                    </span>
                </div>

                <div
                    class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
            </button>
        </div>
    </aside>
</template>

<style scoped>
/* Тонкий скроллбар для красоты */
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
