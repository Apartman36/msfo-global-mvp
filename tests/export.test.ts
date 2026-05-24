import { describe, expect, it } from "vitest";
import { companies } from "@/lib/fixtures/companies";
import { createDefaultMappings } from "@/lib/fixtures/mappings";
import { trialBalances } from "@/lib/fixtures/trial-balances";
import { applySimplifiedIfrsRules } from "@/lib/ifrs";
import { generateStatements } from "@/lib/statements";
import { calculateRatios } from "@/lib/analytics/ratios";
import { buildJsonExport, type ExportPayload } from "@/lib/export/export-json";
import { buildXbrlLikeXml } from "@/lib/export/export-xml";

function buildPayload(): ExportPayload {
  const company = companies[0];
  const entries = trialBalances[company.id];
  const mappings = createDefaultMappings(entries);
  const adjustments = applySimplifiedIfrsRules(company, entries);
  const statements = generateStatements(entries, mappings, adjustments);
  const analytics = calculateRatios(statements.sofp, statements.profitLoss);
  return {
    company,
    trialBalance: entries,
    mappings,
    adjustments,
    statements,
    analytics,
    period: "2026 demo period",
  };
}

describe("exports", () => {
  it("JSON export contains expected top-level shape and disclaimer", () => {
    const payload = buildPayload();
    const json = buildJsonExport(payload);
    const parsed = JSON.parse(json) as Record<string, unknown> & ExportPayload;

    expect(parsed.product).toBe("MSFO.Global");
    expect(typeof parsed.disclaimer).toBe("string");
    expect(parsed.company.id).toBe(payload.company.id);
    expect(Array.isArray(parsed.trialBalance)).toBe(true);
    expect(Array.isArray(parsed.adjustments)).toBe(true);
    expect(parsed.statements.sofp.length).toBeGreaterThan(0);
    expect(parsed.statements.profitLoss.length).toBeGreaterThan(0);
    expect(parsed.statements.cashFlow.length).toBeGreaterThan(0);
    expect(Array.isArray(parsed.analytics)).toBe(true);
  });

  it("XML/XBRL-like export is well-formed and escapes XML metacharacters", () => {
    const payload = buildPayload();
    const xml = buildXbrlLikeXml(payload);

    expect(xml.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\"?>")).toBe(true);
    expect(xml).toContain("<msfoGlobalReport");
    expect(xml).toContain("</msfoGlobalReport>");
    expect(xml).toContain("<facts>");
    expect(xml).toContain("</facts>");
    expect(xml).toContain(payload.company.currency);

    const injected: ExportPayload = {
      ...payload,
      company: { ...payload.company, name: "Acme & Co <\"Test\">" },
    };
    const injectedXml = buildXbrlLikeXml(injected);
    expect(injectedXml).toContain("Acme &amp; Co &lt;&quot;Test&quot;&gt;");
    expect(injectedXml).not.toContain("Acme & Co <\"Test\">");
  });
});
