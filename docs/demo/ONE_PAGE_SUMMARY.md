# MSFO.Global — краткое описание

## Назначение

MSFO.Global — учебный прототип цифровой платформы для демонстрационной трансформации локальных бухгалтерских данных в упрощенную IFRS/MSFO-отчетность для России и Замбии.

Тема: “Digital platform MSFO.Global: an integrated solution for implementing International Financial Reporting Standards (IFRS/MSFO) in Russia and Zambia.”

GitHub: https://github.com/Apartman36/msfo-global-mvp

## Ключевые возможности

- выбор компании и юрисдикции: Россия/RUB и Zambia/ZMW;
- загрузка демо-данных;
- импорт XLSX/CSV;
- просмотр оборотно-сальдовой ведомости;
- маппинг локальных счетов на IFRS-строки;
- упрощенные корректировки IFRS 9, IFRS 15, IFRS 16, IAS 12, IAS 16, IAS 21, IAS 36;
- отчеты SOFP, P&L и упрощенный Cash Flow;
- аналитические коэффициенты и графики;
- журнал действий;
- экспорт Excel, JSON и XML/XBRL-like.

## Технологии

Next.js, React, TypeScript, Tailwind CSS, TanStack Table, Recharts, SheetJS/xlsx, Vitest, localStorage.

## Workflow

1. Загрузить демо-данные или импортировать CSV/XLSX.
2. Проверить ОСВ.
3. Проверить маппинг счетов.
4. Применить упрощенные правила МСФО.
5. Посмотреть отчеты.
6. Открыть аналитику.
7. Экспортировать результат.

## Демо-данные

Данные синтетические. Они нужны только для безопасной демонстрации логики платформы. Для проверки импорта есть файлы:

- `data/demo_ru_trial_balance.csv`
- `data/demo_zm_trial_balance.csv`

## Выходные результаты

Приложение формирует экранные отчеты, Excel-файл, JSON и учебный XML/XBRL-like. XML не является настоящим валидным XBRL.

## Ограничения

Это не промышленная система и не аудиторский инструмент. Нет backend, production-базы данных, настоящей авторизации, ERP-интеграции и реальной XBRL-валидации. Правила МСФО упрощены.

## Запуск

```bash
git clone https://github.com/Apartman36/msfo-global-mvp.git
cd msfo-global-mvp
npm install
npm run dev
```

Открыть http://localhost:3000.

