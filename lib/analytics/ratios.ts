import type { AnalyticsRatio, FinancialStatementLine } from "@/lib/types";

function value(lines: FinancialStatementLine[], code: string) {
  return lines.find((line) => line.code === code)?.amountIfrs ?? 0;
}

function safeDivide(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

export function calculateRatios(
  sofp: FinancialStatementLine[],
  profitLoss: FinancialStatementLine[],
): AnalyticsRatio[] {
  const cash = value(sofp, "SOFP_CASH");
  const receivables = value(sofp, "SOFP_RECEIVABLES");
  const inventories = value(sofp, "SOFP_INVENTORIES");
  const assets = sofp
    .filter((line) => line.section === "Активы")
    .reduce((sum, line) => sum + line.amountIfrs, 0);
  const liabilities = sofp
    .filter((line) => line.section === "Обязательства")
    .reduce((sum, line) => sum + line.amountIfrs, 0);
  const equity = sofp
    .filter((line) => line.section === "Капитал")
    .reduce((sum, line) => sum + line.amountIfrs, 0);
  const currentAssets = cash + receivables + inventories;
  const currentLiabilities =
    value(sofp, "SOFP_PAYABLES") + value(sofp, "SOFP_BORROWINGS");
  const revenue = value(profitLoss, "PL_REVENUE");
  const grossProfit = value(profitLoss, "PL_GROSS_PROFIT");
  const netProfit = value(profitLoss, "PL_NET_PROFIT");

  return [
    {
      id: "current-ratio",
      name: "Коэффициент текущей ликвидности",
      value: safeDivide(currentAssets, currentLiabilities),
      format: "ratio",
      description: "Оборотные активы / краткосрочные обязательства",
    },
    {
      id: "quick-ratio",
      name: "Быстрая ликвидность",
      value: safeDivide(cash + receivables, currentLiabilities),
      format: "ratio",
      description: "(Деньги + дебиторская задолженность) / обязательства",
    },
    {
      id: "gross-margin",
      name: "Валовая маржа",
      value: safeDivide(grossProfit, revenue),
      format: "percent",
      description: "Валовая прибыль / выручка",
    },
    {
      id: "net-margin",
      name: "Чистая маржа",
      value: safeDivide(netProfit, revenue),
      format: "percent",
      description: "Чистая прибыль / выручка",
    },
    {
      id: "debt-equity",
      name: "Долг / капитал",
      value: safeDivide(liabilities, equity),
      format: "ratio",
      description: "Обязательства / капитал",
    },
    {
      id: "roa",
      name: "ROA",
      value: safeDivide(netProfit, assets),
      format: "percent",
      description: "Чистая прибыль / активы",
    },
  ];
}

export function buildRevenueChart(profitLoss: FinancialStatementLine[]) {
  const revenue = value(profitLoss, "PL_REVENUE");
  const cost = value(profitLoss, "PL_COST_OF_SALES");
  const expenses =
    value(profitLoss, "PL_SELLING_EXPENSES") +
    value(profitLoss, "PL_ADMIN_EXPENSES") +
    value(profitLoss, "PL_DEPRECIATION") +
    value(profitLoss, "PL_IMPAIRMENT") +
    value(profitLoss, "PL_ECL") +
    value(profitLoss, "PL_FINANCE_COSTS") +
    value(profitLoss, "PL_FX") +
    value(profitLoss, "PL_TAX");

  return [
    { name: "Выручка", value: revenue },
    { name: "Себестоимость", value: cost },
    { name: "Расходы", value: expenses },
  ];
}

export function buildAssetsComposition(sofp: FinancialStatementLine[]) {
  return sofp
    .filter((line) => line.section === "Активы" && Math.abs(line.amountIfrs) > 0)
    .map((line) => ({ name: line.name, value: Math.max(0, line.amountIfrs) }));
}

export function buildAdjustmentsByStandard(adjustments: { standard: string; amount: number }[]) {
  const grouped = new Map<string, number>();
  for (const adjustment of adjustments) {
    grouped.set(
      adjustment.standard,
      (grouped.get(adjustment.standard) ?? 0) + Math.abs(adjustment.amount),
    );
  }
  return [...grouped.entries()].map(([name, value]) => ({ name, value }));
}
