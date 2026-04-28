import { defineStore } from "pinia";
import api from "@/api";
import { getAnalysisTaskStatus, startAnalysis } from "@/api";
import i18n from "@/i18n";

const POLLING_INTERVAL_MS = 3000;
const PROCESSING_STATUSES = new Set(["waiting", "processing", "active"]);

export const useAnalysisStore = defineStore("analysis", {
    state: () => ({
        results: null,
        isLoading: false,
        analysisProgress: 0,
        analysisStatus: "",
        summary: null,
        error: null,
        history: [],
        pollingTimerId: null,
        activeTaskId: null,
    }),

    actions: {
        resetAnalysisState() {
            this.results = null;
            this.summary = null;
            this.error = null;
            this.activeTaskId = null;
            this.analysisProgress = 0;
            this.analysisStatus = "";
        },
        clearPollingTimer() {
            if (this.pollingTimerId) {
                clearInterval(this.pollingTimerId);
                this.pollingTimerId = null;
            }
        },
        unwrapResponse(payload) {
            if (
                payload &&
                typeof payload === "object" &&
                Object.prototype.hasOwnProperty.call(payload, "data")
            ) {
                return payload.data;
            }

            return payload;
        },
        setLoadingMessageByStatus(status) {
            if (status === "waiting") {
                this.analysisStatus = "Задача ожидает в очереди...";
                return;
            }

            if (status === "processing" || status === "active") {
                this.analysisStatus =
                    "Идет анализ комментариев через Gemini...";
                return;
            }

            this.analysisStatus = "Ожидание результата анализа...";
        },
        setProgressFromTaskStatus(payload) {
            const progressValue = Number(payload?.progress);
            if (Number.isFinite(progressValue)) {
                this.analysisProgress = Math.max(
                    0,
                    Math.min(100, progressValue),
                );
            }

            if (payload?.message) {
                this.analysisStatus = String(payload.message);
                return;
            }

            this.setLoadingMessageByStatus(payload?.status);
        },
        buildAnalyzePayload(payload) {
            const rawUrl = payload?.url || payload?.postLink || "";
            const normalizedMode = payload?.mode === "deep" ? "deep" : "fast";
            const language = String(
                i18n.global.locale.value || "ru",
            ).toLowerCase();

            return {
                url: String(rawUrl).trim(),
                mode: normalizedMode,
                language,
            };
        },
        applySummaryFromResult(result) {
            const rawSummary = result?.aiSummary;
            if (!rawSummary || typeof rawSummary !== "object") {
                this.summary = null;
                return;
            }

            this.summary = {
                content: String(rawSummary.content || "").trim(),
                keyPoints: Array.isArray(rawSummary.keyPoints)
                    ? rawSummary.keyPoints
                          .map((item) => String(item || "").trim())
                          .filter(Boolean)
                          .slice(0, 4)
                    : [],
            };
        },
        normalizeCommentDate(value) {
            if (value == null || value === "") {
                return new Date().toISOString();
            }

            if (typeof value === "number") {
                const ts = value < 10000000000 ? value * 1000 : value;
                const parsed = new Date(ts);
                return Number.isNaN(parsed.getTime())
                    ? new Date().toISOString()
                    : parsed.toISOString();
            }

            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime())
                ? new Date().toISOString()
                : parsed.toISOString();
        },
        normalizeResult(result) {
            if (!result || typeof result !== "object") {
                return null;
            }

            const statsSource = result.stats || result.sentiment_stats || {};
            const commentsSource = Array.isArray(result.comments)
                ? result.comments
                : [];
            const normalizedComments = commentsSource.map((comment, index) => {
                const source =
                    comment && typeof comment === "object" ? comment : {};
                const text = String(source.text || source.content || "").trim();
                return {
                    ...source,
                    comment_id: String(source.comment_id || `comment-${index}`),
                    author_name: String(source.author_name || "Unknown"),
                    text,
                    content: text,
                    date: this.normalizeCommentDate(source.date),
                };
            });
            const buildStatsFromComments = (comments) => {
                const stats = {
                    total: comments.length,
                    positive: 0,
                    negative: 0,
                    neutral: 0,
                    toxic: 0,
                };

                comments.forEach((comment) => {
                    const sentiment = String(
                        comment?.analysis?.sentiment || "",
                    ).toLowerCase();
                    if (sentiment === "positive") stats.positive += 1;
                    if (sentiment === "negative") stats.negative += 1;
                    if (sentiment === "neutral") stats.neutral += 1;
                    if (comment?.analysis?.is_toxic === true) stats.toxic += 1;
                });

                return stats;
            };
            const statsFromPayload = {
                total: Number(statsSource.total) || 0,
                positive: Number(statsSource.positive) || 0,
                negative: Number(statsSource.negative) || 0,
                neutral: Number(statsSource.neutral) || 0,
                toxic: Number(statsSource.toxic) || 0,
            };
            const statsAreEmpty = Object.values(statsFromPayload).every(
                (value) => Number(value) === 0,
            );
            const normalizedStats = statsAreEmpty
                ? buildStatsFromComments(normalizedComments)
                : statsFromPayload;

            const aiSummary =
                result.aiSummary && typeof result.aiSummary === "object"
                    ? {
                          content: String(
                              result.aiSummary.content || "",
                          ).trim(),
                          keyPoints: Array.isArray(result.aiSummary.keyPoints)
                              ? result.aiSummary.keyPoints
                                    .map((item) => String(item || "").trim())
                                    .filter(Boolean)
                              : [],
                      }
                    : null;
            const normalizedAiSummary =
                aiSummary &&
                (aiSummary.content || aiSummary.keyPoints.length > 0)
                    ? aiSummary
                    : null;

            return {
                ...result,
                stats: normalizedStats,
                sentiment_stats: normalizedStats,
                comments: normalizedComments,
                aiSummary: normalizedAiSummary,
            };
        },
        async fetchHistory() {
            const { data: response } = await api.get("/social/history");
            this.history = this.unwrapResponse(response) || [];
        },
        async loadFromHistory(id) {
            this.isLoading = true;
            try {
                const { data: response } = await api.get(
                    `/social/history/${id}`,
                );
                this.results = this.normalizeResult(
                    this.unwrapResponse(response),
                );
                this.applySummaryFromResult(this.results);
            } finally {
                this.isLoading = false;
            }
        },
        async fetchAnalysis(payload) {
            this.clearPollingTimer();
            this.isLoading = true;
            this.resetAnalysisState();
            this.analysisStatus = "Запуск анализа...";
            const requestPayload = this.buildAnalyzePayload(payload);

            try {
                if (!requestPayload.url) {
                    throw new Error("Введите ссылку на пост");
                }

                const { data: startResponse } =
                    await startAnalysis(requestPayload);
                const startData = this.unwrapResponse(startResponse);
                const taskId = startData?.taskId;

                if (!taskId) {
                    throw new Error("Сервер не вернул taskId для анализа");
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
                            const statusData =
                                this.unwrapResponse(statusResponse);
                            const taskStatus = statusData?.status;
                            this.setProgressFromTaskStatus(statusData);

                            if (taskStatus === "completed") {
                                this.clearPollingTimer();
                                this.results = this.normalizeResult(
                                    statusData.result,
                                );
                                this.applySummaryFromResult(this.results);
                                this.isLoading = false;
                                this.analysisProgress = 100;
                                this.analysisStatus =
                                    statusData?.message ||
                                    "Анализ завершен. Результаты готовы.";
                                this.activeTaskId = null;
                                resolve(this.results);
                                return;
                            }

                            if (PROCESSING_STATUSES.has(taskStatus)) {
                                this.setLoadingMessageByStatus(taskStatus);
                                return;
                            }

                            if (taskStatus === "failed") {
                                throw new Error(
                                    statusData?.message ||
                                        "Задача анализа завершилась с ошибкой",
                                );
                            }

                            this.setLoadingMessageByStatus(taskStatus);
                        } catch (e) {
                            this.clearPollingTimer();
                            this.error =
                                e.response?.data?.message ||
                                e.message ||
                                "Ошибка при получении статуса анализа";
                            this.isLoading = false;
                            this.analysisStatus = "";
                            this.activeTaskId = null;
                            reject(e);
                        } finally {
                            isPollingRequestInFlight = false;
                        }
                    };

                    this.pollingTimerId = setInterval(
                        pollTask,
                        POLLING_INTERVAL_MS,
                    );
                    pollTask();
                });
            } catch (e) {
                this.clearPollingTimer();
                this.error =
                    e.response?.data?.message ||
                    e.message ||
                    "Ошибка при анализе";
                this.isLoading = false;
                this.analysisStatus = "";
                this.activeTaskId = null;
                throw e;
            }
        },
        clearResults() {
            this.resetAnalysisState();
        },
    },
});
