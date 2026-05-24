import { ifrsLineByCode } from "@/lib/fixtures/ifrs-lines";
import type { AdjustmentEntry, IfrsLine } from "@/lib/types";

function normalSide(line?: IfrsLine): "debit" | "credit" {
  if (!line) {
    return "debit";
  }

  if (line.statement === "SOFP") {
    return line.section === "Активы" ? "debit" : "credit";
  }

  if (line.statement === "PL") {
    return line.code === "PL_REVENUE" ? "credit" : "debit";
  }

  return "debit";
}

export function calculateAdjustmentImpact(adjustments: AdjustmentEntry[]) {
  const impact = new Map<string, number>();

  for (const adjustment of adjustments) {
    const debitLine = ifrsLineByCode[adjustment.debitLine];
    const creditLine = ifrsLineByCode[adjustment.creditLine];
    const debitEffect = normalSide(debitLine) === "debit" ? adjustment.amount : -adjustment.amount;
    const creditEffect =
      normalSide(creditLine) === "credit" ? adjustment.amount : -adjustment.amount;

    impact.set(adjustment.debitLine, (impact.get(adjustment.debitLine) ?? 0) + debitEffect);
    impact.set(adjustment.creditLine, (impact.get(adjustment.creditLine) ?? 0) + creditEffect);
  }

  return impact;
}
