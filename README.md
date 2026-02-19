# PDD App — Подготовка к экзамену по ПДД

Backend foundation: Next.js 14 (App Router), TypeScript, Prisma, SQLite.

## Требования

- Node.js 18+
- npm или yarn

## База данных и сиды

### 1. Установка зависимостей

```bash
npm install
```

### 2. Переменные окружения

Скопируйте пример и при необходимости измените:

```bash
cp .env.example .env
```

По умолчанию используется SQLite: `DATABASE_URL="file:./dev.db"`.

### 3. Миграции Prisma

Создание/обновление схемы БД:

```bash
npx prisma migrate dev
```

При первом запуске будет создана папка `prisma/migrations` и файл БД (например, `prisma/dev.db` для SQLite).

### 4. Заполнение данными (сид)

Скрипт читает все файлы из `data/tickets/` (Билет 1.json … Билет 40.json), парсит вопросы и варианты ответов и записывает их в БД. Повторный запуск безопасен — дубликаты по `externalId` пропускаются.

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed.ts
```

Или через npm:

```bash
npm run db:seed
```

### 5. Теория (знаки, разметка, штрафы)

Импорт данных из `data/signs/signs.json`, `data/markup/markup.json`, `data/penalties/penalties.json` и опционально `data/topics/topics.json`:

```bash
npm run db:seed:theory
```

Скрипт идемпотентен (повторный запуск не создаёт дубликатов).

### 6. (Опционально) Просмотр данных

```bash
npx prisma studio
```

## Масштабирование на Postgres

Для перехода на PostgreSQL:

1. В `prisma/schema.prisma` замените `provider = "sqlite"` на `provider = "postgresql"`.
2. Установите `DATABASE_URL` в формате:  
   `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
3. Выполните:

```bash
npx prisma migrate dev
```

Схема спроектирована так, чтобы быть совместимой с PostgreSQL.
