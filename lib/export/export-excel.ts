import * as XLSX from "xlsx";
import type { ExportPayload } from "@/lib/export/export-json";

function sheetRows(payload: ExportPayload) {
  return {
    "SOFP": payload.statements.sofp,
    "P&L": payload.statements.profitLoss,
    "Cash Flow": payload.statements.cashFlow,
    "Adjustments": payload.adjustments.map((adjustment) => ({
      standard: adjustment.standard,
      title: adjustment.title,
      debitLine: adjustment.debitLine,
      creditLine: adjustment.creditLine,
      amount: adjustment.amount,
      currency: adjustment.currency,
      explanation: adjustment.explanation,
    })),
    "Trial Balance": payload.trialBalance,
  };
}

export function exportExcel(payload: ExportPayload, filename: string) {
  const workbook = XLSX.utils.book_new();
  const rows = sheetRows(payload);

  for (const [sheetName, data] of Object.entries(rows)) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  }

  XLSX.writeFile(workbook, filename);
}
