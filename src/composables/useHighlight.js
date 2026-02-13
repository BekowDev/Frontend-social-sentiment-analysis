export function useHighlight() {
    const highlightText = (text, query) => {
        if (!query) return text;

        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const regex = new RegExp(`(${escapedQuery})`, 'gi');

        return text.replace(
            regex,
            '<mark class="bg-yellow-200 px-0.5 rounded text-black font-semibold">$1</mark>'
        );
    };

    return { highlightText };
}
