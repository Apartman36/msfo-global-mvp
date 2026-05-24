# Test Report

Дата последней проверки: 2026-05-24.

## Команды

```bash
npm run test
npm run lint
npm run build
```

## Реализованные тесты

- `tests/ifrs-rules.test.ts` - IFRS 16 PV и амортизация, IFRS 9 ECL, IAS 21 FX difference.
- `tests/mapping.test.ts` - группировка локальных счетов в IFRS-строки.
- `tests/statements.test.ts` - генерация SOFP, P&L и Cash Flow.
- `tests/analytics.test.ts` - коэффициенты не падают на нулевых знаменателях.

## Текущий статус

- Vitest: проходит.
- ESLint: проходит.
- Next.js build: проходит.

## Известные ограничения тестирования

- Playwright smoke test не включён как обязательный gate в v1.
- Экспорт Excel проверяется через рабочую UI-кнопку и SheetJS, но без отдельного e2e assert.
- Расчёты проверяют детерминированные учебные формулы, не audit-grade IFRS методологию.
