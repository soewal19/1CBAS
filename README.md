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

### Hosted deployment health check (Vercel)

Use this to verify that hosted UI, API and document input flow are working:

```bash
# Run only hosted checks
HOSTED_BASE_URL=https://1cbas-public-20260304.vercel.app npx playwright test tests/e2e/hosting.spec.js
```

For split hosting (frontend + backend on different domains):

```bash
HOSTED_BASE_URL=https://your-frontend.vercel.app HOSTED_API_BASE_URL=https://your-backend.vercel.app/api npx playwright test tests/e2e/hosting.spec.js
```

Current deployed example:
- Frontend: `https://1cbas-public-20260304.vercel.app`
- Backend: `https://backend-pedros-projects-06014566.vercel.app`

Expected:
- `/api/products` returns `application/json`
- creating a new `Order` from UI redirects to `/documents` without `Error processing document`

If this test fails with HTML from `/api/*`:
- frontend is deployed, but backend API is not reachable in hosted environment
- data input will fail with `Error processing document`

### Frontend runtime API configuration

Frontend now uses runtime env vars instead of hardcoded localhost:

- `VITE_API_BASE_URL` (default: `/api`)
- `VITE_SOCKET_URL` (default: current origin)

Examples:

```bash
# local dev (with Vite proxy)
VITE_API_BASE_URL=/api

# hosted frontend + external backend
VITE_API_BASE_URL=https://your-backend.example.com/api
VITE_SOCKET_URL=https://your-backend.example.com
```

---

## RU: Локальный запуск (актуально)

### 1) Backend

```bash
npm install
npm start
```

По умолчанию backend стартует на `http://localhost:3000`.

Опционально можно задать переменные (пример в `server/.env.example`):

- `PORT` (по умолчанию `3000`)
- `DB_PATH` (по умолчанию `server/1cremix.db`)

### 2) Frontend

```bash
cd client
npm install
```

Создайте `client/.env` на основе `client/.env.example`:

```env
VITE_API_BASE_URL=/api
VITE_SOCKET_URL=http://localhost:3000
```

Запуск:

```bash
npm run dev
```

Frontend: `http://localhost:5173`, API через Vite proxy: `/api`.

### 3) Проверка hosted-инстанса

```bash
HOSTED_BASE_URL=https://1cbas-public-20260304.vercel.app npx playwright test tests/e2e/hosting.spec.js
```

Если `/api/products` возвращает `text/html`, значит на хостинге опубликован только frontend, без рабочего backend.

## RU: Как развернуть backend отдельно и связать с Vercel frontend

### Вариант A: Render (рекомендуется для SQLite)

В репозитории добавлен `render.yaml`:
- сервис `1cbas-backend`
- health check: `/api/products`
- persistent disk
- `DB_PATH=/opt/render/project/data/1cremix.db`

Шаги:
1. Создать Web Service на Render из этого репозитория.
2. Убедиться, что применился `render.yaml`.
3. Получить URL backend, например `https://1cbas-backend.onrender.com`.

### Вариант B: Railway

В репозитории добавлен `railway.json` (старт: `npm start`).
Важно: для SQLite нужна постоянная файловая система; без volume данные могут теряться между перезапусками.

### Связка с frontend (Vercel)

В Vercel Project -> Settings -> Environment Variables:

- `VITE_API_BASE_URL=https://<your-backend-domain>/api`
- `VITE_SOCKET_URL=https://<your-backend-domain>`

После этого сделать `Redeploy`.

В `ci-cd/vercel.json` убран rewrite `/api/*`, чтобы API-ошибки не маскировались под `index.html`.

Примечание для backend на Vercel:
- текущий serverless backend использует in-memory storage в runtime
- данные не гарантированно сохраняются между cold start/redeploy
- для постоянного хранения нужен внешний DB (PostgreSQL/MySQL/managed SQLite)

---

## EN: Local run (updated)

### 1) Backend

```bash
npm install
npm start
```

Default backend URL: `http://localhost:3000`.

Optional env vars (see `server/.env.example`):

- `PORT` (default `3000`)
- `DB_PATH` (default `server/1cremix.db`)

### 2) Frontend

```bash
cd client
npm install
```

Create `client/.env` from `client/.env.example`:

```env
VITE_API_BASE_URL=/api
VITE_SOCKET_URL=http://localhost:3000
```

Run:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`, API is proxied via `/api`.

### 3) Hosted health check

```bash
HOSTED_BASE_URL=https://1cbas-public-20260304.vercel.app npx playwright test tests/e2e/hosting.spec.js
```

If `/api/products` returns `text/html`, only frontend is deployed and backend is not reachable.

## EN: Deploy backend separately and connect to Vercel frontend

### Option A: Render (recommended for SQLite)

Added `render.yaml` with:
- web service `1cbas-backend`
- health check `/api/products`
- persistent disk
- `DB_PATH=/opt/render/project/data/1cremix.db`

Steps:
1. Create a Render Web Service from this repo.
2. Ensure `render.yaml` settings are applied.
3. Get backend URL, e.g. `https://1cbas-backend.onrender.com`.

### Option B: Railway

Added `railway.json` (`npm start`).
Important: SQLite needs persistent storage; without volume support data can reset.

### Connect frontend (Vercel)

In Vercel Project -> Settings -> Environment Variables:

- `VITE_API_BASE_URL=https://<your-backend-domain>/api`
- `VITE_SOCKET_URL=https://<your-backend-domain>`

Then trigger `Redeploy`.

`ci-cd/vercel.json` is now frontend-only and no longer rewrites `/api/*` to `index.html`.

Note for backend on Vercel:
- current serverless backend uses in-memory runtime storage
- data is not guaranteed to persist across cold starts/redeploys
- use external DB (PostgreSQL/MySQL/managed SQLite) for durable data

---

## RU: Ссылки на хостинг

- Frontend (Vercel): `https://1cbas-public-20260304.vercel.app`
- Backend API (Vercel): `https://backend-pedros-projects-06014566.vercel.app/api`
- Полная инструкция по локальному запуску: `LOCAL_SETUP.md`

## EN: Hosting links

- Frontend (Vercel): `https://1cbas-public-20260304.vercel.app`
- Backend API (Vercel): `https://backend-pedros-projects-06014566.vercel.app/api`
- Full local setup instructions: `LOCAL_SETUP.md`

---

## Docs / Документация

- C4 architecture: `docs/C4.md`
- Database documentation: `docs/database.md`
- Local setup guide: `LOCAL_SETUP.md`

## Vercel Hosting Links / Ссылки на Vercel

- Frontend: `https://1cbas-public-20260304.vercel.app`
- Backend API: `https://backend-pedros-projects-06014566.vercel.app/api`

## Graphical File Scheme / Графическая схема файлов

```text
1CBAS/
├─ api/
│  └─ index.js
├─ ci-cd/
│  ├─ github-actions-ci.yml
│  ├─ README.md
│  ├─ vercel.backend.json
│  └─ vercel.json
├─ client/
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ index.html
│  ├─ eslint.config.js
│  ├─ postcss.config.js
│  ├─ tailwind.config.js
│  ├─ vite.config.js
│  ├─ README.md
│  ├─ .env.example
│  ├─ public/
│  │  └─ vite.svg
│  └─ src/
│     ├─ App.jsx
│     ├─ App.css
│     ├─ index.css
│     ├─ main.jsx
│     ├─ assets/
│     │  └─ react.svg
│     ├─ components/
│     │  ├─ Loader.jsx
│     │  └─ Preloader.jsx
│     ├─ config/
│     │  └─ runtime.js
│     ├─ context/
│     │  └─ NotificationContext.jsx
│     ├─ pages/
│     │  ├─ Dashboard.jsx
│     │  ├─ DocumentEditor.jsx
│     │  ├─ Documents.jsx
│     │  ├─ Help.jsx
│     │  ├─ Notifications.jsx
│     │  ├─ Reports.jsx
│     │  ├─ SessionManager.jsx
│     │  ├─ Settings.jsx
│     │  └─ Tasks.jsx
│     └─ store/
│        └─ documentStore.js
├─ docs/
│  ├─ C4.md
│  └─ database.md
├─ server/
│  ├─ 1cbas.db
│  ├─ 1cremix.db
│  ├─ db.js
│  ├─ logger.js
│  ├─ seed.js
│  ├─ server.js
│  ├─ .env.example
│  ├─ controllers/
│  │  ├─ documentsController.js
│  │  ├─ productsController.js
│  │  └─ reportsController.js
│  ├─ repositories/
│  │  ├─ documentRepository.js
│  │  ├─ inventoryRepository.js
│  │  ├─ productRepository.js
│  │  └─ reportsRepository.js
│  └─ services/
│     ├─ documentsService.js
│     ├─ productsService.js
│     └─ reportsService.js
├─ tests/
│  └─ e2e/
│     ├─ hosting.spec.js
│     └─ inventory.spec.js
├─ LOCAL_SETUP.md
├─ README.md
├─ package.json
├─ package-lock.json
├─ playwright.config.js
├─ postcss.config.js
├─ railway.json
├─ render.yaml
└─ tailwind.config.js
```

## File Catalog (RU/EN) / Каталог файлов (RU/EN)

| File | RU description | EN description |
|---|---|---|
| `api/index.js` | Serverless backend для Vercel с REST API. | Serverless Vercel backend implementing REST API. |
| `ci-cd/github-actions-ci.yml` | CI пайплайн (GitHub Actions). | CI pipeline (GitHub Actions). |
| `ci-cd/README.md` | Документация по CI/CD. | CI/CD documentation. |
| `ci-cd/vercel.backend.json` | Конфиг деплоя backend на Vercel. | Vercel backend deployment config. |
| `ci-cd/vercel.json` | Frontend-only Vercel конфигурация. | Frontend-only Vercel configuration. |
| `client/package.json` | Скрипты и зависимости frontend. | Frontend scripts and dependencies. |
| `client/package-lock.json` | Lockfile frontend зависимостей. | Frontend dependency lockfile. |
| `client/index.html` | HTML-шаблон Vite приложения. | Vite app HTML template. |
| `client/eslint.config.js` | Правила линтинга frontend. | Frontend lint configuration. |
| `client/postcss.config.js` | PostCSS конфиг frontend. | Frontend PostCSS config. |
| `client/tailwind.config.js` | Tailwind конфиг frontend. | Frontend Tailwind config. |
| `client/vite.config.js` | Конфиг Vite и proxy. | Vite config and proxy setup. |
| `client/README.md` | Локальная документация frontend. | Frontend-local documentation. |
| `client/.env.example` | Пример env для frontend runtime. | Frontend runtime env example. |
| `client/public/vite.svg` | Статический SVG ассет Vite. | Static Vite SVG asset. |
| `client/src/App.jsx` | Основной layout и маршруты UI. | Main UI layout and routes. |
| `client/src/App.css` | Стили уровня приложения. | App-level styles. |
| `client/src/index.css` | Глобальные CSS стили. | Global CSS styles. |
| `client/src/main.jsx` | Точка входа React приложения. | React app bootstrap entry. |
| `client/src/assets/react.svg` | SVG ассет React. | React SVG asset. |
| `client/src/components/Loader.jsx` | Компонент loader/индикатора загрузки. | Loader/spinner UI component. |
| `client/src/components/Preloader.jsx` | Прелоадер стартового экрана. | Startup preloader component. |
| `client/src/config/runtime.js` | Runtime API/Socket конфигурация через env. | Runtime API/socket config via env. |
| `client/src/context/NotificationContext.jsx` | Контекст toast/уведомлений. | Toast/notification context provider. |
| `client/src/pages/Dashboard.jsx` | Экран дашборда и KPI. | Dashboard and KPI page. |
| `client/src/pages/DocumentEditor.jsx` | Редактор документа (создание/изменение). | Document editor (create/update). |
| `client/src/pages/Documents.jsx` | Реестр документов с фильтрами. | Document registry with filters. |
| `client/src/pages/Help.jsx` | Страница справки/инструкций. | Help/instructions page. |
| `client/src/pages/Notifications.jsx` | Экран уведомлений пользователя. | User notifications page. |
| `client/src/pages/Reports.jsx` | Отчеты (прибыль/склад), экспорт CSV. | Reports (profit/inventory), CSV export. |
| `client/src/pages/SessionManager.jsx` | Управление пользовательской сессией. | User session management page. |
| `client/src/pages/Settings.jsx` | Экран настроек приложения. | Application settings page. |
| `client/src/pages/Tasks.jsx` | Экран задач/активностей. | Tasks/activities page. |
| `client/src/store/documentStore.js` | Zustand store документов + sockets. | Zustand document store + sockets. |
| `docs/C4.md` | Подробная C4 архитектура RU/EN. | Detailed C4 architecture RU/EN. |
| `docs/database.md` | Подробная документация БД RU/EN. | Detailed DB documentation RU/EN. |
| `server/1cbas.db` | SQLite snapshot (дополнительная база). | SQLite snapshot (additional DB). |
| `server/1cremix.db` | Основная локальная SQLite база. | Main local SQLite database. |
| `server/db.js` | Инициализация БД и схемы. | DB initialization and schema setup. |
| `server/logger.js` | Настройка winston логгера. | Winston logger configuration. |
| `server/seed.js` | Скрипт seed данных products. | Product seed script. |
| `server/server.js` | Express backend и маршруты API. | Express backend and API routes. |
| `server/.env.example` | Пример env для backend. | Backend env example. |
| `server/controllers/documentsController.js` | Контроллер документов (HTTP слой). | Documents HTTP controller. |
| `server/controllers/productsController.js` | Контроллер products API. | Products API controller. |
| `server/controllers/reportsController.js` | Контроллер отчетов API. | Reports API controller. |
| `server/repositories/documentRepository.js` | SQL-операции по документам. | Document SQL repository layer. |
| `server/repositories/inventoryRepository.js` | SQL-операции по складу/FIFO. | Inventory/FIFO SQL repository. |
| `server/repositories/productRepository.js` | SQL-операции по товарам. | Product SQL repository. |
| `server/repositories/reportsRepository.js` | SQL-операции для отчетов. | Reports SQL repository. |
| `server/services/documentsService.js` | Бизнес-логика документов/posting. | Documents/posting business logic. |
| `server/services/productsService.js` | Бизнес-логика продуктов. | Product business logic. |
| `server/services/reportsService.js` | Бизнес-логика отчетов. | Reports business logic. |
| `tests/e2e/hosting.spec.js` | E2E проверка hosted split-hosting. | Hosted split-hosting E2E checks. |
| `tests/e2e/inventory.spec.js` | E2E ключевых ERP сценариев. | Core ERP scenario E2E tests. |
| `LOCAL_SETUP.md` | Пошаговый локальный запуск RU/EN. | Step-by-step local setup RU/EN. |
| `README.md` | Главная документация проекта. | Main project documentation. |
| `package.json` | Root scripts и backend зависимости. | Root scripts and backend dependencies. |
| `package-lock.json` | Root lockfile зависимостей. | Root dependency lockfile. |
| `playwright.config.js` | Конфиг Playwright E2E. | Playwright E2E configuration. |
| `postcss.config.js` | Root PostCSS конфиг. | Root PostCSS configuration. |
| `railway.json` | Манифест деплоя Railway. | Railway deployment manifest. |
| `render.yaml` | Манифест деплоя Render. | Render deployment manifest. |
| `tailwind.config.js` | Root Tailwind конфиг. | Root Tailwind configuration. |
