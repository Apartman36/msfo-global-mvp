import { describe, expect, it } from "vitest";
import { calculateRatios } from "@/lib/analytics/ratios";

describe("analytics ratios", () => {
  it("returns numeric values and handles zero denominators", () => {
    const ratios = calculateRatios([], []);

    expect(ratios.length).toBeGreaterThan(0);
    for (const ratio of ratios) {
      expect(Number.isFinite(ratio.value)).toBe(true);
    }
  });
});
