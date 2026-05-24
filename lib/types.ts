export type Jurisdiction = "RU" | "ZM";

export type StatementType = "SOFP" | "PL" | "CF";

export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

export type MappingType = "auto" | "manual";

export type UserRole = "analyst" | "manager" | "auditor";

export type ImpactArea =
  | "assets"
  | "liabilities"
  | "equity"
  | "income"
  | "expenses"
  | "tax"
  | "fx";

export interface Company {
  id: string;
  name: string;
  jurisdiction: Jurisdiction;
  countryLabel: string;
  currency: string;
  presentationCurrency?: string;
  description: string;
  industry: string;
}

export interface TrialBalanceEntry {
  id: string;
  companyId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debit: number;
  credit: number;
  balance: number;
  currency: string;
  notes?: string;
}

export interface IfrsLine {
  id: string;
  code: string;
  statement: StatementType;
  section: string;
  nameRu: string;
  nameEn?: string;
  sortOrder: number;
}

export interface AccountMapping {
  id: string;
  companyId: string;
  accountCode: string;
  ifrsLineCode: string;
  confidence?: number;
  mappingType: MappingType;
}

export interface AdjustmentEntry {
  id: string;
  companyId: string;
  standard: string;
  title: string;
  description: string;
  debitLine: string;
  creditLine: string;
  amount: number;
  currency: string;
  impactArea: ImpactArea;
  explanation: string;
  createdAt: string;
}

export interface FinancialStatementLine {
  code: string;
  name: string;
  amountLocal: number;
  amountIfrs: number;
  adjustmentAmount: number;
  section: string;
  statement: StatementType;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  details: string;
}

export interface AnalyticsRatio {
  id: string;
  name: string;
  value: number;
  format: "number" | "percent" | "ratio";
  description: string;
}

export interface AppState {
  companies: Company[];
  selectedCompanyId: string;
  trialBalances: Record<string, TrialBalanceEntry[]>;
  mappings: Record<string, AccountMapping[]>;
  adjustments: Record<string, AdjustmentEntry[]>;
  role: UserRole;
  auditEvents: AuditEvent[];
  approvedAt?: string;
}
