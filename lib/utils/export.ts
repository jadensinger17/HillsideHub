import * as XLSX from "xlsx";

/**
 * Triggers a browser download of an Excel (.xlsx) file built from the given headers and rows.
 */
export function downloadExcel(headers: string[], rows: string[][], filename: string): void {
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-size columns based on max content width
  const colWidths = headers.map((h, col) => {
    const maxLen = wsData.reduce((max, row) => {
      const cell = row[col] ?? "";
      return Math.max(max, cell.length);
    }, h.length);
    return { wch: Math.min(maxLen + 2, 60) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, filename);
}
