import { ifrsLineByCode } from "@/lib/fixtures/ifrs-lines";
import type {
  AccountMapping,
  FinancialStatementLine,
  IfrsLine,
  TrialBalanceEntry,
} from "@/lib/types";

export interface MappedAccount {
  entry: TrialBalanceEntry;
  mapping?: AccountMapping;
  ifrsLine?: IfrsLine;
  status: "mapped" | "unmapped";
  amount: number;
}

export function signedTrialBalanceAmount(entry: TrialBalanceEntry) {
  return entry.debit - entry.credit;
}

export function contributionForLine(entry: TrialBalanceEntry, line: IfrsLine) {
  if (line.statement === "SOFP") {
    return line.section === "Активы" ? entry.debit - entry.credit : entry.credit - entry.debit;
  }

  if (line.statement === "PL") {
    return line.code === "PL_REVENUE" ? entry.credit - entry.debit : entry.debit - entry.credit;
  }

  return entry.debit - entry.credit;
}

export function mapAccounts(
  entries: TrialBalanceEntry[],
  mappings: AccountMapping[],
): MappedAccount[] {
  const mappingByAccount = new Map(mappings.map((mapping) => [mapping.accountCode, mapping]));

  return entries.map((entry) => {
    const mapping = mappingByAccount.get(entry.accountCode);
    const ifrsLine = mapping ? ifrsLineByCode[mapping.ifrsLineCode] : undefined;
    return {
      entry,
      mapping,
      ifrsLine,
      status: ifrsLine ? "mapped" : "unmapped",
      amount: ifrsLine ? contributionForLine(entry, ifrsLine) : 0,
    };
  });
}

export function groupAccountsByIfrsLine(
  entries: TrialBalanceEntry[],
  mappings: AccountMapping[],
) {
  const grouped = new Map<string, number>();

  for (const mapped of mapAccounts(entries, mappings)) {
    if (!mapped.ifrsLine) {
      continue;
    }
    grouped.set(mapped.ifrsLine.code, (grouped.get(mapped.ifrsLine.code) ?? 0) + mapped.amount);
  }

  return grouped;
}

export function statementLineFromMapping(
  line: IfrsLine,
  localAmount: number,
  adjustmentAmount: number,
): FinancialStatementLine {
  return {
    code: line.code,
    name: line.nameRu,
    amountLocal: localAmount,
    adjustmentAmount,
    amountIfrs: localAmount + adjustmentAmount,
    section: line.section,
    statement: line.statement,
  };
}

export function getMappingCoverage(entries: TrialBalanceEntry[], mappings: AccountMapping[]) {
  const mapped = mapAccounts(entries, mappings).filter((row) => row.status === "mapped").length;
  const total = entries.length;
  return {
    mapped,
    total,
    percent: total === 0 ? 0 : mapped / total,
  };
}
