/**
 * Хук для подсветки текста при поиске
 */
export function useHighlight() {
    const highlightText = (text, query) => {
        // Если запроса нет или он пустой, возвращаем оригинальный текст
        if (!query) return text;

        // Экранируем спецсимволы (например, если пользователь ищет "?"),
        // чтобы регулярное выражение не сломалось
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Создаем регулярку: 'gi' значит глобально (все вхождения) и без учета регистра
        const regex = new RegExp(`(${escapedQuery})`, 'gi');

        // Оборачиваем найденное в тег <mark> с классами Tailwind
        return text.replace(
            regex,
            '<mark class="bg-yellow-200 px-0.5 rounded text-black font-semibold">$1</mark>',
        );
    };

    return { highlightText };
}
