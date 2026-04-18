const THEME_STORAGE_KEY = 'moodscope-theme';

function isDarkPreferred() {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

export function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

export function getInitialTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
        return saved;
    }
    return isDarkPreferred() ? 'dark' : 'light';
}

export function initTheme() {
    const theme = getInitialTheme();
    applyTheme(theme);
    return theme;
}

export function setTheme(theme) {
    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem(THEME_STORAGE_KEY, safeTheme);
    applyTheme(safeTheme);
    return safeTheme;
}
