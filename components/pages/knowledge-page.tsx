"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const cards = [
  {
    standard: "IFRS 9",
    purpose: "Классификация финансовых инструментов и оценка ожидаемых кредитных убытков.",
    demo: "В демо рассчитывается резерв ECL по дебиторской задолженности через возрастные корзины.",
  },
  {
    standard: "IFRS 15",
    purpose: "Признание выручки по договорам с покупателями на основе обязательств к исполнению.",
    demo: "В демо 10% выручки считается выставленной, но ещё не заработанной.",
  },
  {
    standard: "IFRS 16",
    purpose: "Отражение аренды у арендатора через актив права пользования и арендное обязательство.",
    demo: "В демо применяется PV аннуитета, линейная амортизация и процентный расход.",
  },
  {
    standard: "IAS 12",
    purpose: "Учёт текущего и отложенного налога на прибыль.",
    demo: "В демо временная разница умножается на ставку налога России или Замбии.",
  },
  {
    standard: "IAS 16",
    purpose: "Учёт основных средств, амортизации и переоценок.",
    demo: "В демо амортизация = валовая стоимость ОС / учебный срок полезного использования.",
  },
  {
    standard: "IAS 21",
    purpose: "Пересчёт операций и монетарных статей в иностранной валюте.",
    demo: "В демо валютная сумма умножается на разницу между старым курсом и курсом закрытия.",
  },
  {
    standard: "IAS 36",
    purpose: "Проверка активов на обесценение.",
    demo: "В демо убыток = max(0, балансовая стоимость - возмещаемая сумма).",
  },
  {
    standard: "XBRL concept",
    purpose: "Машиночитаемый формат отчётности с таксономией фактов и контекстов.",
    demo: "В демо экспорт создаёт XML/XBRL-like файл без настоящей таксономии и валидации.",
  },
  {
    standard: "ERP roadmap",
    purpose: "Потенциальная интеграция с 1C, Xero, QuickBooks и локальными бухгалтерскими системами.",
    demo: "В v1 интеграция заменена импортом Excel/CSV и демо-данными.",
  },
];

export function KnowledgePage() {
  return (
    <>
      <PageHeader
        title="База знаний"
        description="Краткие образовательные карточки объясняют, как стандарты появляются в демонстрационном workflow MSFO.Global."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.standard}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{card.standard}</CardTitle>
                <Badge variant="info">Учебно</Badge>
              </div>
              <CardDescription>{card.purpose}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <p>
                <span className="font-medium text-slate-950">В демо:</span> {card.demo}
              </p>
              <p className="rounded-md bg-amber-50 p-3 text-amber-900">
                Предупреждение: расчёт упрощён и не заменяет профессиональное бухгалтерское,
                налоговое или аудиторское суждение.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
