import * as XLSX from "xlsx";
import type { AccountType, TrialBalanceEntry } from "@/lib/types";

export interface ParseResult {
  rows: TrialBalanceEntry[];
  errors: string[];
}

const columnAliases: Record<string, string[]> = {
  accountCode: ["accountCode", "account_code", "Код счета", "Код счёта", "Счет", "Счёт"],
  accountName: ["accountName", "account_name", "Наименование счета", "Наименование счёта", "Название"],
  accountType: ["accountType", "account_type", "Тип счета", "Тип счёта"],
  debit: ["debit", "Дебет"],
  credit: ["credit", "Кредит"],
  balance: ["balance", "Сальдо", "Остаток"],
  currency: ["currency", "Валюта"],
};

const accountTypeAliases: Record<string, AccountType> = {
  asset: "asset",
  актив: "asset",
  assets: "asset",
  liability: "liability",
  обязательство: "liability",
  обязательства: "liability",
  equity: "equity",
  капитал: "equity",
  income: "income",
  доход: "income",
  выручка: "income",
  expense: "expense",
  расход: "expense",
  расходы: "expense",
};

function readField(row: Record<string, unknown>, field: keyof typeof columnAliases) {
  for (const alias of columnAliases[field]) {
    const value = row[alias];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
}

function parseNumber(value: string) {
  if (!value) {
    return 0;
  }

  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseAccountType(value: string): AccountType {
  return accountTypeAliases[value.toLowerCase()] ?? "asset";
}

export async function parseTabularFile(file: File, companyId: string, currency: string): Promise<ParseResult> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    if (!sheet) {
      return { rows: [], errors: ["Файл не содержит листов с данными."] };
    }

    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    const errors: string[] = [];
    const rows = rawRows.map((row, index) => {
      const accountCode = readField(row, "accountCode");
      const accountName = readField(row, "accountName");
      const accountType = parseAccountType(readField(row, "accountType"));
      const debit = parseNumber(readField(row, "debit"));
      const credit = parseNumber(readField(row, "credit"));
      const explicitBalance = parseNumber(readField(row, "balance"));
      const balance = explicitBalance || Math.abs(debit - credit);
      const rowCurrency = readField(row, "currency") || currency;

      if (!accountCode) {
        errors.push(`Строка ${index + 2}: не указан код счёта.`);
      }
      if (!accountName) {
        errors.push(`Строка ${index + 2}: не указано наименование счёта.`);
      }
      if (balance === 0 && debit === 0 && credit === 0) {
        errors.push(`Строка ${index + 2}: не указано сальдо, дебет или кредит.`);
      }

      return {
        id: `${companyId}-import-${index}-${accountCode || "empty"}`,
        companyId,
        accountCode,
        accountName,
        accountType,
        debit:
          debit ||
          (credit === 0 && ["asset", "expense"].includes(accountType) ? Math.abs(balance) : 0),
        credit:
          credit ||
          (debit === 0 && ["liability", "equity", "income"].includes(accountType)
            ? Math.abs(balance)
            : 0),
        balance: Math.abs(balance),
        currency: rowCurrency,
      };
    });

    return {
      rows: rows.filter((row) => row.accountCode && row.accountName),
      errors,
    };
  } catch {
    return {
      rows: [],
      errors: [
        "Не удалось прочитать файл. Проверьте формат XLSX/CSV и наличие колонок accountCode/accountName/balance или русских аналогов.",
      ],
    };
  }
}
