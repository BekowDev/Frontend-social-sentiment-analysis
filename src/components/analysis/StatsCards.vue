<script setup>
    // Важно: defineProps должен иметь значения по умолчанию!
    const props = defineProps({
        stats: {
            type: Object,
            required: false, // Можно не передавать, если данные грузятся
            default: () => ({
                total: 0,
                positive: 0,
                negative: 0,
                toxic: 0,
                neutral: 0,
            }),
        },
    });
</script>

<template>
    <div
        v-if="stats"
        class="grid grid-cols-2 gap-4">
        <div
            class="flex flex-col items-center justify-center border-l-4 border-blue-600 bg-white p-6 shadow-md transition-all hover:shadow-lg hover:bg-gray-50 rounded-none">
            <p
                class="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                Всего
            </p>
            <p class="text-4xl font-black text-gray-800">
                {{ stats?.total || 0 }}
            </p>
        </div>

        <div
            class="flex flex-col items-center justify-center border-l-4 border-green-600 bg-white p-6 shadow-md transition-all hover:shadow-lg hover:bg-green-50/10 rounded-none">
            <p
                class="mb-2 text-xs font-bold uppercase tracking-widest text-green-700">
                Позитив
            </p>
            <p class="text-4xl font-black text-green-600">
                {{ stats?.positive || 0 }}
            </p>
        </div>

        <div
            class="flex flex-col items-center justify-center border-l-4 border-red-600 bg-white p-6 shadow-md transition-all hover:shadow-lg hover:bg-red-50/10 rounded-none">
            <p
                class="mb-2 text-xs font-bold uppercase tracking-widest text-red-700">
                Негатив
            </p>
            <p class="text-4xl font-black text-red-600">
                {{ stats?.negative || 0 }}
            </p>
        </div>

        <div
            class="flex flex-col items-center justify-center border-l-4 border-purple-600 bg-white p-6 shadow-md transition-all hover:shadow-lg hover:bg-purple-50/10 rounded-none">
            <p
                class="mb-2 text-xs font-bold uppercase tracking-widest text-purple-700">
                Токсично
            </p>
            <p class="text-4xl font-black text-purple-600">
                {{ stats?.toxic || 0 }}
            </p>
        </div>
    </div>

    <div
        v-else
        class="grid grid-cols-2 gap-4 animate-pulse">
        <div
            class="h-32 bg-gray-200"
            v-for="i in 4"
            :key="i"></div>
    </div>
</template>
