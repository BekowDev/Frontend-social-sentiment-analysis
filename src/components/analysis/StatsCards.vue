<script setup>
// Определяем, какие данные ждет этот компонент
defineProps({
    stats: {
        type: Object,
        required: true,
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
    <div class="grid grid-cols-2 gap-4 h-full">
        <div
            class="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-500 flex flex-col justify-between"
        >
            <p class="text-gray-400 text-xs uppercase font-bold tracking-wider">
                Всего
            </p>
            <p class="text-4xl font-black text-gray-800">{{ stats.total }}</p>
        </div>

        <div
            class="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-green-500 flex flex-col justify-between"
        >
            <p
                class="text-gray-400 text-xs uppercase font-bold tracking-wider text-green-600"
            >
                Позитив
            </p>
            <p class="text-4xl font-black text-green-600">
                {{ stats.positive }}
            </p>
        </div>

        <div
            class="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-red-500 flex flex-col justify-between"
        >
            <p
                class="text-gray-400 text-xs uppercase font-bold tracking-wider text-red-600"
            >
                Негатив
            </p>
            <p class="text-4xl font-black text-red-600">{{ stats.negative }}</p>
        </div>

        <div
            class="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-purple-500 flex flex-col justify-between"
        >
            <p
                class="text-gray-400 text-xs uppercase font-bold tracking-wider text-purple-600"
            >
                Токсично
            </p>
            <p class="text-4xl font-black text-purple-600">{{ stats.toxic }}</p>
        </div>
    </div>
</template>
