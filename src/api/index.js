import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    timeout: 300000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const startAnalysis = (payload) => api.post('/social/analyze', payload);

export const getAnalysisTaskStatus = (taskId) =>
    api.get(`/social/task/${taskId}`);

export const checkTaskStatus = getAnalysisTaskStatus;

export default api;
