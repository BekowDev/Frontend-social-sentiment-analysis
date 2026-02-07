import * as XLSX from 'xlsx';

/**
 * Хук для экспорта данных в Excel
 */
export function useExcel() {
    const exportToExcel = (data, fileName = 'Report') => {
        if (!data || !data.length) {
            console.warn('Нет данных для экспорта');
            return;
        }

        // 1. Создаем рабочий лист из JSON
        const worksheet = XLSX.utils.json_to_sheet(data);

        // 2. Создаем новую книгу
        const workbook = XLSX.utils.book_new();

        // 3. Добавляем лист в книгу
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Analysis Data');

        // 4. Генерируем имя файла с текущей датой
        const date = new Date().toISOString().split('T')[0]; // 2023-10-25
        const fullFileName = `${fileName}_${date}.xlsx`;

        // 5. Скачиваем файл
        XLSX.writeFile(workbook, fullFileName);
    };

    return { exportToExcel };
}
