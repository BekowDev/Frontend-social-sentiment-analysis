import { defineStore } from 'pinia';
import api from '@/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: null,
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
    },

    actions: {
        async login(email, password) {
            try {
                const { data } = await api.post('/auth/login', {
                    email,
                    password,
                });
                this.token = data.token;
                localStorage.setItem('token', data.token);
                return true;
            } catch (error) {
                console.error('Ошибка входа:', error.response?.data?.message);
                throw error;
            }
        },

        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            location.reload();
        },
    },
});
