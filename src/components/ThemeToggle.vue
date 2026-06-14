<script setup>
import { ref } from 'vue'
import { getInitialTheme, setTheme } from '@/composables/useTheme'

const currentTheme = ref(getInitialTheme())

const toggleTheme = () => {
    currentTheme.value = setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
}
</script>

<template>
    <button @click="toggleTheme" class="rounded-full bg-gray-100 p-3 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700" title="Toggle theme">
        <svg v-if="currentTheme === 'dark'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 14v2m7-9h2M3 12H1m16.95 4.95l1.414 1.414M4.636 4.636l1.414 1.414m0 11.314-1.414 1.414m13.9-13.9 1.414-1.414M12 7a5 5 0 100 10 5 5 0 000-10z"></path>
        </svg>
        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3c.05 0 .1 0 .15.01A7 7 0 0021 12.79z"></path>
        </svg>
    </button>
</template>
