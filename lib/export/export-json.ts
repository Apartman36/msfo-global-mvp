import type {
  AccountMapping,
  AdjustmentEntry,
  AnalyticsRatio,
  Company,
  FinancialStatementLine,
  TrialBalanceEntry,
} from "@/lib/types";

export interface ExportPayload {
  company: Company;
  trialBalance: TrialBalanceEntry[];
  mappings: AccountMapping[];
  adjustments: AdjustmentEntry[];
  statements: {
    sofp: FinancialStatementLine[];
    profitLoss: FinancialStatementLine[];
    cashFlow: FinancialStatementLine[];
  };
  analytics: AnalyticsRatio[];
  period: string;
}

export function buildJsonExport(payload: ExportPayload) {
  return JSON.stringify(
    {
      product: "MSFO.Global",
      disclaimer:
        "Учебный экспорт. Расчёты упрощены и не являются аудиторским или профессиональным IFRS-заключением.",
      ...payload,
    },
    null,
    2,
  );
}
