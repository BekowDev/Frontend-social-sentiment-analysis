<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useI18n } from 'vue-i18n'
import { useAnalysisStore } from '@/store/analysis'
import api from '@/api'
import LanguageSelector from '@/components/LanguageSelector.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const auth = useAuthStore()
const analysisStore = useAnalysisStore()
const route = useRoute()
const { t } = useI18n()
const isProfileMenuOpen = ref(false)
const profileMenuRef = ref(null)

const navTarget = computed(() => {
    return route.name === 'History' ? { name: 'Dashboard' } : { name: 'History' }
})

const navLabel = computed(() => {
    return route.name === 'History' ? t('common.dashboard') : t('common.history')
})

const userEmail = computed(() => auth.user?.email || t('common.noEmail'))
const analysesCount = computed(() => analysisStore.history.length)

const toggleProfileMenu = async () => {
    const nextOpen = !isProfileMenuOpen.value
    isProfileMenuOpen.value = nextOpen
    if (nextOpen && auth.isLoggedIn && analysisStore.history.length === 0) {
        try {
            await analysisStore.fetchHistory()
        } catch (error) {
            console.error('Failed to fetch history count:', error)
        }
    }
}

const closeProfileMenu = () => {
    isProfileMenuOpen.value = false
}

const generateDeleteConfirmationWord = () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let value = ''
    for (let i = 0; i < 6; i += 1) {
        value += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    return value
}

const handleOutsideClick = (event) => {
    if (!profileMenuRef.value) return
    if (!profileMenuRef.value.contains(event.target)) {
        closeProfileMenu()
    }
}

const handleClearHistory = async () => {
    if (!confirm(t('common.confirmClearHistory'))) {
        return
    }
    try {
        await api.delete('/social/history')
        analysisStore.history = []
        analysisStore.results = null
        analysisStore.summary = null
        closeProfileMenu()
    } catch (error) {
        console.error('Failed to clear history:', error)
        alert(t('common.actionFailed'))
    }
}

const handleDeleteAccount = async () => {
    if (!confirm(t('common.confirmDeleteAccount'))) {
        return
    }
    const confirmationWord = generateDeleteConfirmationWord()
    const userInput = prompt(`${t('common.confirmDeleteAccountTypeWord')}\n\n${confirmationWord}`, '')
    if (userInput === null) {
        return
    }
    if (userInput.trim().toUpperCase() !== confirmationWord) {
        alert(t('common.confirmDeleteAccountTypeWordMismatch'))
        return
    }

    try {
        await api.delete('/auth/me')
        closeProfileMenu()
        auth.logout()
    } catch (error) {
        console.error('Failed to delete account:', error)
        alert(t('common.actionFailed'))
    }
}

const handleLogout = () => {
    if (!confirm(t('common.confirmLogout'))) {
        return
    }
    closeProfileMenu()
    auth.logout()
}

onMounted(() => {
    document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
    <header class="fixed inset-x-0 top-0 z-50 border-b border-gray-200/70 bg-white/90 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/90">
        <div class="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
            <RouterLink :to="{ name: 'Landing' }" class="inline-flex cursor-pointer items-center rounded-full px-2 py-1 transition hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="MoodFlow home">
                <span class="text-2xl font-black tracking-tight sm:text-[1.7rem]">
                    <span class="text-gray-900 dark:text-white">Mood</span>
                    <span class="bg-linear-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Flow</span>
                </span>
            </RouterLink>

            <div class="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                <LanguageSelector />
                <ThemeToggle />

                <RouterLink v-if="auth.isLoggedIn" :to="navTarget" class="rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 sm:text-sm">
                    {{ navLabel }}
                </RouterLink>

                <RouterLink v-if="!auth.isLoggedIn" :to="{ name: 'Login' }" class="rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 sm:text-sm">
                    {{ t('common.login') }}
                </RouterLink>

                <div v-if="auth.isLoggedIn" ref="profileMenuRef" class="relative">
                    <button class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700" @click.stop="toggleProfileMenu" aria-label="User menu">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Zm-10.5 13.5a6.75 6.75 0 0 1 13.5 0" />
                        </svg>
                    </button>

                    <div v-if="isProfileMenuOpen" class="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                            {{ userEmail }}
                        </p>
                        <p class="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{{ t('common.analysesDone') }}: {{ analysesCount }}</p>

                        <div class="mt-3 space-y-1">
                            <button class="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700" @click="handleClearHistory">
                                {{ t('common.clearHistory') }}
                            </button>
                            <button class="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30" @click="handleDeleteAccount">
                                {{ t('common.deleteAccount') }}
                            </button>
                            <button class="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700" @click="handleLogout">
                                {{ t('common.logout') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>
