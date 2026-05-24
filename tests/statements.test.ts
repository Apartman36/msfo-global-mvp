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

  it("keeps demo IFRS net profit positive while below local profit", () => {
    const demoTargets = [
      { company: companies[0], min: 15_000_000, max: 30_000_000 },
      { company: companies[1], min: 2_000_000, max: 4_000_000 },
    ];

    for (const { company, min, max } of demoTargets) {
      const entries = trialBalances[company.id];
      const mappings = createDefaultMappings(entries);
      const adjustments = applySimplifiedIfrsRules(company, entries);
      const statements = generateStatements(entries, mappings, adjustments);
      const netProfit = statements.profitLoss.find((line) => line.code === "PL_NET_PROFIT");

      expect(netProfit?.amountIfrs).toBeGreaterThan(min);
      expect(netProfit?.amountIfrs).toBeLessThan(max);
      expect(netProfit?.amountIfrs).toBeLessThan(netProfit?.amountLocal ?? 0);
    }
  });
});
