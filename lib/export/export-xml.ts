import type { ExportPayload } from "@/lib/export/export-json";

function escapeXml(value: string | number | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildXbrlLikeXml(payload: ExportPayload) {
  const facts = [
    ...payload.statements.sofp,
    ...payload.statements.profitLoss,
    ...payload.statements.cashFlow,
  ]
    .map(
      (line) => `    <fact code="${escapeXml(line.code)}" statement="${line.statement}" section="${escapeXml(
        line.section,
      )}">
      <name>${escapeXml(line.name)}</name>
      <amountLocal>${line.amountLocal}</amountLocal>
      <adjustmentAmount>${line.adjustmentAmount}</adjustmentAmount>
      <amountIfrs>${line.amountIfrs}</amountIfrs>
    </fact>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<msfoGlobalReport version="0.1" xbrlLike="true">
  <disclaimer>Учебный XML/XBRL-like экспорт. Не является валидным XBRL таксономическим отчётом.</disclaimer>
  <company id="${escapeXml(payload.company.id)}">
    <name>${escapeXml(payload.company.name)}</name>
    <jurisdiction>${escapeXml(payload.company.countryLabel)}</jurisdiction>
    <currency>${escapeXml(payload.company.currency)}</currency>
    <period>${escapeXml(payload.period)}</period>
  </company>
  <facts>
${facts}
  </facts>
</msfoGlobalReport>`;
}
