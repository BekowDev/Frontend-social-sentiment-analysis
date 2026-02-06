<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const auth = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
    try {
        await auth.login(email.value, password.value)
        router.push('/')
    } catch (e) {
        alert('Ошибка: ' + (e.response?.data?.message || 'Не удалось войти'))
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-lg w-96">
            <h1 class="text-2xl font-bold mb-6 text-center text-blue-600">
                Вход в систему
            </h1>
            <form @submit.prevent="handleLogin">
                <input
                    v-model="email"
                    type="email"
                    placeholder="Email"
                    class="w-full p-2 mb-4 border rounded"
                    required
                />
                <input
                    v-model="password"
                    type="password"
                    placeholder="Пароль"
                    class="w-full p-2 mb-6 border rounded"
                    required
                />
                <button
                    type="submit"
                    class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                >
                    Войти
                </button>
            </form>
        </div>
    </div>
</template>
