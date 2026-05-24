import type { AdjustmentEntry, Company } from "@/lib/types";
import { roundMoney } from "@/lib/utils";

export function defaultUsefulLife(company: Company) {
  return company.jurisdiction === "RU" ? 10 : 7;
}

export function calculateIas16Adjustments(
  company: Company,
  ppeGross: number,
  accumulatedDepreciation: number,
  usefulLife = defaultUsefulLife(company),
): AdjustmentEntry[] {
  const annualDepreciation = roundMoney(ppeGross / usefulLife);
  return [
    {
      id: `${company.id}-ias16-depreciation`,
      companyId: company.id,
      standard: "IAS 16",
      title: "Дополнительная амортизация ОС",
      description: "Упрощённый пересчёт амортизации основных средств по сроку полезного использования.",
      debitLine: "PL_DEPRECIATION",
      creditLine: "SOFP_PPE",
      amount: annualDepreciation,
      currency: company.currency,
      impactArea: "assets",
      explanation: `Демонстрационное правило IAS 16: годовая амортизация = первоначальная стоимость ОС / срок полезного использования. Входные данные: валовая стоимость ${ppeGross}, накопленная амортизация ${accumulatedDepreciation}, срок ${usefulLife} лет. Расчёт упрощён.`,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];
}
