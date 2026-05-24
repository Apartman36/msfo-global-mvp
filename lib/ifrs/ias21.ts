import type { AdjustmentEntry, Company } from "@/lib/types";
import { roundMoney } from "@/lib/utils";

export interface Ias21Input {
  foreignAmount: number;
  oldRate: number;
  closingRate: number;
  monetaryItemLine?: string;
}

export function defaultIas21Input(company: Company): Ias21Input {
  return company.jurisdiction === "RU"
    ? {
        foreignAmount: 420_000,
        oldRate: 97,
        closingRate: 101,
        monetaryItemLine: "SOFP_PAYABLES",
      }
    : {
        foreignAmount: 120_000,
        oldRate: 24.1,
        closingRate: 25,
        monetaryItemLine: "SOFP_PAYABLES",
      };
}

export function calculateFxDifference({ foreignAmount, oldRate, closingRate }: Ias21Input) {
  return roundMoney(foreignAmount * (closingRate - oldRate));
}

export function calculateIas21Adjustments(
  company: Company,
  input: Ias21Input = defaultIas21Input(company),
): AdjustmentEntry[] {
  const difference = calculateFxDifference(input);
  const amount = Math.abs(difference);
  const isLoss = difference > 0;

  return [
    {
      id: `${company.id}-ias21-fx`,
      companyId: company.id,
      standard: "IAS 21",
      title: isLoss ? "Курсовой убыток по валютному обязательству" : "Курсовая прибыль по валютному обязательству",
      description: "Переоценка валютной монетарной статьи по курсу закрытия.",
      debitLine: isLoss ? "PL_FX" : input.monetaryItemLine ?? "SOFP_PAYABLES",
      creditLine: isLoss ? input.monetaryItemLine ?? "SOFP_PAYABLES" : "PL_FX",
      amount,
      currency: company.currency,
      impactArea: "fx",
      explanation:
        "Демонстрационное правило IAS 21: курсовая разница = валютная сумма * (курс закрытия - старый курс). Для валютного обязательства рост курса даёт убыток. Расчёт учебный.",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];
}
