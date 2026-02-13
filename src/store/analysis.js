import { defineStore } from 'pinia';
import api from '@/api';

export const useAnalysisStore = defineStore('analysis', {
    state: () => ({
        results: null,
        isLoading: false,
        error: null,
        history: [],
    }),

    actions: {
        async fetchHistory() {
            const { data } = await api.get('/social/history');
            this.history = data;
        },
        async loadFromHistory(id) {
            this.isLoading = true;
            try {
                const { data } = await api.get(`/social/history/${id}`);
                this.results = data;
            } finally {
                this.isLoading = false;
            }
        },
        async fetchAnalysis(payload) {
            this.isLoading = true;
            this.error = null;
            try {
                const { data } = await api.post('/social/analyze', payload);
                this.results = data;
                return data;
            } catch (e) {
                this.error = e.response?.data?.message || 'Ошибка при анализе';
                alert(this.error);
            } finally {
                this.isLoading = false;
            }
        },
        clearResults() {
            this.results = null;
        },
    },
});
