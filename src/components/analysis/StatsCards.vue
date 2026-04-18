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
        class="grid grid-cols-2 gap-5">
        <div
            class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <p
                class="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Всего
            </p>
            <p class="text-4xl font-black text-gray-900 dark:text-gray-100">
                {{ stats?.total || 0 }}
            </p>
        </div>

        <div
            class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <p
                class="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Позитив
            </p>
            <p class="text-4xl font-black text-green-600">
                {{ stats?.positive || 0 }}
            </p>
        </div>

        <div
            class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <p
                class="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Негатив
            </p>
            <p class="text-4xl font-black text-red-600">
                {{ stats?.negative || 0 }}
            </p>
        </div>

        <div
            class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <p
                class="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
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
            class="h-32 rounded-3xl bg-gray-200 dark:bg-gray-800"
            v-for="i in 4"
            :key="i"></div>
    </div>
</template>
