import axios from "axios";

function normalizeBaseUrl(rawBaseUrl) {
    const fallback = "http://localhost:5001/api";
    const value = String(rawBaseUrl || "").trim();
    if (!value) {
        return fallback;
    }
    return value.replace(/\/+$/, "");
}

function parseTimeoutMs(rawTimeout) {
    const fallback = 60000;
    const parsed = Number.parseInt(String(rawTimeout || ""), 10);
    if (!Number.isFinite(parsed) || parsed < 1000) {
        return fallback;
    }
    return parsed;
}

const api = axios.create({
    baseURL: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
    timeout: parseTimeoutMs(import.meta.env.VITE_API_TIMEOUT_MS),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const startAnalysis = (payload) => api.post("/social/analyze", payload);

export const getAnalysisTaskStatus = (taskId) =>
    api.get(`/social/task/${taskId}`);

export const checkTaskStatus = getAnalysisTaskStatus;

export default api;
