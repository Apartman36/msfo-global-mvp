import { calculateIfrs15Adjustments } from "@/lib/ifrs/ifrs15";
import { calculateIfrs16Adjustments, calculateLeasePresentValue, defaultIfrs16Input } from "@/lib/ifrs/ifrs16";
import { calculateIfrs9Adjustments } from "@/lib/ifrs/ifrs9";
import { calculateIas12Adjustments } from "@/lib/ifrs/ias12";
import { calculateIas16Adjustments } from "@/lib/ifrs/ias16";
import { calculateIas21Adjustments } from "@/lib/ifrs/ias21";
import { calculateIas36Adjustments } from "@/lib/ifrs/ias36";
import type { AdjustmentEntry, Company, TrialBalanceEntry } from "@/lib/types";

function accountAmount(entries: TrialBalanceEntry[], predicate: (entry: TrialBalanceEntry) => boolean) {
  return entries
    .filter(predicate)
    .reduce((total, entry) => total + Math.max(0, entry.debit - entry.credit), 0);
}

function creditAmount(entries: TrialBalanceEntry[], predicate: (entry: TrialBalanceEntry) => boolean) {
  return entries
    .filter(predicate)
    .reduce((total, entry) => total + Math.max(0, entry.credit - entry.debit), 0);
}

export function applySimplifiedIfrsRules(
  company: Company,
  entries: TrialBalanceEntry[],
): AdjustmentEntry[] {
  const receivables = accountAmount(entries, (entry) =>
    ["62", "AR-100"].includes(entry.accountCode),
  );
  const ppeGross = accountAmount(entries, (entry) =>
    ["01", "PPE-100"].includes(entry.accountCode),
  );
  const accumulatedDepreciation = creditAmount(entries, (entry) =>
    ["02", "PPE-190"].includes(entry.accountCode),
  );
  const revenue = creditAmount(entries, (entry) => entry.accountType === "income");
  const leaseTemporaryDifference = calculateLeasePresentValue(defaultIfrs16Input(company));

  return [
    ...calculateIfrs16Adjustments(company),
    ...calculateIfrs9Adjustments(company, receivables),
    ...calculateIas16Adjustments(company, ppeGross, accumulatedDepreciation),
    ...calculateIas21Adjustments(company),
    ...calculateIas36Adjustments(company),
    ...calculateIas12Adjustments(company, leaseTemporaryDifference),
    ...calculateIfrs15Adjustments(company, revenue),
  ];
}

export {
  calculateDeferredTax,
  calculateIas12Adjustments,
  defaultTaxRate,
} from "@/lib/ifrs/ias12";
export {
  calculateIas16Adjustments,
  defaultUsefulLife,
} from "@/lib/ifrs/ias16";
export {
  calculateFxDifference,
  calculateIas21Adjustments,
  defaultIas21Input,
} from "@/lib/ifrs/ias21";
export {
  calculateImpairment,
  calculateIas36Adjustments,
  defaultIas36Input,
} from "@/lib/ifrs/ias36";
export {
  calculateLeasePresentValue,
  calculateIfrs16Adjustments,
  defaultIfrs16Input,
} from "@/lib/ifrs/ifrs16";
export {
  buildDemoEclBuckets,
  calculateExpectedCreditLoss,
  calculateIfrs9Adjustments,
} from "@/lib/ifrs/ifrs9";
