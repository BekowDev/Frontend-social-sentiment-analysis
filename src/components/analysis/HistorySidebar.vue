<script setup>
    import { onMounted, ref } from 'vue';
    import { useAnalysisStore } from '@/store/analysis';
    import { storeToRefs } from 'pinia';

    const store = useAnalysisStore();
    const { history } = storeToRefs(store);

    // Состояние открытия/закрытия панели
    const isOpen = ref(false);

    onMounted(() => {
        store.fetchHistory();
    });

    const handleSelect = async (id) => {
        await store.loadFromHistory(id);

        // Закрываем панель после выбора (удобно для мобильных и drawer-режима)
        isOpen.value = false;

        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    };
</script>

<template>
    <button
        @click="isOpen = true"
        :class="{ 'translate-x-0': !isOpen, '-translate-x-full': isOpen }"
        class="fixed left-0 top-1/2 z-30 flex -translate-y-1/2 transform items-center gap-2 border border-l-0 border-gray-300 bg-white py-4 pl-1 pr-3 shadow-md transition-transform duration-300 hover:bg-gray-50">
        <span class="text-xl">📂</span>
        <span
            class="writing-mode-vertical text-xs font-bold tracking-widest text-gray-500 uppercase">
            История
        </span>
    </button>

    <div
        v-if="isOpen"
        @click="isOpen = false"
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"></div>

    <aside
        :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
        class="fixed top-0 left-0 z-50 flex h-full w-80 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out">
        <div
            class="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-6">
            <h2
                class="text-xs font-bold text-gray-500 uppercase tracking-widest">
                История анализов
            </h2>
            <button
                @click="isOpen = false"
                class="flex h-8 w-8 items-center justify-center border border-gray-300 text-gray-500 transition hover:bg-red-500 hover:text-white hover:border-red-500">
                ✕
            </button>
        </div>

        <div class="custom-scrollbar flex-1 overflow-y-auto bg-gray-100 p-0">
            <div
                v-if="history.length === 0"
                class="py-10 text-center opacity-50">
                <p class="mb-2 text-2xl">📂</p>
                <p class="text-xs italic text-gray-400">История пока пуста</p>
            </div>

            <button
                v-for="item in history"
                :key="item._id"
                @click="handleSelect(item._id)"
                class="group relative w-full border-b border-gray-200 bg-white p-4 text-left transition-all hover:bg-blue-50">
                <div class="mb-2 flex items-center gap-2">
                    <span
                        class="bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        {{ item.platform }}
                    </span>
                    <span class="ml-auto text-[10px] text-gray-400">
                        {{ new Date(item.createdAt).toLocaleDateString() }}
                    </span>
                </div>

                <p
                    class="mb-2 w-full truncate text-xs font-bold text-gray-800"
                    :title="item.postLink">
                    {{ item.postLink }}
                </p>

                <div class="mt-1 flex gap-3 text-[10px] text-gray-500">
                    <span class="flex items-center gap-1">
                        💬 <b>{{ item.stats?.total || 0 }}</b>
                    </span>

                    <span
                        class="flex items-center gap-1 text-red-600"
                        v-if="item.stats?.toxic > 0">
                        ☣️ <b>{{ item.stats?.toxic }}</b>
                    </span>

                    <span
                        class="ml-auto flex items-center gap-1 bg-gray-200 px-1 font-mono text-gray-700">
                        ⏱ {{ (item.executionTime / 1000).toFixed(1) }}s
                    </span>
                </div>

                <div
                    class="absolute top-0 bottom-0 left-0 w-1 bg-blue-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
            </button>
        </div>
    </aside>
</template>

<style scoped>
    /* CSS для вертикального текста кнопки */
    .writing-mode-vertical {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        transform: rotate(180deg);
    }

    /* Квадратный скроллбар */
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
