"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { mapEditableIfrsLines } from "@/lib/fixtures/ifrs-lines";
import { getMappingCoverage, mapAccounts, type MappedAccount } from "@/lib/mapping/mapping-engine";
import { useAppStore } from "@/lib/store/app-store";
import { formatMoney, formatPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";

export function MappingPage() {
  const { selectedCompany, trialBalance, mappings, updateMapping } = useAppStore();
  const rows = useMemo(() => mapAccounts(trialBalance, mappings), [trialBalance, mappings]);
  const coverage = getMappingCoverage(trialBalance, mappings);

  const columns = useMemo<ColumnDef<MappedAccount>[]>(
    () => [
      {
        accessorKey: "entry.accountCode",
        header: "Код",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.entry.accountCode}</span>,
      },
      {
        accessorKey: "entry.accountName",
        header: "Локальный счёт",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-950">{row.original.entry.accountName}</div>
            <div className="mt-1 text-xs text-slate-500">{row.original.entry.accountType}</div>
          </div>
        ),
      },
      {
        id: "balance",
        header: "Сумма",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatMoney(row.original.entry.balance, row.original.entry.currency)}
          </span>
        ),
      },
      {
        id: "ifrsLine",
        header: "IFRS-строка",
        cell: ({ row }) => (
          <select
            value={row.original.mapping?.ifrsLineCode ?? ""}
            onChange={(event) => updateMapping(row.original.entry.accountCode, event.target.value)}
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
          >
            {mapEditableIfrsLines.map((line) => (
              <option key={line.code} value={line.code}>
                {line.nameRu}
              </option>
            ))}
          </select>
        ),
      },
      {
        id: "type",
        header: "Тип маппинга",
        cell: ({ row }) => (
          <Badge variant={row.original.mapping?.mappingType === "manual" ? "warning" : "info"}>
            {row.original.mapping?.mappingType === "manual" ? "manual" : "auto"}
          </Badge>
        ),
      },
      {
        id: "status",
        header: "Статус",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "mapped" ? "success" : "danger"}>
            {row.original.status === "mapped" ? "Сопоставлено" : "Нет строки"}
          </Badge>
        ),
      },
    ],
    [updateMapping],
  );

  return (
    <>
      <PageHeader
        title="Маппинг счетов на IFRS-строки"
        description="Автоматическое сопоставление можно переопределить вручную через выпадающий список. Изменения сохраняются в localStorage и попадают в журнал действий."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Покрытие маппинга</p>
            <p className="mt-2 text-2xl font-semibold">{formatPercent(coverage.percent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Сопоставлено счетов</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {coverage.mapped} / {coverage.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Юрисдикция</p>
            <p className="mt-2 text-2xl font-semibold">{selectedCompany.countryLabel}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{selectedCompany.name}</CardTitle>
          <CardDescription>
            Статус auto означает демо-сопоставление по справочнику; manual означает ручную правку
            пользователя.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={rows} />
        </CardContent>
      </Card>
    </>
  );
}
