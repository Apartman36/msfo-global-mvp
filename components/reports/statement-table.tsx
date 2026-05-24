import type { FinancialStatementLine } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

interface StatementTableProps {
  lines: FinancialStatementLine[];
  currency: string;
}

export function StatementTable({ lines, currency }: StatementTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Раздел</th>
              <th className="px-4 py-3">Строка</th>
              <th className="px-4 py-3 text-right">Локальный учёт</th>
              <th className="px-4 py-3 text-right">Корректировка</th>
              <th className="px-4 py-3 text-right">IFRS/MSFO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((line) => (
              <tr key={line.code} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 text-slate-500">{line.section}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{line.name}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatMoney(line.amountLocal, currency)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-amber-700">
                  {formatMoney(line.adjustmentAmount, currency)}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-950">
                  {formatMoney(line.amountIfrs, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
