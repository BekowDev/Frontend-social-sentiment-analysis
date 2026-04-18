import { createI18n } from 'vue-i18n';
import ru from '@/locales/ru.json';
import en from '@/locales/en.json';
import kk from '@/locales/kk.json';

const LOCALE_STORAGE_KEY = 'moodscope-locale';
const SUPPORTED_LOCALES = ['ru', 'en', 'kk'];

function detectInitialLocale() {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.includes(saved)) {
        return saved;
    }

    const browserLocale = navigator.language?.slice(0, 2)?.toLowerCase();
    if (browserLocale && SUPPORTED_LOCALES.includes(browserLocale)) {
        return browserLocale;
    }

    return 'ru';
}

export const i18n = createI18n({
    legacy: false,
    locale: detectInitialLocale(),
    fallbackLocale: 'ru',
    messages: { ru, en, kk },
});

export function setAppLocale(locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) {
        return;
    }

    i18n.global.locale.value = locale;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export default i18n;
