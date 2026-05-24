# Руководство по запуску MSFO.Global

## Требуемое ПО

- Node.js
- npm
- Git

## Загрузка проекта

```bash
git clone https://github.com/Apartman36/msfo-global-mvp.git
cd msfo-global-mvp
```

Если проект уже лежит локально:

```powershell
cd C:\Users\hustlePC\PycharmProjects\msfo-global-mvp
```

## Установка зависимостей

```bash
npm install
```

Предупреждения `npm audit` или сообщения о funding обычно не мешают учебному запуску. Важно, чтобы установка завершилась без ошибки.

## Запуск в режиме разработки

```bash
npm run dev
```

Открыть: http://localhost:3000

Успешный запуск выглядит так: в браузере открывается панель MSFO.Global, слева видна навигация, сверху выбранная компания, а на главной странице отображаются KPI и кнопки работы с демо-данными.

## Производственная проверка

```bash
npm run build
npm run start -- -p 3000
```

Открыть: http://localhost:3000

## Команды проверки

```bash
npm run test
npm run lint
npm run build
```

Ожидаемый результат: тесты проходят, lint не показывает ошибок, build завершается успешно.

## Пример импорта CSV

В проекте есть два готовых файла:

- `data/demo_ru_trial_balance.csv`
- `data/demo_zm_trial_balance.csv`

Их можно загрузить на странице “Импорт”. Колонки соответствуют ожидаемому формату: `accountCode,accountName,accountType,debit,credit,balance,currency`.

## Частые проблемы Windows

### Порт 3000 занят

Остановить процессы Node.js:

```powershell
Stop-Process -Name node -Force
```

После этого снова выполнить:

```bash
npm run dev
```

### PowerShell не переходит в папку

Проверьте кавычки и путь:

```powershell
cd "C:\Users\hustlePC\PycharmProjects\msfo-global-mvp"
```

### npm install показывает предупреждения

Если это только warning/audit/funding, можно продолжать. Если есть `ERR!`, нужно посмотреть текст ошибки: чаще всего проблема связана с версией Node.js или сетью.

### Браузер показывает старые данные

Нажмите “Сбросить демо-данные” в верхней панели. Приложение хранит учебное состояние в localStorage.

