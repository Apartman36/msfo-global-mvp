"use client";

import { useMemo, useState } from "react";
import { Download, FileCode2, FileJson, FileSpreadsheet } from "lucide-react";
import { calculateRatios } from "@/lib/analytics/ratios";
import { exportExcel } from "@/lib/export/export-excel";
import { buildJsonExport, type ExportPayload } from "@/lib/export/export-json";
import { buildXbrlLikeXml } from "@/lib/export/export-xml";
import { generateStatements } from "@/lib/statements";
import { useAppStore } from "@/lib/store/app-store";
import { downloadTextFile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatementTable } from "@/components/reports/statement-table";

type StatementTab = "sofp" | "profitLoss" | "cashFlow";

const tabs: { id: StatementTab; label: string }[] = [
  { id: "sofp", label: "Финансовое положение" },
  { id: "profitLoss", label: "Прибыли и убытки" },
  { id: "cashFlow", label: "Движение денежных средств" },
];

export function StatementsPage() {
  const {
    selectedCompany,
    trialBalance,
    mappings,
    adjustments,
    recordExport,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<StatementTab>("sofp");
  const statements = useMemo(
    () => generateStatements(trialBalance, mappings, adjustments),
    [trialBalance, mappings, adjustments],
  );
  const analytics = useMemo(
    () => calculateRatios(statements.sofp, statements.profitLoss),
    [statements],
  );

  const payload: ExportPayload = {
    company: selectedCompany,
    trialBalance,
    mappings,
    adjustments,
    statements,
    analytics,
    period: "2026 demo period",
  };

  function handleExcelExport() {
    exportExcel(
      payload,
      selectedCompany.jurisdiction === "RU"
        ? "msfo-global-report-ru.xlsx"
        : "msfo-global-report-zm.xlsx",
    );
    recordExport("Excel");
  }

  function handleJsonExport() {
    downloadTextFile(
      buildJsonExport(payload),
      "msfo-global-report.json",
      "application/json;charset=utf-8",
    );
    recordExport("JSON");
  }

  function handleXmlExport() {
    downloadTextFile(
      buildXbrlLikeXml(payload),
      "msfo-global-xbrl-like.xml",
      "application/xml;charset=utf-8",
    );
    recordExport("XML");
  }

  const lines = statements[activeTab];

  return (
    <>
      <PageHeader
        title="Финансовая отчётность"
        description="Отчёты формируются из локальной ОСВ, маппинга и журнала учебных IFRS-корректировок. XML экспорт является XBRL-like, без заявления о реальной XBRL-валидации."
        actions={
          <>
            <Button variant="secondary" onClick={handleExcelExport}>
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button variant="secondary" onClick={handleJsonExport}>
              <FileJson className="h-4 w-4" />
              JSON
            </Button>
            <Button variant="secondary" onClick={handleXmlExport}>
              <FileCode2 className="h-4 w-4" />
              XML/XBRL-like
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{selectedCompany.name}</CardTitle>
            <Badge variant="neutral">{selectedCompany.currency}</Badge>
            <Badge variant={adjustments.length ? "success" : "warning"}>
              {adjustments.length ? "Корректировки применены" : "Без корректировок"}
            </Badge>
          </div>
          <CardDescription>
            Для учебной демонстрации строка нераспределённой прибыли может включать балансирующий
            результат, чтобы SOFP оставался внутренне связным.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <StatementTable lines={lines} currency={selectedCompany.currency} />
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <Download className="h-4 w-4" />
        Экспорт включает текущую компанию, ОСВ, маппинг, корректировки, отчёты и аналитические
        коэффициенты.
      </div>
    </>
  );
}
