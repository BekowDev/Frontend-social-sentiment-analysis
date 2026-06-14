<template>
    <div v-if="isValidUrl" class="transition-all duration-300 ease-in-out mt-4 mb-4">
        <div v-if="platform === 'youtube'" class="rounded-4xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="relative w-full aspect-video">
                <iframe v-if="youtubeId" class="absolute top-0 left-0 w-full h-full" :src="`https://www.youtube.com/embed/${youtubeId}`" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>

        <a v-else :href="url" target="_blank" rel="noopener noreferrer" class="flex items-center p-2 bg-white dark:bg-gray-800 rounded-full shadow border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
            <div class="flex-shrink-0 mr-4">
                <div class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <svg class="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                    </svg>
                </div>
            </div>
            <div class="overflow-hidden">
                <h3 class="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {{ platform === "telegram" ? "Telegram Post" : "Ссылка распознана" }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{{ url }}</p>
            </div>
        </a>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    url: {
        type: String,
        default: "",
    },
});

const isValidUrl = computed(() => {
    if (!props.url) return false;
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
    return urlPattern.test(props.url.trim());
});

const platform = computed(() => {
    if (!isValidUrl.value) return null;
    const lowerUrl = props.url.toLowerCase();
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) return "youtube";
    if (lowerUrl.includes("t.me")) return "telegram";
    return "other";
});

const youtubeId = computed(() => {
    if (platform.value !== "youtube") return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = props.url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
});
</script>
