import { ifrsLineByCode, ifrsLines } from "@/lib/fixtures/ifrs-lines";
import { groupAccountsByIfrsLine, statementLineFromMapping } from "@/lib/mapping/mapping-engine";
import { calculateAdjustmentImpact } from "@/lib/statements/adjustment-impact";
import type {
  AccountMapping,
  AdjustmentEntry,
  FinancialStatementLine,
  TrialBalanceEntry,
} from "@/lib/types";

const baseCodes = [
  "PL_REVENUE",
  "PL_COST_OF_SALES",
  "PL_SELLING_EXPENSES",
  "PL_ADMIN_EXPENSES",
  "PL_DEPRECIATION",
  "PL_IMPAIRMENT",
  "PL_ECL",
  "PL_FINANCE_COSTS",
  "PL_FX",
  "PL_TAX",
];

function value(lines: FinancialStatementLine[], code: string, field: keyof FinancialStatementLine) {
  const found = lines.find((line) => line.code === code);
  const raw = found?.[field];
  return typeof raw === "number" ? raw : 0;
}

function computedLine(
  code: string,
  amountLocal: number,
  amountIfrs: number,
): FinancialStatementLine {
  const line = ifrsLineByCode[code];
  return {
    code,
    name: line.nameRu,
    amountLocal,
    adjustmentAmount: amountIfrs - amountLocal,
    amountIfrs,
    section: line.section,
    statement: "PL",
  };
}

export function generateProfitLoss(
  entries: TrialBalanceEntry[],
  mappings: AccountMapping[],
  adjustments: AdjustmentEntry[],
): FinancialStatementLine[] {
  const grouped = groupAccountsByIfrsLine(entries, mappings);
  const impact = calculateAdjustmentImpact(adjustments);
  const lines = ifrsLines
    .filter((line) => line.statement === "PL" && baseCodes.includes(line.code))
    .map((line) => statementLineFromMapping(line, grouped.get(line.code) ?? 0, impact.get(line.code) ?? 0));

  const localGross = value(lines, "PL_REVENUE", "amountLocal") - value(lines, "PL_COST_OF_SALES", "amountLocal");
  const ifrsGross = value(lines, "PL_REVENUE", "amountIfrs") - value(lines, "PL_COST_OF_SALES", "amountIfrs");

  const expenseCodes = baseCodes.filter((code) => code !== "PL_REVENUE" && code !== "PL_COST_OF_SALES");
  const localNet =
    localGross -
    expenseCodes.reduce((sum, code) => sum + value(lines, code, "amountLocal"), 0);
  const ifrsNet =
    ifrsGross - expenseCodes.reduce((sum, code) => sum + value(lines, code, "amountIfrs"), 0);

  return [
    ...lines.slice(0, 2),
    computedLine("PL_GROSS_PROFIT", localGross, ifrsGross),
    ...lines.slice(2),
    computedLine("PL_NET_PROFIT", localNet, ifrsNet),
  ].sort((a, b) => ifrsLineByCode[a.code].sortOrder - ifrsLineByCode[b.code].sortOrder);
}
