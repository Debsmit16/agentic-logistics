# Agentic Logistics

Warehouse-to-last-mile logistics platform (Next.js, Prisma, PostgreSQL).

## Production URLs

Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL after deploy.

## Local setup

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` (Neon **pooled** URL recommended).
2. `npm install`
3. `npm run db:migrate` or `npm run db:push`
4. `npm run db:seed`
5. `npm run dev`

Default seed owner (when no users exist): see `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` in `.env.example`.

## Deploy (Vercel + Neon)

- Build runs `prisma migrate deploy` via `build:vercel`.
- Required env: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `SMS_DEV_MODE=true` (until Fast2SMS is configured).

## Neon claimable project

If the database was created via `neon claim create`, claim it into your Neon account before expiry:

```bash
npx neon claim accept --no-open
npx neon claim status
```

Then run `npx neon auth` and link the project for long-term management.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build:vercel` | Production build with migrations |
| `npm run test:e2e` | Playwright (optional `E2E_OWNER_*` for acceptance) |
| `npm run brand:assets` | Regenerate logos from `public/logo-source.jpg` |
