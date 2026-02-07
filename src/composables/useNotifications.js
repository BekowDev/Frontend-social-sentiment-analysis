import { ref } from 'vue';

// Создаем состояние ВНЕ функции, чтобы оно было общим для всего приложения (Singleton)
const toast = ref({
    show: false,
    message: '',
    type: 'info', // 'success', 'error', 'info'
});

let timeoutId = null;

export function useNotifications() {
    const showNotify = (message, type = 'info') => {
        // Если есть активный таймер скрытия, сбрасываем его
        if (timeoutId) clearTimeout(timeoutId);

        // Обновляем состояние
        toast.value = {
            show: true,
            message,
            type,
        };

        // Автоматически скрываем через 3 секунды
        timeoutId = setTimeout(() => {
            closeNotify();
        }, 3000);
    };

    const closeNotify = () => {
        toast.value.show = false;
    };

    // Возвращаем само состояние (для отображения в App.vue) и функции управления
    return {
        toast,
        showNotify,
        closeNotify,
    };
}
