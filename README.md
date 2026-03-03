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

