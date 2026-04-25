<script setup>
import { useAuthStore } from '@/store/auth'
import { useI18n } from 'vue-i18n'
import LanguageSelector from '@/components/LanguageSelector.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const auth = useAuthStore()
const { t } = useI18n()
</script>

<template>
    <header
        class="fixed inset-x-0 top-0 z-50 border-b border-gray-200/70 bg-white/90 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/90"
    >
        <div
            class="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6"
        >
            <RouterLink
                :to="{ name: 'Landing' }"
                class="inline-flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="oikui home"
            >
                <svg
                    class="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        stroke-width="1.8"
                    />
                    <path
                        d="M12 12L17 7"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                    />
                    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
                    <path
                        d="M7 17.2C8.4 15.7 10.1 15 12 15C13.9 15 15.6 15.7 17 17.2"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                    />
                </svg>
                <span
                    class="hidden bg-linear-to-r from-blue-500 to-indigo-600 bg-clip-text text-xl font-extrabold text-transparent sm:inline"
                >
                    oikui
                </span>
            </RouterLink>

            <div class="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                <LanguageSelector />
                <ThemeToggle />

                <RouterLink
                    v-if="auth.isLoggedIn"
                    :to="{ name: 'History' }"
                    class="rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 sm:text-sm"
                >
                    {{ t('common.history') }}
                </RouterLink>

                <RouterLink
                    v-if="!auth.isLoggedIn"
                    :to="{ name: 'Login' }"
                    class="rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 sm:text-sm"
                >
                    {{ t('common.login') }}
                </RouterLink>

                <button
                    v-else
                    class="rounded-full bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-red-900/30 dark:hover:text-red-300 sm:text-sm"
                    @click="auth.logout()"
                >
                    {{ t('common.logout') }}
                </button>
            </div>
        </div>
    </header>
</template>
