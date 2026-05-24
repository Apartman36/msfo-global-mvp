import type { AdjustmentEntry, Company } from "@/lib/types";
import { roundMoney } from "@/lib/utils";

export function defaultIas36Input(company: Company) {
  return company.jurisdiction === "RU"
    ? { carryingAmount: 12_000_000, recoverableAmount: 10_500_000 }
    : { carryingAmount: 1_500_000, recoverableAmount: 1_000_000 };
}

export function calculateImpairment(carryingAmount: number, recoverableAmount: number) {
  return roundMoney(Math.max(0, carryingAmount - recoverableAmount));
}

export function calculateIas36Adjustments(
  company: Company,
  input = defaultIas36Input(company),
): AdjustmentEntry[] {
  const impairment = calculateImpairment(input.carryingAmount, input.recoverableAmount);
  return impairment === 0
    ? []
    : [
        {
          id: `${company.id}-ias36-impairment`,
          companyId: company.id,
          standard: "IAS 36",
          title: "Обесценение актива",
          description: "Снижение балансовой стоимости до возмещаемой суммы.",
          debitLine: "PL_IMPAIRMENT",
          creditLine: "SOFP_PPE",
          amount: impairment,
          currency: company.currency,
          impactArea: "assets",
          explanation:
            "Демонстрационное правило IAS 36: убыток от обесценения = max(0, балансовая стоимость - возмещаемая сумма). Используется учебная оценка выбранного актива/CGU.",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ];
}
