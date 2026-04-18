import { defineStore } from 'pinia';
import api from '@/api';
import { getAnalysisTaskStatus, startAnalysis } from '@/api';
import i18n from '@/i18n';

const POLLING_INTERVAL_MS = 3000;
const PROCESSING_STATUSES = new Set(['waiting', 'processing', 'active']);

export const useAnalysisStore = defineStore('analysis', {
    state: () => ({
        results: null,
        isLoading: false,
        analysisProgress: 0,
        analysisStatus: '',
        summary: null,
        error: null,
        history: [],
        pollingTimerId: null,
        activeTaskId: null,
    }),

    actions: {
        clearPollingTimer() {
            if (this.pollingTimerId) {
                clearInterval(this.pollingTimerId);
                this.pollingTimerId = null;
            }
        },
        unwrapResponse(payload) {
            if (
                payload &&
                typeof payload === 'object' &&
                Object.prototype.hasOwnProperty.call(payload, 'data')
            ) {
                return payload.data;
            }

            return payload;
        },
        setLoadingMessageByStatus(status) {
            if (status === 'waiting') {
                this.analysisStatus = 'Задача ожидает в очереди...';
                return;
            }

            if (status === 'processing' || status === 'active') {
                this.analysisStatus = 'Идет анализ комментариев через Gemini...';
                return;
            }

            this.analysisStatus = 'Ожидание результата анализа...';
        },
        setProgressFromTaskStatus(payload) {
            const progressValue = Number(payload?.progress);
            if (Number.isFinite(progressValue)) {
                this.analysisProgress = Math.max(0, Math.min(100, progressValue));
            }

            if (payload?.message) {
                this.analysisStatus = String(payload.message);
                return;
            }

            this.setLoadingMessageByStatus(payload?.status);
        },
        buildAnalyzePayload(payload) {
            const rawUrl = payload?.url || payload?.postLink || '';
            const normalizedMode = payload?.mode === 'deep' ? 'deep' : 'fast';
            const language = String(i18n.global.locale.value || 'ru').toLowerCase();

            return {
                url: String(rawUrl).trim(),
                mode: normalizedMode,
                language,
            };
        },
        applySummaryFromResult(result) {
            const rawSummary = result?.aiSummary;
            if (!rawSummary || typeof rawSummary !== 'object') {
                this.summary = null;
                return;
            }

            this.summary = {
                content: String(rawSummary.content || '').trim(),
                keyPoints: Array.isArray(rawSummary.keyPoints)
                    ? rawSummary.keyPoints
                          .map((item) => String(item || '').trim())
                          .filter(Boolean)
                          .slice(0, 4)
                    : [],
            };
        },
        async fetchHistory() {
            const { data: response } = await api.get('/social/history');
            this.history = this.unwrapResponse(response) || [];
        },
        async loadFromHistory(id) {
            this.isLoading = true;
            try {
                const { data: response } = await api.get(`/social/history/${id}`);
                this.results = this.unwrapResponse(response) || null;
                this.applySummaryFromResult(this.results);
            } finally {
                this.isLoading = false;
            }
        },
        async fetchAnalysis(payload) {
            this.clearPollingTimer();
            this.isLoading = true;
            this.analysisProgress = 0;
            this.analysisStatus = 'Запуск анализа...';
            this.error = null;
            this.results = null;
            this.summary = null;
            this.activeTaskId = null;
            const requestPayload = this.buildAnalyzePayload(payload);

            try {
                if (!requestPayload.url) {
                    throw new Error('Введите ссылку на пост');
                }

                const { data: startResponse } = await startAnalysis(requestPayload);
                const startData = this.unwrapResponse(startResponse);
                const taskId = startData?.taskId;

                if (!taskId) {
                    throw new Error('Сервер не вернул taskId для анализа');
                }

                this.activeTaskId = taskId;
                this.setProgressFromTaskStatus(startData);

                return await new Promise((resolve, reject) => {
                    let isPollingRequestInFlight = false;

                    const pollTask = async () => {
                        if (isPollingRequestInFlight) {
                            return;
                        }

                        isPollingRequestInFlight = true;
                        try {
                            const { data: statusResponse } =
                                await getAnalysisTaskStatus(taskId);
                            const statusData = this.unwrapResponse(statusResponse);
                            const taskStatus = statusData?.status;
                            this.setProgressFromTaskStatus(statusData);

                            if (taskStatus === 'completed') {
                                this.clearPollingTimer();
                                this.results = statusData.result || null;
                                this.applySummaryFromResult(this.results);
                                this.isLoading = false;
                                this.analysisProgress = 100;
                                this.analysisStatus =
                                    statusData?.message ||
                                    'Анализ завершен. Результаты готовы.';
                                this.activeTaskId = null;
                                resolve(this.results);
                                return;
                            }

                            if (PROCESSING_STATUSES.has(taskStatus)) {
                                this.setLoadingMessageByStatus(taskStatus);
                                return;
                            }

                            if (taskStatus === 'failed') {
                                throw new Error(
                                    statusData?.message ||
                                        'Задача анализа завершилась с ошибкой',
                                );
                            }

                            this.setLoadingMessageByStatus(taskStatus);
                        } catch (e) {
                            this.clearPollingTimer();
                            this.error =
                                e.response?.data?.message ||
                                e.message ||
                                'Ошибка при получении статуса анализа';
                            this.isLoading = false;
                            this.analysisStatus = '';
                            this.activeTaskId = null;
                            reject(e);
                        } finally {
                            isPollingRequestInFlight = false;
                        }
                    };

                    this.pollingTimerId = setInterval(pollTask, POLLING_INTERVAL_MS);
                    pollTask();
                });
            } catch (e) {
                this.clearPollingTimer();
                this.error = e.response?.data?.message || e.message || 'Ошибка при анализе';
                this.isLoading = false;
                this.analysisStatus = '';
                this.activeTaskId = null;
                throw e;
            }
        },
        clearResults() {
            this.results = null;
            this.activeTaskId = null;
            this.analysisProgress = 0;
            this.analysisStatus = '';
            this.summary = null;
        },
    },
});
