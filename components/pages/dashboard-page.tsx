"use client";

import { ArrowRight, CheckCircle2, CircleDashed, Database, FileText, GitBranch, LineChart } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { getMappingCoverage } from "@/lib/mapping/mapping-engine";
import { generateStatements } from "@/lib/statements";
import { calculateRatios } from "@/lib/analytics/ratios";
import { formatMoney, formatPercent } from "@/lib/utils";
import { roleLabels } from "@/lib/audit/audit-log";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";

function WorkflowCard({
  title,
  ready,
  helper,
}: {
  title: string;
  ready: boolean;
  helper: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        {ready ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
        ) : (
          <CircleDashed className="mt-0.5 h-5 w-5 text-slate-400" />
        )}
        <div>
          <p className="font-medium text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { selectedCompany, trialBalance, mappings, adjustments, state, resetDemoData } = useAppStore();
  const coverage = getMappingCoverage(trialBalance, mappings);
  const statements = generateStatements(trialBalance, mappings, adjustments);
  const ratios = calculateRatios(statements.sofp, statements.profitLoss);
  const revenue = statements.profitLoss.find((line) => line.code === "PL_REVENUE")?.amountIfrs ?? 0;
  const netProfit = statements.profitLoss.find((line) => line.code === "PL_NET_PROFIT")?.amountIfrs ?? 0;
  const currentRatio = ratios.find((ratio) => ratio.id === "current-ratio")?.value ?? 0;
  const grossMargin = ratios.find((ratio) => ratio.id === "gross-margin")?.value ?? 0;

  return (
    <>
      <PageHeader
        title="Панель управления MSFO.Global"
        description="Единый учебный workflow для загрузки локальной ОСВ, маппинга на IFRS-строки, применения демонстрационных корректировок и экспорта отчётности."
        actions={
          <>
            <Button variant="accent" onClick={resetDemoData}>
              <Database className="h-4 w-4" />
              Загрузить демо-данные
            </Button>
            <LinkButton href="/import" variant="secondary">
              Импортировать файл
              <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Выручка IFRS/MSFO"
          value={formatMoney(revenue, selectedCompany.currency)}
          helper={selectedCompany.name}
          icon={<LineChart className="h-5 w-5" />}
        />
        <KpiCard
          label="Чистая прибыль"
          value={formatMoney(netProfit, selectedCompany.currency)}
          helper="После учебных корректировок"
          icon={<FileText className="h-5 w-5" />}
        />
        <KpiCard
          label="Текущая ликвидность"
          value={currentRatio.toFixed(2)}
          helper="Оборотные активы / обязательства"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <KpiCard
          label="Валовая маржа"
          value={formatPercent(grossMargin)}
          helper="Валовая прибыль / выручка"
          icon={<GitBranch className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{selectedCompany.name}</CardTitle>
              <Badge variant={selectedCompany.jurisdiction === "RU" ? "info" : "success"}>
                {selectedCompany.countryLabel}
              </Badge>
              <Badge>{selectedCompany.currency}</Badge>
            </div>
            <CardDescription>{selectedCompany.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <WorkflowCard
                title="Данные загружены"
                ready={trialBalance.length > 0}
                helper={`${trialBalance.length} строк ОСВ в локальном состоянии`}
              />
              <WorkflowCard
                title="Маппинг выполнен"
                ready={coverage.percent === 1}
                helper={`${coverage.mapped} из ${coverage.total} счетов сопоставлены`}
              />
              <WorkflowCard
                title="Корректировки применены"
                ready={adjustments.length > 0}
                helper={`${adjustments.length} проводок по IFRS/IAS`}
              />
              <WorkflowCard
                title="Отчёты сформированы"
                ready={statements.sofp.length > 0 && statements.profitLoss.length > 0}
                helper="SOFP, P&L и упрощённый Cash Flow доступны"
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <LinkButton href="/mapping" variant="default">
                Перейти к маппингу
              </LinkButton>
              <LinkButton href="/statements" variant="accent">
                Сформировать отчёты
              </LinkButton>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Последние действия</CardTitle>
            <CardDescription>Активная роль: {roleLabels[state.role]}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.auditEvents.slice(0, 6).map((event) => (
                <div key={event.id} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-950">{event.action}</p>
                    <Badge variant="neutral">{roleLabels[event.actorRole]}</Badge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{event.details}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
