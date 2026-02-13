<script setup>
    import { ref } from 'vue';
    import { useAuthStore } from '@/store/auth';
    import { useRouter } from 'vue-router';

    const email = ref('');
    const password = ref('');
    const auth = useAuthStore();
    const router = useRouter();
    const isLoading = ref(false);

    const handleLogin = async () => {
        isLoading.value = true;
        try {
            await auth.login(email.value, password.value);
            router.push('/');
        } catch (e) {
            alert(
                'Ошибка: ' + (e.response?.data?.message || 'Не удалось войти')
            );
        } finally {
            isLoading.value = false;
        }
    };
</script>

<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div
            class="bg-white p-10 shadow-2xl w-full max-w-md border-t-4 border-blue-600 rounded-none relative">
            <div class="mb-8 text-center">
                <h1
                    class="text-2xl font-black mb-2 text-gray-800 uppercase tracking-tighter">
                    Вход в систему
                </h1>
                <p
                    class="text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Social Analyzer v2.0
                </p>
            </div>

            <form
                @submit.prevent="handleLogin"
                class="space-y-6">
                <div class="group">
                    <label
                        class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 group-focus-within:text-blue-600 transition-colors">
                        Email
                    </label>
                    <input
                        v-model="email"
                        type="email"
                        placeholder="user@example.com"
                        class="w-full p-3 bg-gray-50 border border-gray-300 rounded-none text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all"
                        required />
                </div>

                <div class="group">
                    <label
                        class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 group-focus-within:text-blue-600 transition-colors">
                        Пароль
                    </label>
                    <input
                        v-model="password"
                        type="password"
                        placeholder="••••••••"
                        class="w-full p-3 bg-gray-50 border border-gray-300 rounded-none text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all"
                        required />
                </div>

                <button
                    type="submit"
                    :disabled="isLoading"
                    class="w-full mt-4 bg-blue-600 text-white p-3 rounded-none font-bold uppercase tracking-widest shadow-md hover:bg-blue-700 hover:shadow-lg active:translate-y-px transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                    {{ isLoading ? 'Вход...' : 'Войти' }}
                </button>
            </form>

            <div
                class="absolute top-0 right-0 w-4 h-4 bg-blue-600 triangle"></div>
        </div>
    </div>
</template>

<style scoped>
    /* Дополнительный стиль, если хочется сделать треугольник в углу css-ом,
   но border-t-4 уже делает хороший акцент */
</style>
