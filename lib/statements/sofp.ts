import { ifrsLines } from "@/lib/fixtures/ifrs-lines";
import { groupAccountsByIfrsLine, statementLineFromMapping } from "@/lib/mapping/mapping-engine";
import { calculateAdjustmentImpact } from "@/lib/statements/adjustment-impact";
import type {
  AccountMapping,
  AdjustmentEntry,
  FinancialStatementLine,
  TrialBalanceEntry,
} from "@/lib/types";

export function generateSofp(
  entries: TrialBalanceEntry[],
  mappings: AccountMapping[],
  adjustments: AdjustmentEntry[],
): FinancialStatementLine[] {
  const grouped = groupAccountsByIfrsLine(entries, mappings);
  const impact = calculateAdjustmentImpact(adjustments);
  const statementLines = ifrsLines
    .filter((line) => line.statement === "SOFP")
    .map((line) => statementLineFromMapping(line, grouped.get(line.code) ?? 0, impact.get(line.code) ?? 0));

  const assets = statementLines
    .filter((line) => line.section === "Активы")
    .reduce((sum, line) => sum + line.amountIfrs, 0);
  const liabilitiesAndEquity = statementLines
    .filter((line) => line.section !== "Активы")
    .reduce((sum, line) => sum + line.amountIfrs, 0);
  const balancingGap = assets - liabilitiesAndEquity;

  return statementLines.map((line) => {
    if (line.code !== "SOFP_RETAINED_EARNINGS" || Math.abs(balancingGap) < 1) {
      return line;
    }

    return {
      ...line,
      adjustmentAmount: line.adjustmentAmount + balancingGap,
      amountIfrs: line.amountIfrs + balancingGap,
      name: `${line.name} (включая балансирующий результат)`,
    };
  });
}
