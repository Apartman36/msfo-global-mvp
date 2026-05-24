"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { companies } from "@/lib/fixtures/companies";
import { createDefaultMappings } from "@/lib/fixtures/mappings";
import { trialBalances } from "@/lib/fixtures/trial-balances";
import { applySimplifiedIfrsRules } from "@/lib/ifrs";
import { createAuditEvent } from "@/lib/audit/audit-log";
import type {
  AccountMapping,
  AdjustmentEntry,
  AppState,
  AuditEvent,
  Company,
  TrialBalanceEntry,
  UserRole,
} from "@/lib/types";

const STORAGE_KEY = "msfo-global-state-v1";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function seededAuditEvent(): AuditEvent {
  return {
    id: "seed-demo-data",
    timestamp: "2026-01-01T00:00:00.000Z",
    actorRole: "analyst",
    action: "Демо-данные подготовлены",
    entity: "fixtures",
    details: "Первичная загрузка образовательного набора MSFO.Global.",
  };
}

function createInitialState(role: UserRole = "analyst"): AppState {
  return {
    companies: clone(companies),
    selectedCompanyId: companies[0].id,
    trialBalances: clone(trialBalances),
    mappings: Object.fromEntries(
      Object.entries(trialBalances).map(([companyId, entries]) => [
        companyId,
        createDefaultMappings(entries),
      ]),
    ),
    adjustments: Object.fromEntries(companies.map((company) => [company.id, [] as AdjustmentEntry[]])),
    role,
    auditEvents: [seededAuditEvent()],
  };
}

function loadInitialState() {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialState();
  }

  try {
    return JSON.parse(raw) as AppState;
  } catch {
    return createInitialState();
  }
}

interface AppStoreValue {
  state: AppState;
  selectedCompany: Company;
  trialBalance: TrialBalanceEntry[];
  mappings: AccountMapping[];
  adjustments: AdjustmentEntry[];
  resetDemoData: () => void;
  switchCompany: (companyId: string) => void;
  setRole: (role: UserRole) => void;
  updateMapping: (accountCode: string, ifrsLineCode: string) => void;
  importTrialBalance: (rows: TrialBalanceEntry[]) => void;
  applyRules: () => void;
  approveTransformation: () => void;
  recordExport: (format: "Excel" | "JSON" | "XML") => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>(() => loadInitialState());

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const selectedCompany = useMemo(
    () => state.companies.find((company) => company.id === state.selectedCompanyId) ?? state.companies[0],
    [state.companies, state.selectedCompanyId],
  );

  const appendAudit = useCallback(
    (draft: AppState, action: string, entity: string, details: string, role = draft.role) => {
      draft.auditEvents = [createAuditEvent(role, action, entity, details), ...draft.auditEvents].slice(
        0,
        120,
      );
    },
    [],
  );

  const resetDemoData = useCallback(() => {
    setState((current) => {
      const next = createInitialState(current.role);
      appendAudit(next, "Демо-данные загружены", "fixtures", "Состояние сброшено к учебным данным.");
      return next;
    });
  }, [appendAudit]);

  const switchCompany = useCallback(
    (companyId: string) => {
      setState((current) => {
        const next = { ...current, selectedCompanyId: companyId };
        const company = current.companies.find((item) => item.id === companyId);
        appendAudit(next, "Компания изменена", "company", company?.name ?? companyId);
        return next;
      });
    },
    [appendAudit],
  );

  const setRole = useCallback(
    (role: UserRole) => {
      setState((current) => {
        const next = { ...current, role };
        appendAudit(next, "Роль изменена", "role", `Активная роль: ${role}.`, role);
        return next;
      });
    },
    [appendAudit],
  );

  const updateMapping = useCallback(
    (accountCode: string, ifrsLineCode: string) => {
      setState((current) => {
        const companyId = current.selectedCompanyId;
        const mappings = current.mappings[companyId] ?? [];
        const nextMappings = mappings.map((mapping) =>
          mapping.accountCode === accountCode
            ? {
                ...mapping,
                ifrsLineCode,
                mappingType: "manual" as const,
                confidence: 1,
              }
            : mapping,
        );
        const next = {
          ...current,
          mappings: { ...current.mappings, [companyId]: nextMappings },
        };
        appendAudit(next, "Маппинг обновлён", "mapping", `${accountCode} -> ${ifrsLineCode}`);
        return next;
      });
    },
    [appendAudit],
  );

  const importTrialBalance = useCallback(
    (rows: TrialBalanceEntry[]) => {
      setState((current) => {
        const companyId = current.selectedCompanyId;
        const normalizedRows = rows.map((row) => ({ ...row, companyId }));
        const next = {
          ...current,
          trialBalances: { ...current.trialBalances, [companyId]: normalizedRows },
          mappings: { ...current.mappings, [companyId]: createDefaultMappings(normalizedRows) },
          adjustments: { ...current.adjustments, [companyId]: [] },
        };
        appendAudit(next, "Файл импортирован", "trialBalance", `Загружено строк: ${rows.length}.`);
        return next;
      });
    },
    [appendAudit],
  );

  const applyRules = useCallback(() => {
    setState((current) => {
      const company = current.companies.find((item) => item.id === current.selectedCompanyId);
      if (!company) {
        return current;
      }
      const rows = current.trialBalances[company.id] ?? [];
      const adjustments = applySimplifiedIfrsRules(company, rows);
      const next = {
        ...current,
        adjustments: { ...current.adjustments, [company.id]: adjustments },
      };
      appendAudit(
        next,
        "IFRS-правила применены",
        "adjustments",
        `Создано корректировок: ${adjustments.length}.`,
      );
      return next;
    });
  }, [appendAudit]);

  const approveTransformation = useCallback(() => {
    setState((current) => {
      const next = { ...current, approvedAt: new Date().toISOString() };
      appendAudit(next, "Трансформация согласована", "approval", "Менеджер отметил расчёт как готовый к демонстрации.");
      return next;
    });
  }, [appendAudit]);

  const recordExport = useCallback(
    (format: "Excel" | "JSON" | "XML") => {
      setState((current) => {
        const next = { ...current };
        appendAudit(next, "Отчёт экспортирован", "export", `Формат: ${format}.`);
        return next;
      });
    },
    [appendAudit],
  );

  const value = useMemo<AppStoreValue>(
    () => ({
      state,
      selectedCompany,
      trialBalance: state.trialBalances[selectedCompany.id] ?? [],
      mappings: state.mappings[selectedCompany.id] ?? [],
      adjustments: state.adjustments[selectedCompany.id] ?? [],
      resetDemoData,
      switchCompany,
      setRole,
      updateMapping,
      importTrialBalance,
      applyRules,
      approveTransformation,
      recordExport,
    }),
    [
      state,
      selectedCompany,
      resetDemoData,
      switchCompany,
      setRole,
      updateMapping,
      importTrialBalance,
      applyRules,
      approveTransformation,
      recordExport,
    ],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return context;
}
