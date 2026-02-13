import { ref } from 'vue';

const toast = ref({
    show: false,
    message: '',
    type: 'info',
});

let timeoutId = null;

export function useNotifications() {
    const showNotify = (message, type = 'info') => {
        if (timeoutId) clearTimeout(timeoutId);
        toast.value = {
            show: true,
            message,
            type,
        };

        timeoutId = setTimeout(() => {
            closeNotify();
        }, 3000);
    };

    const closeNotify = () => {
        toast.value.show = false;
    };

    return {
        toast,
        showNotify,
        closeNotify,
    };
}
