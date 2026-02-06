<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const email = ref('')
const password = ref('')
const router = useRouter()

const handleRegister = async () => {
    try {
        await api.post('/auth/register', {
            email: email.value,
            password: password.value,
        })
        alert('Регистрация успешна! Теперь войдите.')
        router.push('/login')
    } catch (e) {
        alert(e.response?.data?.message || 'Ошибка регистрации')
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-lg w-96">
            <h1 class="text-2xl font-bold mb-6 text-center text-green-600">
                Регистрация
            </h1>
            <form @submit.prevent="handleRegister">
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
                    class="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                    Создать аккаунт
                </button>
                <p class="mt-4 text-center text-sm">
                    Уже есть аккаунт?
                    <router-link to="/login" class="text-blue-500"
                        >Войти</router-link
                    >
                </p>
            </form>
        </div>
    </div>
</template>
