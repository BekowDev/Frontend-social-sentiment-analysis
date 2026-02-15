<script setup>
    import { ref, computed } from 'vue';
    import { useAuthStore } from '@/store/auth';
    import { useUiStore } from '@/store/ui';

    const auth = useAuthStore();
    const uiStore = useUiStore();

    const isProfileOpen = ref(false);
    const currentLang = ref('RU');

    // ИСПОЛЬЗУЕМ COMPUTED, ЧТОБЫ ДАННЫЕ ОБНОВЛЯЛИСЬ
    const user = computed(() => {
        // Если auth.user нет, показываем заглушку, чтобы не было ошибок
        return {
            name: auth.user?.name || 'Пользователь',
            email: auth.user?.email || 'Загрузка...',
            avatar: auth.user?.email
                ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user.email}`
                : 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
        };
    });

    const toggleLang = () => {
        currentLang.value = currentLang.value === 'RU' ? 'EN' : 'RU';
    };
</script>

<template>
    <nav
        class="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
        <div class="flex items-center gap-4">
            <button
                @click="uiStore.toggleHistory()"
                class="mr-2 p-2 text-gray-500 hover:bg-gray-100 rounded-md transition hover:text-blue-700"
                title="Открыть историю">
                <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h7"></path>
                </svg>
            </button>
            <h1
                class="text-xl font-bold text-blue-700 tracking-tight uppercase flex items-center gap-2">
                Social Analyzer
                <span
                    class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-400"
                    >v2.1</span
                >
            </h1>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
            <button
                @click="toggleLang"
                class="hidden sm:flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
                title="Сменить язык">
                <svg
                    class="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                </svg>
                <span>{{ currentLang }}</span>
            </button>

            <button
                class="relative rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <span
                    class="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                <svg
                    class="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
            </button>

            <div class="h-6 w-px bg-gray-200"></div>

            <div class="relative">
                <button
                    @click="isProfileOpen = !isProfileOpen"
                    class="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition hover:bg-gray-50">
                    <img
                        class="h-8 w-8 rounded-full bg-gray-200 border border-gray-300 object-cover"
                        :src="user.avatar"
                        alt="Avatar" />
                    <div class="hidden text-left text-sm sm:block">
                        <p class="font-bold text-gray-700 leading-none text-xs">
                            Администратор
                        </p>
                        <p class="text-xs text-gray-500 mt-0.5">Pro Plan</p>
                    </div>
                    <svg
                        class="h-4 w-4 text-gray-400 transition-transform"
                        :class="{ 'rotate-180': isProfileOpen }"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>

                <div
                    v-if="isProfileOpen"
                    class="fixed inset-0 z-40"
                    @click="isProfileOpen = false"></div>

                <transition name="fade">
                    <div
                        v-if="isProfileOpen"
                        class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div class="px-4 py-2 border-b border-gray-100">
                            <p class="text-xs text-gray-500">Аккаунт</p>
                            <p
                                class="truncate text-sm font-medium text-gray-900">
                                {{ user.email }}
                            </p>
                        </div>

                        <a
                            href="#"
                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <svg
                                class="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            Профиль
                        </a>
                        <a
                            href="#"
                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <svg
                                class="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            Настройки
                        </a>

                        <div class="border-t border-gray-100 mt-1"></div>

                        <button
                            @click="auth.logout()"
                            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-2">
                            <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                            Выйти
                        </button>
                    </div>
                </transition>
            </div>
        </div>
    </nav>
</template>

<style scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.2s;
    }
    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>
