"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useAppStore } from "@/lib/store/app-store";
import { roleLabels } from "@/lib/audit/audit-log";
import type { AuditEvent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";

export function AuditPage() {
  const { state } = useAppStore();
  const columns = useMemo<ColumnDef<AuditEvent>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Время",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {new Date(row.original.timestamp).toLocaleString("ru-RU")}
          </span>
        ),
      },
      {
        accessorKey: "actorRole",
        header: "Роль",
        cell: ({ row }) => <Badge variant="neutral">{roleLabels[row.original.actorRole]}</Badge>,
      },
      { accessorKey: "action", header: "Действие" },
      { accessorKey: "entity", header: "Объект" },
      {
        accessorKey: "details",
        header: "Детали",
        cell: ({ row }) => <span className="text-slate-600">{row.original.details}</span>,
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Журнал действий"
        description="Append-only журнал событий в localStorage: загрузка данных, импорт, маппинг, применение правил, экспорт и смена роли."
      />

      {state.role !== "auditor" ? (
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
          В реальном продукте журнал был бы доступен роли аудитора. В MVP реальной защиты нет:
          переключите роль в шапке, чтобы увидеть визуальный сценарий аудитора.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>События</CardTitle>
          <CardDescription>
            Всего событий: {state.auditEvents.length}. Новые события отображаются сверху.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={state.auditEvents} />
        </CardContent>
      </Card>
    </>
  );
}
