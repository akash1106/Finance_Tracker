# Money Tracker API

Phase 1 foundation: Express, TypeScript, Prisma/PostgreSQL, Zod, Swagger, and Pino.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install dependencies: `npm install`
3. Generate the Prisma client: `npm run prisma:generate`

There are no application tables yet. `prisma migrate` is for later phases.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start with tsx watch |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled server |
| `npm test` | Jest (liveness + 404) |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create/apply migrations |

## Endpoints

- Liveness: `GET /api/v1/health`
- Readiness: `GET /api/v1/health/ready` (requires PostgreSQL)
- Swagger UI: `/api/docs`
