import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api', // Адрес твоего Node.js сервера
    timeout: 300000, // <--- ПОСТАВЬ 300000 (это 5 минут). По дефолту там часто 10 сек.
});

// Автоматически добавляем JWT токен в заголовки
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
