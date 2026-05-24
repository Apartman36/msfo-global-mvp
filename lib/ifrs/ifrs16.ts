import type { Company, AdjustmentEntry } from "@/lib/types";
import { roundMoney } from "@/lib/utils";

export interface Ifrs16Input {
  annualRent: number;
  leaseTermYears: number;
  discountRate: number;
}

export function defaultIfrs16Input(company: Company): Ifrs16Input {
  return company.jurisdiction === "RU"
    ? { annualRent: 6_000_000, leaseTermYears: 8, discountRate: 0.12 }
    : { annualRent: 1_200_000, leaseTermYears: 4, discountRate: 0.15 };
}

export function calculateLeasePresentValue({
  annualRent,
  leaseTermYears,
  discountRate,
}: Ifrs16Input) {
  if (discountRate === 0) {
    return roundMoney(annualRent * leaseTermYears);
  }

  return roundMoney(
    (annualRent * (1 - (1 + discountRate) ** -leaseTermYears)) / discountRate,
  );
}

export function calculateIfrs16Adjustments(
  company: Company,
  input: Ifrs16Input = defaultIfrs16Input(company),
): AdjustmentEntry[] {
  const pv = calculateLeasePresentValue(input);
  const depreciation = roundMoney(pv / input.leaseTermYears);
  const interest = roundMoney(pv * input.discountRate);
  const explanation = `Демонстрационное правило IFRS 16: арендные платежи капитализируются как актив в форме права пользования и обязательство. PV = rent * (1 - (1 + r)^(-n)) / r. Расчёт упрощён и не заменяет профессиональное суждение.`;

  return [
    {
      id: `${company.id}-ifrs16-pv`,
      companyId: company.id,
      standard: "IFRS 16",
      title: "Капитализация аренды",
      description: "Признание актива права пользования и обязательства по аренде.",
      debitLine: "SOFP_ROU_ASSETS",
      creditLine: "SOFP_LEASE_LIABILITIES",
      amount: pv,
      currency: company.currency,
      impactArea: "liabilities",
      explanation,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: `${company.id}-ifrs16-depreciation`,
      companyId: company.id,
      standard: "IFRS 16",
      title: "Амортизация актива права пользования",
      description: "Линейная амортизация права пользования за период.",
      debitLine: "PL_DEPRECIATION",
      creditLine: "SOFP_ROU_ASSETS",
      amount: depreciation,
      currency: company.currency,
      impactArea: "expenses",
      explanation,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: `${company.id}-ifrs16-interest`,
      companyId: company.id,
      standard: "IFRS 16",
      title: "Процентный расход по аренде",
      description: "Начисление финансового расхода на арендное обязательство.",
      debitLine: "PL_FINANCE_COSTS",
      creditLine: "SOFP_LEASE_LIABILITIES",
      amount: interest,
      currency: company.currency,
      impactArea: "liabilities",
      explanation,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];
}
