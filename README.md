# Agentic Logistics Monorepo

Enterprise-grade autonomous freight orchestration platform and public brand website.

```
agentic-logistics/
├── erp/                  # Enterprise Logistics ERP & Management Console (Port 3000)
│   ├── src/app/          # Next.js App Router (RBAC, Warehouses, Dispatches, Audits)
│   ├── prisma/           # PostgreSQL/SQLite schema & migrations
│   └── public/           # Shared brand assets & enterprise imagery
│
├── website/              # Public-facing Marketing & Tracking Portal (Port 3001)
│   ├── src/app/          # Solutions, Global Network, Live Telemetry Tracking, Company, Contact
│   └── public/           # Brand emblems and high-res architectural assets
│
└── package.json          # Root npm workspaces orchestrator
```

---

## Quick Start

### 1. Launch ERP Console (`http://localhost:3000`)
```bash
npm run dev:erp
# Or from inside erp/: cd erp && npm run dev
```
- **Login**: `admin@agenticlogistics.in` / `admin123`
- **Features**: Live Waybill Dispatches, Fleet Telemetry, Bay Allocation, Audit Logs, RBAC.

### 2. Launch Marketing Website (`http://localhost:3001`)
```bash
npm run dev:website
# Or from inside website/: cd website && npm run dev
```
- **Port**: `3001` (prevents port conflicts with ERP).
- **Features**: Interactive Waybill Tracking, 42-Hub Global Network Directory, Solutions Showcase, Enterprise Demo Request form, direct link to ERP Console.

---

## Monorepo Commands

| Command | Description |
|---|---|
| `npm run dev:erp` | Start ERP dev server on port `3000` |
| `npm run dev:website` | Start Website dev server on port `3001` |
| `npm run dev:desktop` | Launch Electron desktop wrapper |
| `npm run build:desktop` | Build customized Windows NSIS desktop installer |
| `npm run typecheck:erp` | TypeScript verification for ERP |
| `npm run typecheck:website` | TypeScript verification for Website |
| `npm run build:erp` | Production build for ERP |
| `npm run build:website` | Production build for Website |

---

## Deployment & Database Setup

### ERP Environment Configuration
In `erp/.env.local`:
```bash
DATABASE_URL="your-database-url"
DATABASE_URL_UNPOOLED="your-direct-database-url"
AUTH_SECRET="random-string-at-least-32-chars-long"
```

To run migrations and seed data in ERP:
```bash
cd erp
npx prisma migrate deploy
npm run db:seed
```
