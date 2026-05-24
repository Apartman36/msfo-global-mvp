"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardCheck,
  FileSpreadsheet,
  GitCompareArrows,
  Home,
  ListChecks,
  NotebookTabs,
  RotateCcw,
  TableProperties,
} from "lucide-react";
import { AppStoreProvider, useAppStore } from "@/lib/store/app-store";
import { roleLabels } from "@/lib/audit/audit-log";
import type { UserRole } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Панель", icon: Home },
  { href: "/import", label: "Импорт", icon: FileSpreadsheet },
  { href: "/trial-balance", label: "ОСВ", icon: TableProperties },
  { href: "/mapping", label: "Маппинг", icon: GitCompareArrows },
  { href: "/adjustments", label: "Корректировки", icon: ListChecks },
  { href: "/statements", label: "Отчёты", icon: NotebookTabs },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/knowledge", label: "База знаний", icon: BookOpen },
  { href: "/audit", label: "Журнал действий", icon: ClipboardCheck },
];

function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, selectedCompany, switchCompany, setRole, resetDemoData } = useAppStore();

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 p-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold">MSFO.Global</div>
                <div className="text-xs text-slate-500">IFRS/MSFO demo platform</div>
              </div>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                    active && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-200 p-4 text-xs leading-5 text-slate-500">
            Учебный прототип. Расчёты демонстрационные и не заменяют профессиональное
            бухгалтерское суждение.
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={selectedCompany.jurisdiction === "RU" ? "info" : "success"}>
                {selectedCompany.countryLabel}
              </Badge>
              <Badge variant="neutral">{selectedCompany.currency}</Badge>
              {selectedCompany.presentationCurrency &&
              selectedCompany.presentationCurrency !== selectedCompany.currency ? (
                <Badge variant="warning">Презентация: {selectedCompany.presentationCurrency}</Badge>
              ) : null}
              <Badge variant="success">{roleLabels[state.role]}</Badge>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="company">
                Компания
              </label>
              <select
                id="company"
                value={selectedCompany.id}
                onChange={(event) => switchCompany(event.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm"
              >
                {state.companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="role">
                Роль
              </label>
              <select
                id="role"
                value={state.role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm"
              >
                <option value="analyst">Аналитик</option>
                <option value="manager">Менеджер</option>
                <option value="auditor">Аудитор</option>
              </select>
              <Button variant="secondary" onClick={resetDemoData}>
                <RotateCcw className="h-4 w-4" />
                Сбросить демо-данные
              </Button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600",
                    pathname === item.href && "bg-slate-950 text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppStoreProvider>
      <AppChrome>{children}</AppChrome>
    </AppStoreProvider>
  );
}
