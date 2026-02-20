# PDD Russia by tw1nkle

Приложение для подготовки к теоретическому экзамену ПДД РФ.

Features:
- Тренировка по темам
- Симулятор экзамена
- Теория (знаки, разметка, штрафы)
- Разбор ошибок
- Мотивационные цитаты

Built with Next.js, Prisma, SQLite.

## Neon + Vercel environment variables

- **On Vercel:**  
  - `DATABASE_URL` = Neon **pooled** URL (e.g. `POSTGRES_PRISMA_URL` from the Neon integration).  
  - `DIRECT_URL` = Neon **non-pooled** URL (e.g. `DATABASE_URL_UNPOOLED` or `POSTGRES_URL_NON_POOLING`).  
  The app uses the pooled URL at runtime; Prisma uses the direct URL for migrations and long-running operations.

- **For local dev:**  
  You can temporarily set `DATABASE_URL` to the same value as `DIRECT_URL` to reduce connection churn, but keep both defined so `prisma migrate` and `prisma db seed` work correctly.
