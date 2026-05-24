"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useAppStore } from "@/lib/store/app-store";
import type { TrialBalanceEntry } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";

const typeLabels: Record<TrialBalanceEntry["accountType"], string> = {
  asset: "Актив",
  liability: "Обязательство",
  equity: "Капитал",
  income: "Доход",
  expense: "Расход",
};

export function TrialBalancePage() {
  const { selectedCompany, trialBalance } = useAppStore();
  const totals = trialBalance.reduce(
    (acc, row) => ({
      debit: acc.debit + row.debit,
      credit: acc.credit + row.credit,
      balance: acc.balance + row.balance,
    }),
    { debit: 0, credit: 0, balance: 0 },
  );

  const columns = useMemo<ColumnDef<TrialBalanceEntry>[]>(
    () => [
      { accessorKey: "accountCode", header: "Код" },
      {
        accessorKey: "accountName",
        header: "Счёт",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-950">{row.original.accountName}</div>
            {row.original.notes ? (
              <div className="mt-1 text-xs text-slate-500">{row.original.notes}</div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "accountType",
        header: "Тип",
        cell: ({ row }) => <Badge variant="neutral">{typeLabels[row.original.accountType]}</Badge>,
      },
      {
        accessorKey: "debit",
        header: "Дебет",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatMoney(row.original.debit, row.original.currency)}</span>
        ),
      },
      {
        accessorKey: "credit",
        header: "Кредит",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatMoney(row.original.credit, row.original.currency)}</span>
        ),
      },
      {
        accessorKey: "balance",
        header: "Сальдо",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatMoney(row.original.balance, row.original.currency)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Оборотно-сальдовая ведомость"
        description="Предпросмотр локальных бухгалтерских данных до IFRS-маппинга и корректировок. Суммы показываются в валюте выбранной компании."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Итого дебет</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {formatMoney(totals.debit, selectedCompany.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Итого кредит</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {formatMoney(totals.credit, selectedCompany.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Строк в ОСВ</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{trialBalance.length}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{selectedCompany.name}</CardTitle>
          <CardDescription>
            Учебная ОСВ может быть не идеально сбалансирована как промышленная бухгалтерская
            система; отчётность рассчитывает балансирующую строку капитала для демонстрации.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={trialBalance} />
        </CardContent>
      </Card>
    </>
  );
}
