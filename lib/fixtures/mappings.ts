import type { AccountMapping, TrialBalanceEntry } from "@/lib/types";

const explicitCodes: Record<string, string> = {
  "01": "SOFP_PPE",
  "02": "SOFP_PPE",
  "04": "SOFP_INTANGIBLE",
  "10": "SOFP_INVENTORIES",
  "41": "SOFP_INVENTORIES",
  "50": "SOFP_CASH",
  "51": "SOFP_CASH",
  "52": "SOFP_CASH",
  "60": "SOFP_PAYABLES",
  "62": "SOFP_RECEIVABLES",
  "66": "SOFP_BORROWINGS",
  "68": "SOFP_PAYABLES",
  "68.04": "PL_TAX",
  "70": "SOFP_PAYABLES",
  "76": "SOFP_PAYABLES",
  "80": "SOFP_SHARE_CAPITAL",
  "84": "SOFP_RETAINED_EARNINGS",
  "90.01": "PL_REVENUE",
  "90.02": "PL_COST_OF_SALES",
  "91.02": "PL_FX",
  "44": "PL_SELLING_EXPENSES",
  "26": "PL_ADMIN_EXPENSES",
  "PPE-100": "SOFP_PPE",
  "PPE-190": "SOFP_PPE",
  "INV-100": "SOFP_INVENTORIES",
  "AR-100": "SOFP_RECEIVABLES",
  "CASH-100": "SOFP_CASH",
  "AP-100": "SOFP_PAYABLES",
  "LOAN-100": "SOFP_BORROWINGS",
  "TAX-100": "SOFP_PAYABLES",
  "CAP-100": "SOFP_SHARE_CAPITAL",
  "RE-100": "SOFP_RETAINED_EARNINGS",
  "REV-100": "PL_REVENUE",
  "COS-100": "PL_COST_OF_SALES",
  "OPEX-100": "PL_ADMIN_EXPENSES",
  "RENT-100": "PL_SELLING_EXPENSES",
  "FX-100": "PL_FX",
  "TAX-900": "PL_TAX",
};

export function createDefaultMappings(entries: TrialBalanceEntry[]): AccountMapping[] {
  return entries.map((entry) => {
    const normalizedName = entry.accountName.toLowerCase();
    const inferred =
      explicitCodes[entry.accountCode] ??
      (normalizedName.includes("cash") || normalizedName.includes("касс")
        ? "SOFP_CASH"
        : normalizedName.includes("receivable") || normalizedName.includes("покупател")
          ? "SOFP_RECEIVABLES"
          : normalizedName.includes("inventory") ||
              normalizedName.includes("товар") ||
              normalizedName.includes("материал")
            ? "SOFP_INVENTORIES"
            : normalizedName.includes("payable") || normalizedName.includes("поставщик")
              ? "SOFP_PAYABLES"
              : entry.accountType === "income"
                ? "PL_REVENUE"
                : entry.accountType === "expense"
                  ? "PL_ADMIN_EXPENSES"
                  : entry.accountType === "liability"
                    ? "SOFP_PAYABLES"
                    : entry.accountType === "equity"
                      ? "SOFP_RETAINED_EARNINGS"
                      : "SOFP_PPE");

    return {
      id: `${entry.companyId}-${entry.accountCode}-mapping`,
      companyId: entry.companyId,
      accountCode: entry.accountCode,
      ifrsLineCode: inferred,
      confidence: explicitCodes[entry.accountCode] ? 0.95 : 0.72,
      mappingType: "auto",
    };
  });
}
