"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { parseTabularFile } from "@/lib/import/parse-tabular-file";
import type { TrialBalanceEntry } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";

export function ImportPage() {
  const { selectedCompany, importTrialBalance, resetDemoData } = useAppStore();
  const [rows, setRows] = useState<TrialBalanceEntry[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [applied, setApplied] = useState(false);

  const columns = useMemo<ColumnDef<TrialBalanceEntry>[]>(
    () => [
      { accessorKey: "accountCode", header: "Код" },
      { accessorKey: "accountName", header: "Наименование" },
      { accessorKey: "accountType", header: "Тип" },
      {
        accessorKey: "debit",
        header: "Дебет",
        cell: ({ row }) => formatMoney(row.original.debit, row.original.currency),
      },
      {
        accessorKey: "credit",
        header: "Кредит",
        cell: ({ row }) => formatMoney(row.original.credit, row.original.currency),
      },
      {
        accessorKey: "balance",
        header: "Сальдо",
        cell: ({ row }) => formatMoney(row.original.balance, row.original.currency),
      },
    ],
    [],
  );

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    setIsParsing(true);
    setApplied(false);
    const result = await parseTabularFile(file, selectedCompany.id, selectedCompany.currency);
    setRows(result.rows);
    setErrors(result.errors);
    setIsParsing(false);
  }

  function applyImport() {
    importTrialBalance(rows);
    setApplied(true);
  }

  return (
    <>
      <PageHeader
        title="Импорт Excel/CSV"
        description="Загрузите учебную ОСВ в XLSX или CSV. Поддерживаются английские и русские заголовки колонок; данные сохраняются в localStorage для выбранной компании."
        actions={
          <Button variant="secondary" onClick={resetDemoData}>
            Загрузить демо-данные
          </Button>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Формат файла</CardTitle>
            <CardDescription>
              Минимальные колонки: accountCode, accountName, accountType, debit, credit, balance,
              currency.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:bg-slate-100">
              <Upload className="h-8 w-8 text-slate-500" />
              <span className="mt-3 text-sm font-medium text-slate-900">
                Выберите XLSX или CSV файл
              </span>
              <span className="mt-1 text-xs text-slate-500">
                Также принимаются колонки: Код счета, Наименование счета, Тип счета, Дебет, Кредит,
                Сальдо, Валюта
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="sr-only"
                onChange={(event) => void handleFile(event.target.files?.[0])}
              />
            </label>
            {isParsing ? <Badge variant="info">Файл читается...</Badge> : null}
            {applied ? (
              <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Импорт применён к текущей компании.
              </div>
            ) : null}
            {errors.length ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  Нужно исправить формат файла
                </div>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-800">
                  {errors.slice(0, 6).map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Button
              variant="accent"
              disabled={rows.length === 0 || errors.length > 0}
              onClick={applyImport}
              className="w-full"
            >
              Применить импорт к компании
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Предпросмотр</CardTitle>
            <CardDescription>
              Компания: {selectedCompany.name}. После применения будет создан автоматический
              маппинг, а старые корректировки будут очищены.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={rows} emptyText="Загрузите файл для предпросмотра" />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
