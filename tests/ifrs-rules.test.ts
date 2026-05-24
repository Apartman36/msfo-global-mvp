import { describe, expect, it } from "vitest";
import { companies } from "@/lib/fixtures/companies";
import {
  calculateExpectedCreditLoss,
  calculateFxDifference,
  calculateIfrs16Adjustments,
} from "@/lib/ifrs";

describe("simplified IFRS rules", () => {
  it("IFRS 16 calculates lease liability and depreciation", () => {
    const [capitalization, depreciation] = calculateIfrs16Adjustments(companies[0], {
      annualRent: 1_000,
      leaseTermYears: 2,
      discountRate: 0.1,
    });

    expect(capitalization.amount).toBeCloseTo(1_735.54, 2);
    expect(depreciation.amount).toBeCloseTo(867.77, 2);
    expect(capitalization.debitLine).toBe("SOFP_ROU_ASSETS");
    expect(capitalization.creditLine).toBe("SOFP_LEASE_LIABILITIES");
  });

  it("IFRS 9 returns expected ECL allowance", () => {
    const ecl = calculateExpectedCreditLoss([
      { label: "current", amount: 1_000, lossRate: 0.01 },
      { label: "overdue", amount: 500, lossRate: 0.1 },
    ]);

    expect(ecl).toBe(60);
  });

  it("IAS 21 returns expected FX difference", () => {
    const fx = calculateFxDifference({
      foreignAmount: 420_000,
      oldRate: 97,
      closingRate: 101,
    });

    expect(fx).toBe(1_680_000);
  });
});
