import axios from "axios";
import {
    MOCK_DELAY_MS,
    MOCK_DEMO_URL,
    createDemoAuthToken,
    getMockAnalysisResult,
    getMockHistory,
    getMockTaskId,
    isMockEnabled,
} from "@/mocks/mockSentiment";

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

function delay(ms = MOCK_DELAY_MS) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function wrapData(data) {
    return { data };
}

function getRequestPath(config) {
    const rawUrl = String(config?.url || "");
    try {
        return new URL(rawUrl, "http://localhost").pathname;
    } catch {
        return rawUrl;
    }
}

let lastMockAnalyzeUrl = MOCK_DEMO_URL;

async function mockAdapter(config) {
    await delay(MOCK_DELAY_MS);

    const method = String(config?.method || "get").toLowerCase();
    const path = getRequestPath(config);
    const body =
        typeof config?.data === "string"
            ? JSON.parse(config.data || "{}")
            : config?.data || {};

    if (method === "post" && path.includes("/auth/register")) {
        return {
            data: wrapData({ ok: true }),
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
        };
    }

    if (method === "post" && path.includes("/auth/login")) {
        return {
            data: { token: createDemoAuthToken() },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
        };
    }

    if (method === "delete" && path.includes("/auth/me")) {
        return {
            data: wrapData({ ok: true }),
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
        };
    }

    if (method === "post" && path.includes("/social/analyze")) {
        lastMockAnalyzeUrl = String(body.url || MOCK_DEMO_URL).trim() || MOCK_DEMO_URL;
        return {
            data: wrapData({
                taskId: getMockTaskId(),
                status: "processing",
                progress: 42,
                message: "Generating live demo analysis...",
                url: lastMockAnalyzeUrl,
            }),
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
        };
    }

    if (method === "get" && /\/social\/task\//.test(path)) {
        return {
            data: wrapData({
                taskId: getMockTaskId(),
                status: "completed",
                progress: 100,
                message: "Demo analysis complete.",
                result: getMockAnalysisResult(lastMockAnalyzeUrl),
            }),
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
        };
    }

    if (method === "get" && /\/social\/history\/[^/]+$/.test(path)) {
        const historyId = path.split("/").pop();
        const historyItem = getMockHistory().find((item) => item._id === historyId);
        return {
            data: wrapData(
                getMockAnalysisResult(historyItem?.postLink || MOCK_DEMO_URL),
            ),
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
        };
    }

    if (method === "get" && path.includes("/social/history")) {
        return {
            data: wrapData(getMockHistory()),
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
        };
    }

    if (method === "delete" && path.includes("/social/history")) {
        return {
            data: wrapData({ ok: true }),
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
        };
    }

    return {
        data: wrapData({}),
        status: 200,
        statusText: "OK",
        headers: {},
        config,
        request: {},
    };
}

const api = axios.create({
    baseURL: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
    timeout: parseTimeoutMs(import.meta.env.VITE_API_TIMEOUT_MS),
    ...(isMockEnabled() ? { adapter: mockAdapter } : {}),
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

export { isMockEnabled };
export default api;
