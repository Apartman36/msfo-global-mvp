"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlayCircle, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import type { AdjustmentEntry } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { roleLabels } from "@/lib/audit/audit-log";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";

export function AdjustmentsPage() {
  const { selectedCompany, adjustments, applyRules, approveTransformation, state } = useAppStore();
  const totalsByStandard = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const adjustment of adjustments) {
      grouped.set(adjustment.standard, (grouped.get(adjustment.standard) ?? 0) + adjustment.amount);
    }
    return [...grouped.entries()];
  }, [adjustments]);

  const columns = useMemo<ColumnDef<AdjustmentEntry>[]>(
    () => [
      {
        accessorKey: "standard",
        header: "Стандарт",
        cell: ({ row }) => <Badge variant="info">{row.original.standard}</Badge>,
      },
      {
        accessorKey: "title",
        header: "Корректировка",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-950">{row.original.title}</div>
            <div className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
              {row.original.explanation}
            </div>
          </div>
        ),
      },
      { accessorKey: "debitLine", header: "Дт IFRS" },
      { accessorKey: "creditLine", header: "Кт IFRS" },
      {
        accessorKey: "amount",
        header: "Сумма",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatMoney(row.original.amount, row.original.currency)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="IFRS/MSFO корректировки"
        description="Детерминированные учебные правила IFRS 9, IFRS 15, IFRS 16, IAS 12, IAS 16, IAS 21 и IAS 36 формируют журнал трансформационных проводок."
        actions={
          <>
            <Button variant="accent" onClick={applyRules}>
              <PlayCircle className="h-4 w-4" />
              Применить правила
            </Button>
            <Button
              variant={state.role === "manager" ? "warning" : "secondary"}
              disabled={state.role !== "manager" || adjustments.length === 0}
              onClick={approveTransformation}
            >
              <ShieldCheck className="h-4 w-4" />
              Согласовать
            </Button>
          </>
        }
      />

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Все правила являются демонстрационными. Они показывают логику трансформации, но не
        заменяют профессиональное суждение, анализ договоров, налоговый расчёт или аудит.
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Корректировок</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{adjustments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Роль</p>
            <p className="mt-2 text-2xl font-semibold">{roleLabels[state.role]}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Согласование</p>
            <p className="mt-2 text-sm font-medium text-slate-950">
              {state.approvedAt ? "Согласовано менеджером" : "Не согласовано"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Компания</p>
            <p className="mt-2 text-sm font-medium text-slate-950">{selectedCompany.name}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Итоги по стандартам</CardTitle>
          <CardDescription>
            Сумма показывает абсолютный масштаб учебных корректировок по каждому стандарту.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalsByStandard.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {totalsByStandard.map(([standard, amount]) => (
                <div key={standard} className="rounded-md border border-slate-200 p-4">
                  <Badge variant="info">{standard}</Badge>
                  <p className="mt-3 text-lg font-semibold tabular-nums">
                    {formatMoney(amount, selectedCompany.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Нажмите «Применить правила», чтобы сформировать журнал корректировок.
            </p>
          )}
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={adjustments}
        emptyText="Корректировки пока не применены"
      />
    </>
  );
}
