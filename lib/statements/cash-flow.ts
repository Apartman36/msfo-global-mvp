import { ifrsLineByCode } from "@/lib/fixtures/ifrs-lines";
import { generateProfitLoss } from "@/lib/statements/profit-loss";
import { generateSofp } from "@/lib/statements/sofp";
import type {
  AccountMapping,
  AdjustmentEntry,
  FinancialStatementLine,
  TrialBalanceEntry,
} from "@/lib/types";

function makeLine(code: string, amountLocal: number, amountIfrs: number): FinancialStatementLine {
  const line = ifrsLineByCode[code];
  return {
    code,
    name: line.nameRu,
    amountLocal,
    adjustmentAmount: amountIfrs - amountLocal,
    amountIfrs,
    section: line.section,
    statement: "CF",
  };
}

function byCode(lines: FinancialStatementLine[], code: string) {
  return lines.find((line) => line.code === code)?.amountIfrs ?? 0;
}

export function generateCashFlow(
  entries: TrialBalanceEntry[],
  mappings: AccountMapping[],
  adjustments: AdjustmentEntry[],
): FinancialStatementLine[] {
  const pl = generateProfitLoss(entries, mappings, adjustments);
  const sofp = generateSofp(entries, mappings, adjustments);
  const localPl = generateProfitLoss(entries, mappings, []);
  const localSofp = generateSofp(entries, mappings, []);

  const localPbt = byCode(localPl, "PL_NET_PROFIT") + byCode(localPl, "PL_TAX");
  const ifrsPbt = byCode(pl, "PL_NET_PROFIT") + byCode(pl, "PL_TAX");
  const localDep = byCode(localPl, "PL_DEPRECIATION");
  const ifrsDep = byCode(pl, "PL_DEPRECIATION");
  const localReceivables = -Math.abs(byCode(localSofp, "SOFP_RECEIVABLES") * 0.1);
  const ifrsReceivables = -Math.abs(byCode(sofp, "SOFP_RECEIVABLES") * 0.1);
  const localInventories = -Math.abs(byCode(localSofp, "SOFP_INVENTORIES") * 0.05);
  const ifrsInventories = -Math.abs(byCode(sofp, "SOFP_INVENTORIES") * 0.05);
  const localPayables = Math.abs(byCode(localSofp, "SOFP_PAYABLES") * 0.08);
  const ifrsPayables = Math.abs(byCode(sofp, "SOFP_PAYABLES") * 0.08);
  const ifrsLeasePayments = -Math.abs(
    adjustments
      .filter((adjustment) => adjustment.standard === "IFRS 16")
      .reduce((sum, adjustment) => sum + adjustment.amount, 0) * 0.08,
  );
  const impairment = byCode(pl, "PL_IMPAIRMENT");

  const localOperating = localPbt + localDep + localReceivables + localInventories + localPayables;
  const ifrsOperating =
    ifrsPbt + ifrsDep + impairment + ifrsReceivables + ifrsInventories + ifrsPayables;

  return [
    makeLine("CF_PROFIT_BEFORE_TAX", localPbt, ifrsPbt),
    makeLine("CF_DEPRECIATION", localDep, ifrsDep + impairment),
    makeLine("CF_RECEIVABLES", localReceivables, ifrsReceivables),
    makeLine("CF_INVENTORIES", localInventories, ifrsInventories),
    makeLine("CF_PAYABLES", localPayables, ifrsPayables),
    makeLine("CF_NET_OPERATING", localOperating, ifrsOperating),
    makeLine("CF_LEASE_PAYMENTS", 0, ifrsLeasePayments),
    makeLine("CF_NET_MOVEMENT", localOperating, ifrsOperating + ifrsLeasePayments),
  ];
}
