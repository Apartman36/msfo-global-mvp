import { describe, expect, it } from "vitest";
import { createDefaultMappings } from "@/lib/fixtures/mappings";
import { trialBalances } from "@/lib/fixtures/trial-balances";
import { groupAccountsByIfrsLine } from "@/lib/mapping/mapping-engine";

describe("mapping engine", () => {
  it("groups local accounts into IFRS lines", () => {
    const entries = trialBalances["ru-istina"];
    const mappings = createDefaultMappings(entries);
    const grouped = groupAccountsByIfrsLine(entries, mappings);

    expect(grouped.get("PL_REVENUE")).toBe(360_000_000);
    expect(grouped.get("SOFP_PPE")).toBe(43_000_000);
    expect(grouped.get("SOFP_CASH")).toBe(14_400_000);
  });
});
