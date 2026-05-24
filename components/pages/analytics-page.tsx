"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildAdjustmentsByStandard,
  buildAssetsComposition,
  buildRevenueChart,
  calculateRatios,
} from "@/lib/analytics/ratios";
import { generateStatements } from "@/lib/statements";
import { useAppStore } from "@/lib/store/app-store";
import { formatMoney, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const chartColors = ["#0f172a", "#059669", "#d97706", "#0284c7", "#7c3aed", "#dc2626"];

function formatRatioValue(value: number, format: "number" | "percent" | "ratio") {
  if (format === "percent") {
    return formatPercent(value);
  }
  return value.toFixed(2);
}

export function AnalyticsPage() {
  const { selectedCompany, trialBalance, mappings, adjustments } = useAppStore();
  const statements = useMemo(
    () => generateStatements(trialBalance, mappings, adjustments),
    [trialBalance, mappings, adjustments],
  );
  const ratios = calculateRatios(statements.sofp, statements.profitLoss);
  const revenueChart = buildRevenueChart(statements.profitLoss);
  const assetsChart = buildAssetsComposition(statements.sofp);
  const adjustmentsChart = buildAdjustmentsByStandard(adjustments);

  return (
    <>
      <PageHeader
        title="Аналитика"
        description="Финансовые коэффициенты и визуализации рассчитываются из сформированной IFRS/MSFO-отчётности. Графики предназначены для образовательной демонстрации."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ratios.map((ratio) => (
          <Card key={ratio.id}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{ratio.name}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">
                {formatRatioValue(ratio.value, ratio.format)}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{ratio.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Выручка, себестоимость и расходы</CardTitle>
            <CardDescription>{selectedCompany.currency}, IFRS/MSFO после корректировок</CardDescription>
          </CardHeader>
          <CardContent className="h-80 overflow-x-auto">
            <div className="min-w-[680px]">
              <BarChart width={680} height={300} data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${Number(value) / 1_000_000}м`} />
                <Tooltip formatter={(value) => formatMoney(Number(value), selectedCompany.currency)} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {revenueChart.map((item, index) => (
                    <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Структура активов</CardTitle>
            <CardDescription>Доля строк SOFP в активах</CardDescription>
          </CardHeader>
          <CardContent className="h-80 overflow-x-auto">
            <div className="min-w-[680px]">
              <PieChart width={680} height={300}>
                <Pie
                  data={assetsChart}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {assetsChart.map((item, index) => (
                    <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatMoney(Number(value), selectedCompany.currency)} />
                <Legend />
              </PieChart>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Корректировки по стандартам</CardTitle>
            <CardDescription>Абсолютная сумма проводок по каждому учебному правилу</CardDescription>
          </CardHeader>
          <CardContent className="h-80 overflow-x-auto">
            {adjustmentsChart.length ? (
              <div className="min-w-[680px]">
                <BarChart width={680} height={300} data={adjustmentsChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${Number(value) / 1_000_000}м`} />
                  <Tooltip formatter={(value) => formatMoney(Number(value), selectedCompany.currency)} />
                  <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-md bg-slate-50 text-sm text-slate-500">
                Примените IFRS-правила на странице корректировок, чтобы увидеть график.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
