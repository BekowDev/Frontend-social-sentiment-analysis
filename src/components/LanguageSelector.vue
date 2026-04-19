<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setAppLocale } from '@/i18n'

const { locale } = useI18n({ useScope: 'global' })

const languages = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
    { code: 'kk', label: 'KK' },
]

const activeLocale = computed(() => locale.value)

const selectLocale = (nextLocale) => {
    setAppLocale(nextLocale)
}
</script>

<template>
    <div
        class="flex items-center gap-1 rounded-full bg-gray-100 p-1 dark:bg-gray-800"
    >
        <button
            v-for="lang in languages"
            :key="lang.code"
            @click="selectLocale(lang.code)"
            class="rounded-full px-2.5 py-1 text-xs font-semibold transition"
            :class="
                activeLocale === lang.code
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-700/70'
            "
        >
            {{ lang.label }}
        </button>
    </div>
</template>
