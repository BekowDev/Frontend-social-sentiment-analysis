<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "vue-router";

const isLoginMode = ref(true);
const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const auth = useAuthStore();
const router = useRouter();
const isLoading = ref(false);
const { t } = useI18n();

const toggleMode = () => {
    isLoginMode.value = !isLoginMode.value;
};

const handleAuth = async () => {
    isLoading.value = true;
    try {
        if (isLoginMode.value) {
            await auth.login(email.value, password.value);
        } else {
            if (password.value !== confirmPassword.value) {
                throw new Error(t("login.passwordMismatch"));
            }
            await auth.register({
                name: name.value,
                email: email.value,
                password: password.value,
            });
            alert(t("login.registerSuccess"));
            isLoginMode.value = true;
            password.value = "";
            confirmPassword.value = "";
            isLoading.value = false;
            return;
        }
        router.push({ name: "Dashboard" });
    } catch (e) {
        const fallback = isLoginMode.value
            ? t("login.error")
            : t("login.errorRegister");
        alert(fallback + ": " + (e.response?.data?.message || e.message || ""));
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div
        class="min-h-screen bg-white font-sans text-gray-900 dark:bg-gray-900 dark:text-white"
    >
        <div class="flex min-h-screen items-center justify-center px-6 pb-10">
            <div
                class="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg shadow-gray-200/60 dark:bg-gray-800 dark:shadow-black/35"
            >
                <RouterLink
                    :to="{ name: 'Landing' }"
                    class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300"
                >
                    <span aria-hidden="true">←</span>
                    <span>{{ t("login.backHome") }}</span>
                </RouterLink>

                <div class="mb-8 text-center">
                    <h1
                        class="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white"
                    >
                        {{ t("login.title") }}
                    </h1>
                    <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {{
                            isLoginMode
                                ? t("login.subtitle")
                                : t("login.subtitleRegister")
                        }}
                    </p>
                </div>

                <form @submit.prevent="handleAuth" class="space-y-4">
                    <div v-if="!isLoginMode" class="space-y-2">
                        <label
                            class="text-xs font-medium text-gray-500 dark:text-gray-400"
                        >
                            {{ t("login.name") }}
                        </label>
                        <input
                            v-model="name"
                            type="text"
                            :placeholder="t('login.namePlaceholder')"
                            class="w-full rounded-full bg-gray-50 px-5 py-3 text-gray-900 outline-none transition focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] dark:bg-gray-700 dark:text-white dark:focus:bg-gray-600 dark:focus:shadow-[0_0_0_4px_rgba(96,165,250,0.2)]"
                            required
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="text-xs font-medium text-gray-500 dark:text-gray-400"
                        >
                            {{ t("login.email") }}
                        </label>
                        <input
                            v-model="email"
                            type="email"
                            :placeholder="t('login.emailPlaceholder')"
                            class="w-full rounded-full bg-gray-50 px-5 py-3 text-gray-900 outline-none transition focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] dark:bg-gray-700 dark:text-white dark:focus:bg-gray-600 dark:focus:shadow-[0_0_0_4px_rgba(96,165,250,0.2)]"
                            required
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="text-xs font-medium text-gray-500 dark:text-gray-400"
                        >
                            {{ t("login.password") }}
                        </label>
                        <input
                            v-model="password"
                            type="password"
                            :placeholder="t('login.passwordPlaceholder')"
                            class="w-full rounded-full bg-gray-50 px-5 py-3 text-gray-900 outline-none transition focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] dark:bg-gray-700 dark:text-white dark:focus:bg-gray-600 dark:focus:shadow-[0_0_0_4px_rgba(96,165,250,0.2)]"
                            required
                        />
                    </div>

                    <div v-if="!isLoginMode" class="space-y-2">
                        <label
                            class="text-xs font-medium text-gray-500 dark:text-gray-400"
                        >
                            {{ t("login.confirmPassword") }}
                        </label>
                        <input
                            v-model="confirmPassword"
                            type="password"
                            :placeholder="t('login.confirmPasswordPlaceholder')"
                            class="w-full rounded-full bg-gray-50 px-5 py-3 text-gray-900 outline-none transition focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] dark:bg-gray-700 dark:text-white dark:focus:bg-gray-600 dark:focus:shadow-[0_0_0_4px_rgba(96,165,250,0.2)]"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="mt-3 w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
                    >
                        {{
                            isLoading
                                ? isLoginMode
                                    ? t("login.loading")
                                    : t("login.loadingRegister")
                                : isLoginMode
                                  ? t("login.submit")
                                  : t("login.submitRegister")
                        }}
                    </button>
                </form>

                <button
                    type="button"
                    @click="toggleMode"
                    class="mt-4 w-full text-center text-sm text-blue-600 transition hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                >
                    {{
                        isLoginMode
                            ? t("login.switchToRegister")
                            : t("login.switchToLogin")
                    }}
                </button>
            </div>
        </div>
    </div>
</template>
