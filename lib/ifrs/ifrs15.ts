import type { AdjustmentEntry, Company } from "@/lib/types";
import { roundMoney } from "@/lib/utils";

export function calculateIfrs15Adjustments(company: Company, revenue: number): AdjustmentEntry[] {
  const deferredRevenue = roundMoney(revenue * 0.1);
  return [
    {
      id: `${company.id}-ifrs15-contract-liability`,
      companyId: company.id,
      standard: "IFRS 15",
      title: "Отложенная выручка",
      description: "Условное исключение 10% выставленной, но ещё не заработанной выручки.",
      debitLine: "PL_REVENUE",
      creditLine: "SOFP_PAYABLES",
      amount: deferredRevenue,
      currency: company.currency,
      impactArea: "income",
      explanation:
        "Демонстрационное правило IFRS 15: предполагается, что 10% выручки выставлено покупателям, но обязанность к исполнению ещё не выполнена. В реальной практике требуется анализ договоров.",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];
}
