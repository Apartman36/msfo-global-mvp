import type { AdjustmentEntry, Company } from "@/lib/types";
import { roundMoney } from "@/lib/utils";

export interface EclBucket {
  label: string;
  amount: number;
  lossRate: number;
}

export function buildDemoEclBuckets(receivablesBalance: number): EclBucket[] {
  return [
    { label: "0-30 дней", amount: receivablesBalance * 0.5, lossRate: 0.005 },
    { label: "31-60 дней", amount: receivablesBalance * 0.25, lossRate: 0.02 },
    { label: "61-90 дней", amount: receivablesBalance * 0.15, lossRate: 0.05 },
    { label: "90+ дней", amount: receivablesBalance * 0.1, lossRate: 0.2 },
  ];
}

export function calculateExpectedCreditLoss(buckets: EclBucket[]) {
  return roundMoney(
    buckets.reduce((total, bucket) => total + bucket.amount * bucket.lossRate, 0),
  );
}

export function calculateIfrs9Adjustments(
  company: Company,
  receivablesBalance: number,
  buckets: EclBucket[] = buildDemoEclBuckets(receivablesBalance),
): AdjustmentEntry[] {
  const ecl = calculateExpectedCreditLoss(buckets);
  return [
    {
      id: `${company.id}-ifrs9-ecl`,
      companyId: company.id,
      standard: "IFRS 9",
      title: "Ожидаемые кредитные убытки",
      description: "Создание оценочного резерва по дебиторской задолженности.",
      debitLine: "PL_ECL",
      creditLine: "SOFP_RECEIVABLES",
      amount: ecl,
      currency: company.currency,
      impactArea: "assets",
      explanation:
        "Демонстрационное правило IFRS 9: дебиторская задолженность распределяется по возрастным корзинам 0-30, 31-60, 61-90 и 90+ дней с условными ставками потерь 0,5%, 2%, 5% и 20%. Расчёт учебный и не является полноценной моделью ECL.",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];
}
