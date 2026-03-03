# BAS Reborn (1CBAS)

Русская и английская инструкция по запуску и работе с приложением.

---

## RU

### О проекте

`BAS Reborn` — учебное ERP‑приложение с:

- реестром документов (Order, PurchaseInvoice, SalesInvoice, InvoiceFactor, TaxInvoice)
- проведением документов (в т.ч. FIFO для склада)
- отчетами (прибыль, склад)
- Swagger/OpenAPI документацией

### Структура

- `server/` — Node.js + Express API + SQLite
- `client/` — React + Vite фронтенд
- `server/1cremix.db` — активная база данных (важно)

### Требования

- Node.js 18+
- npm 9+

### Быстрый запуск

1. Установить зависимости в корне:

```bash
npm install
```

2. Установить зависимости фронтенда:

```bash
cd client
npm install
```

3. Запустить backend (из корня проекта):

```bash
node server/server.js
```

4. Запустить frontend (в отдельном терминале):

```bash
cd client
npm run dev
```

### Адреса

- UI: `http://localhost:5173`
- Swagger через frontend proxy: `http://localhost:5173/api-docs`
- Swagger напрямую с backend: `http://localhost:3000/api-docs`
- API: `http://localhost:3000/api/...`

### Запуск E2E тестов (Playwright)

Важно: в `playwright.config.js` базовый URL тестов — `http://localhost:5175`.

1. Установить браузеры Playwright (один раз):

```bash
npx playwright install
```

2. Запустить backend (терминал 1, из корня):

```bash
node server/server.js
```

3. Запустить frontend на порту `5175` (терминал 2):

```bash
cd client
npm run dev -- --port 5175
```

4. Запустить E2E тесты (терминал 3, из корня):

```bash
npx playwright test
```

Полезные команды:

```bash
# Запуск одного файла
npx playwright test tests/e2e/inventory.spec.js

# Режим с UI браузера
npx playwright test --headed

# HTML-репорт (если включен)
npx playwright show-report
```

### Основные сценарии

1. Документы:
- Перейдите в `Documents`
- Создайте новый документ
- В редакторе доступны: выбор даты, добавление строк, выбор/перемещение/удаление строк, генерация строк

2. Отчеты:
- Перейдите в `Reports`
- Выберите период (`start`/`end`) через datepicker
- Нажмите `Generate` или `Export`

### Важно по отчету прибыли

Если в блоке прибыли всегда `0`, значит в базе нет движений `OUT` (списаний со склада).
Для появления прибыли нужно:

1. Иметь остаток товара (обычно после `PurchaseInvoice` + `Post`)
2. Провести `SalesInvoice` (`Post`)
3. Выбрать период, включающий дату проведения

### Текущие особенности

- Экспорт отчета формирует CSV с секциями прибыли и склада
- Фильтр типов документов реализован в UI и на backend
- Swagger доступен и на `5173/api-docs`, и на `3000/api-docs`

---

## EN

### About

`BAS Reborn` is a training ERP-style app with:

- document registry (Order, PurchaseInvoice, SalesInvoice, InvoiceFactor, TaxInvoice)
- document posting (including FIFO inventory logic)
- reports (profit, inventory)
- Swagger/OpenAPI docs

### Project layout

- `server/` — Node.js + Express API + SQLite
- `client/` — React + Vite frontend
- `server/1cremix.db` — active database (important)

### Requirements

- Node.js 18+
- npm 9+

### Quick start

1. Install root dependencies:

```bash
npm install
```

2. Install frontend dependencies:

```bash
cd client
npm install
```

3. Start backend (from project root):

```bash
node server/server.js
```

4. Start frontend (in a second terminal):

```bash
cd client
npm run dev
```

### URLs

- UI: `http://localhost:5173`
- Swagger via frontend proxy: `http://localhost:5173/api-docs`
- Swagger directly on backend: `http://localhost:3000/api-docs`
- API: `http://localhost:3000/api/...`

### Running E2E tests (Playwright)

Important: `playwright.config.js` uses `http://localhost:5175` as `baseURL`.

1. Install Playwright browsers (once):

```bash
npx playwright install
```

2. Start backend (terminal 1, project root):

```bash
node server/server.js
```

3. Start frontend on port `5175` (terminal 2):

```bash
cd client
npm run dev -- --port 5175
```

4. Run E2E tests (terminal 3, project root):

```bash
npx playwright test
```

Useful commands:

```bash
# Run a single spec
npx playwright test tests/e2e/inventory.spec.js

# Headed mode
npx playwright test --headed

# HTML report (if available)
npx playwright show-report
```

### Main flows

1. Documents:
- Open `Documents`
- Create a new document
- In editor you can set date, add/select/move/delete lines, and generate lines

2. Reports:
- Open `Reports`
- Pick period (`start`/`end`) with datepickers
- Click `Generate` or `Export`

### Profit report note

If profit stays `0`, your DB likely has no `OUT` inventory transactions.
To get profit rows:

1. Create stock (usually `PurchaseInvoice` + `Post`)
2. Post a `SalesInvoice`
3. Pick a report period that includes posting date

### Current behavior highlights

- Report export creates CSV with both profit and inventory sections
- Document type filter works in UI and backend
- Swagger is available on both `5173/api-docs` and `3000/api-docs`
