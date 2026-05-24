import type { AdjustmentEntry, Company } from "@/lib/types";
import { roundMoney } from "@/lib/utils";

export function defaultTaxRate(company: Company) {
  return company.jurisdiction === "RU" ? 0.2 : 0.3;
}

export function calculateDeferredTax(temporaryDifference: number, taxRate: number) {
  return roundMoney(temporaryDifference * taxRate);
}

export function calculateIas12Adjustments(
  company: Company,
  temporaryDifference: number,
  taxRate = defaultTaxRate(company),
): AdjustmentEntry[] {
  const deferredTax = calculateDeferredTax(temporaryDifference, taxRate);
  return [
    {
      id: `${company.id}-ias12-deferred-tax`,
      companyId: company.id,
      standard: "IAS 12",
      title: "Отложенное налоговое обязательство",
      description: "Признание отложенного налога по временной разнице.",
      debitLine: "PL_TAX",
      creditLine: "SOFP_DEFERRED_TAX_LIABILITIES",
      amount: deferredTax,
      currency: company.currency,
      impactArea: "tax",
      explanation:
        "Демонстрационное правило IAS 12: отложенный налог = временная разница * ставка налога. Временная разница выбрана для учебного сценария и не является налоговым расчётом.",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];
}
