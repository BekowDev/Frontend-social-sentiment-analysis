import { defineStore } from 'pinia';
import api from '@/api';

function parseJwtPayload(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
        return null;
    }

    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        const json = atob(padded);
        const payload = JSON.parse(json);
        return payload && typeof payload === 'object' ? payload : null;
    } catch (error) {
        return null;
    }
}

function extractUserFromToken(token) {
    const payload = parseJwtPayload(token);
    if (!payload) {
        return null;
    }

    return {
        id: payload.id || payload.userId || payload.sub || null,
        email: payload.email || null,
        role: payload.role || null,
    };
}

const persistedToken = localStorage.getItem('token') || null;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: persistedToken,
        user: extractUserFromToken(persistedToken),
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
    },

    actions: {
        setAuthToken(token) {
            this.token = token || null;
            this.user = extractUserFromToken(this.token);

            if (this.token) {
                localStorage.setItem('token', this.token);
            } else {
                localStorage.removeItem('token');
            }
        },
        async register({ name, email, password }) {
            try {
                await api.post('/auth/register', {
                    name,
                    email,
                    password,
                });
                return true;
            } catch (error) {
                console.error(
                    'Ошибка регистрации:',
                    error.response?.data?.message,
                );
                throw error;
            }
        },
        async login(email, password) {
            try {
                const { data } = await api.post('/auth/login', {
                    email,
                    password,
                });
                const token = data?.token || data?.data?.token || null;
                if (!token) {
                    throw new Error('Сервер не вернул токен авторизации');
                }
                this.setAuthToken(token);
                return true;
            } catch (error) {
                console.error('Ошибка входа:', error.response?.data?.message);
                throw error;
            }
        },

        logout() {
            this.setAuthToken(null);
            location.reload();
        },
    },
});
