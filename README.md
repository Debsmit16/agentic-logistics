# Agentic Logistics (RBAC foundation)

Greenfield core inspired by [Plexi-ERP](https://github.com/Flexicom-Industries-Pvt-Ltd/Plexi-ERP) patterns:

- **Roles** with per-module **Create / Read / Update / Delete** flags
- **Audit logs** (action, module, entity, user, IP, user-agent)
- **Profile** (name, phone, password)
- **Module shells** for Parcels, Warehouse, Delivery, Finance, Settings

## Setup

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL + AUTH_SECRET
npx prisma migrate dev --name init_rbac
npm run db:seed
npm run dev
```

Login: `admin@agenticlogistics.in` / `admin123` (or `SEED_ADMIN_PASSWORD`).

## Adding a feature module

1. Add enum value to `AppModule` in `prisma/schema.prisma` if needed.
2. Add nav entry in `src/lib/nav.ts`.
3. Guard pages with `requirePermission(AppModule.X, "canRead")`.
4. Guard APIs with `requireApiPermission` and call `logAudit` on writes.

