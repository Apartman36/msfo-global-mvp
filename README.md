# MSFO.Global

MSFO.Global - учебный локальный MVP для демонстрации трансформации локальных бухгалтерских данных в упрощённую IFRS/MSFO-отчётность для России и Замбии.

Тема демонстрации: **«Digital platform MSFO.Global: an integrated solution for implementing International Financial Reporting Standards (IFRS/MSFO) in Russia and Zambia.»**

## Что демонстрирует приложение

- выбор компании и юрисдикции: Россия или Замбия;
- загрузку демо-данных и импорт XLSX/CSV;
- просмотр оборотно-сальдовой ведомости;
- маппинг локальных счетов на строки IFRS-отчётности;
- применение упрощённых правил IFRS 9, IFRS 15, IFRS 16, IAS 12, IAS 16, IAS 21, IAS 36;
- журнал корректировок;
- отчёты SOFP, P&L и упрощённый Cash Flow;
- аналитические коэффициенты и графики;
- экспорт в Excel, JSON и XML/XBRL-like.

## Технологический стек

- Next.js 16.2.6, App Router
- React 19.2.4
- TypeScript
- npm
- Tailwind CSS 4
- shadcn-like UI components
- Recharts
- TanStack Table
- xlsx / SheetJS
- Vitest
- localStorage + TypeScript fixtures

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:3000.

## Тесты и сборка

```bash
npm run test
npm run lint
npm run build
```

## Основные страницы

- **Панель** - KPI, прогресс workflow, выбранная компания и последние события.
- **Импорт** - загрузка XLSX/CSV, предпросмотр и валидация колонок.
- **ОСВ** - локальная оборотно-сальдовая ведомость.
- **Маппинг** - ручное редактирование IFRS-строки для каждого счёта.
- **Корректировки** - применение учебных IFRS/IAS правил и согласование менеджером.
- **Отчёты** - SOFP, P&L, Cash Flow и экспорт.
- **Аналитика** - коэффициенты, структура активов, графики корректировок.
- **База знаний** - краткие карточки стандартов.
- **Журнал действий** - события localStorage-аудита.

## Упрощённые IFRS-правила

Расчёты предназначены только для образовательной демонстрации:

- IFRS 16: PV аннуитета аренды, актив права пользования, арендное обязательство, амортизация и процент.
- IFRS 9: expected credit loss по демо-возрастным корзинам дебиторской задолженности.
- IAS 16: линейная амортизация основных средств.
- IAS 21: переоценка валютной монетарной статьи.
- IAS 36: обесценение как разница между балансовой и возмещаемой суммой.
- IAS 12: отложенный налог по временной разнице.
- IFRS 15: учебная реклассификация 10% выручки в обязательство по договору.

Эти правила не являются полноценной IFRS-методологией и не заменяют профессиональное бухгалтерское, налоговое или аудиторское суждение.

## Экспорт

- Excel: отчёты, журнал корректировок и ОСВ.
- JSON: полное состояние отчёта, включая компанию, маппинг, корректировки и аналитику.
- XML/XBRL-like: учебный XML с корнем `<msfoGlobalReport>`. Это не валидный XBRL и не проходит таксономическую проверку.

## Известные ограничения

- Только образовательный прототип.
- Нет реальной аутентификации.
- Нет реального RBAC.
- Нет production-базы данных.
- Нет реальной XBRL-валидации.
- Нет ERP-интеграций.
- IFRS-расчёты сильно упрощены.
- PDF-экспорт намеренно исключён из v1.

## Roadmap

- Реальная база данных.
- Настоящие роли и RBAC.
- Адаптер 1C.
- Адаптеры Xero и QuickBooks.
- Arelle/XBRL validation.
- PDF-отчётность.
- Cloud deployment.
- Расширение набора IFRS-стандартов.

## Документация

- [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [DATA_MODEL.md](docs/DATA_MODEL.md)
- [IFRS_RULES.md](docs/IFRS_RULES.md)
- [THESIS_MAPPING.md](docs/THESIS_MAPPING.md)
- [TEST_REPORT.md](docs/TEST_REPORT.md)

## English Summary

MSFO.Global is an educational local MVP that demonstrates a simplified workflow for transforming local accounting trial balances into IFRS-style financial statements for Russia and Zambia. It uses Next.js, TypeScript, Tailwind CSS, localStorage fixtures, deterministic demo IFRS rules, charts, tables, and Excel/JSON/XML exports. It is not an audit-grade IFRS system.
