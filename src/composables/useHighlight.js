export function useHighlight() {
    const highlightTextParts = (text, query) => {
        const safeText = String(text || '');
        const safeQuery = String(query || '').trim();
        if (!safeQuery) {
            return [{ value: safeText, matched: false }];
        }

        const escapedQuery = safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        const parts = safeText.split(regex);
        return parts
            .filter((part) => part.length > 0)
            .map((part) => ({
                value: part,
                matched: part.toLowerCase() === safeQuery.toLowerCase(),
            }));
    };

    return { highlightTextParts };
}
