import { describe, expect, it } from "vitest";
import { companies } from "@/lib/fixtures/companies";
import { createDefaultMappings } from "@/lib/fixtures/mappings";
import { trialBalances } from "@/lib/fixtures/trial-balances";
import { applySimplifiedIfrsRules } from "@/lib/ifrs";
import { generateStatements } from "@/lib/statements";

describe("statement generation", () => {
  it("produces non-empty SOFP and P&L", () => {
    const company = companies[0];
    const entries = trialBalances[company.id];
    const mappings = createDefaultMappings(entries);
    const adjustments = applySimplifiedIfrsRules(company, entries);
    const statements = generateStatements(entries, mappings, adjustments);

    expect(statements.sofp.length).toBeGreaterThan(0);
    expect(statements.profitLoss.length).toBeGreaterThan(0);
    expect(statements.cashFlow.length).toBeGreaterThan(0);
    expect(statements.profitLoss.some((line) => line.code === "PL_NET_PROFIT")).toBe(true);
  });
});
