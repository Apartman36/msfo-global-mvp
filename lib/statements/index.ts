import { generateCashFlow } from "@/lib/statements/cash-flow";
import { generateProfitLoss } from "@/lib/statements/profit-loss";
import { generateSofp } from "@/lib/statements/sofp";
import type {
  AccountMapping,
  AdjustmentEntry,
  FinancialStatementLine,
  TrialBalanceEntry,
} from "@/lib/types";

export interface GeneratedStatements {
  sofp: FinancialStatementLine[];
  profitLoss: FinancialStatementLine[];
  cashFlow: FinancialStatementLine[];
}

export function generateStatements(
  entries: TrialBalanceEntry[],
  mappings: AccountMapping[],
  adjustments: AdjustmentEntry[],
): GeneratedStatements {
  return {
    sofp: generateSofp(entries, mappings, adjustments),
    profitLoss: generateProfitLoss(entries, mappings, adjustments),
    cashFlow: generateCashFlow(entries, mappings, adjustments),
  };
}

export { generateSofp, generateProfitLoss, generateCashFlow };
