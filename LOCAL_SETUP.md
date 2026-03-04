# Local Setup / Локальный запуск

## RU

### 1. Требования

- Node.js 18+ (рекомендуется 20/22)
- npm 9+

### 2. Установка зависимостей

Из корня проекта:

```bash
npm install
```

Для frontend:

```bash
cd client
npm install
cd ..
```

### 3. Настройка переменных окружения

Backend (опционально), файл `server/.env`:

```env
PORT=3000
DB_PATH=server/1cremix.db
```

Frontend, файл `client/.env`:

```env
VITE_API_BASE_URL=/api
VITE_SOCKET_URL=http://localhost:3000
```

### 4. Запуск приложения локально

Терминал 1 (backend):

```bash
npm start
```

Терминал 2 (frontend):

```bash
cd client
npm run dev
```

### 5. Проверка

- UI: `http://localhost:5173`
- API: `http://localhost:3000/api/products`
- Swagger backend: `http://localhost:3000/api-docs`
- Swagger через frontend proxy: `http://localhost:5173/api-docs`

### 6. (Опционально) Seed данных

```bash
npm run seed
```

### 7. E2E тесты локально

```bash
npx playwright install
npx playwright test
```

---

## EN

### 1. Requirements

- Node.js 18+ (20/22 recommended)
- npm 9+

### 2. Install dependencies

From repository root:

```bash
npm install
```

Frontend dependencies:

```bash
cd client
npm install
cd ..
```

### 3. Configure environment variables

Backend (optional), create `server/.env`:

```env
PORT=3000
DB_PATH=server/1cremix.db
```

Frontend, create `client/.env`:

```env
VITE_API_BASE_URL=/api
VITE_SOCKET_URL=http://localhost:3000
```

### 4. Run locally

Terminal 1 (backend):

```bash
npm start
```

Terminal 2 (frontend):

```bash
cd client
npm run dev
```

### 5. Verify

- UI: `http://localhost:5173`
- API: `http://localhost:3000/api/products`
- Backend Swagger: `http://localhost:3000/api-docs`
- Swagger via frontend proxy: `http://localhost:5173/api-docs`

### 6. (Optional) Seed data

```bash
npm run seed
```

### 7. Local E2E tests

```bash
npx playwright install
npx playwright test
```
