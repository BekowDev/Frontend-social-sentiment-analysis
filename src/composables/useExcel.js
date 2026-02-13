export function useExcel() {
    const exportToExcel = (data, fileName = 'Report') => {
        if (!data || !data.length) {
            console.warn('Нет данных для экспорта');
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Analysis Data');
        const date = new Date().toISOString().split('T')[0];
        const fullFileName = `${fileName}_${date}.xlsx`;
        XLSX.writeFile(workbook, fullFileName);
    };

    return { exportToExcel };
}
