# Money Tracker API

Phase 1 foundation: Express, TypeScript, Prisma/PostgreSQL, Zod, Swagger, and Pino.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install dependencies: `npm install`
3. Generate the Prisma client: `npm run prisma:generate`

 Personal finance and salary tracking REST API built with Express, TypeScript, PostgreSQL, Prisma, Zod, JWT, Swagger, Pino, Jest, and Supertest.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` and a strong `JWT_SECRET` with at least 32 characters.
3. Install dependencies:

```bash
npm install
```

4. Generate the Prisma client:

```bash
npm run prisma:generate
```

5. Apply database migrations:

```bash
npm run prisma:migrate
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start with tsx watch |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled server |
| `npm test` | Jest (liveness + 404) |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create/apply migrations |

## Base URLs

```text
API:     http://localhost:3000/api/v1
Swagger: http://localhost:3000/api/docs
```

Protected endpoints require:

```http
Authorization: Bearer <JWT>
```

## Response Format

Successful response:

```json
{
	"success": true,
	"data": {},
	"message": "Operation completed successfully"
}
```

Error response:

```json
{
	"success": false,
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Request validation failed",
		"details": []
	}
}
```

## Authentication

```text
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/logout
```

Refresh tokens are not enabled. Logout acknowledges the request; the client must delete its JWT.

## Health

```text
GET /health
GET /health/ready
```

## Accounts

```text
GET    /accounts
GET    /accounts/:id
POST   /accounts
PATCH  /accounts/:id
DELETE /accounts/:id
```

Account deletion is implemented as soft deactivation.

## Income Sources

```text
GET    /income-sources
GET    /income-sources/:id
POST   /income-sources
PATCH  /income-sources/:id
DELETE /income-sources/:id
```

## Income

```text
GET    /income
GET    /income/:id
POST   /income
PATCH  /income/:id
DELETE /income/:id
```

Supported filters:

```text
from, to, incomeSource, account, isSalary, page, limit
```

## Categories and Subcategories

```text
GET    /categories
GET    /categories/:id
POST   /categories
PATCH  /categories/:id
DELETE /categories/:id

GET    /categories/:categoryId/subcategories
POST   /categories/:categoryId/subcategories
GET    /subcategories/:id
PATCH  /subcategories/:id
DELETE /subcategories/:id
```

Category deletion is implemented as soft deactivation.

## Transactions

```text
GET    /transactions
GET    /transactions/:id
POST   /transactions
PATCH  /transactions/:id
DELETE /transactions/:id
```

Supported filters:

```text
from, to, type, category, subcategory, account,
paymentMethod, page, limit, sort
```

## Budget Templates

```text
GET    /budget-templates
GET    /budget-templates/:id
POST   /budget-templates
PATCH  /budget-templates/:id
DELETE /budget-templates/:id

POST   /budget-templates/:id/items
PATCH  /budget-templates/:id/items/:itemId
DELETE /budget-templates/:id/items/:itemId
POST   /budget-templates/:id/validate
```

Active templates must have allocation percentages totaling exactly `100%`.

## Monthly Budgets

```text
GET  /budgets
POST /budgets/generate
GET  /budgets/:id
GET  /budgets/:id/summary
GET  /budgets/:id/items
GET  /budgets/:id/items/:itemId
```

Budget usage statuses are `NORMAL`, `WARNING`, and `EXCEEDED`. Transactions are never blocked by budget limits.

## Fixed Expenses

```text
GET    /fixed-expenses
GET    /fixed-expenses/:id
POST   /fixed-expenses
PATCH  /fixed-expenses/:id
DELETE /fixed-expenses/:id
POST   /fixed-expenses/:id/generate
```

Supported frequencies: `WEEKLY`, `MONTHLY`, `YEARLY`.

## Recurring Transactions

```text
GET    /recurring-transactions
GET    /recurring-transactions/:id
POST   /recurring-transactions
PATCH  /recurring-transactions/:id
DELETE /recurring-transactions/:id
POST   /recurring-transactions/:id/generate
```

Generated planned transactions are stored as regular transactions linked through `recurringTransactionId`.

## Savings Goals

```text
GET    /savings-goals
GET    /savings-goals/:id
POST   /savings-goals
PATCH  /savings-goals/:id
DELETE /savings-goals/:id

GET    /savings-goals/:id/contributions
POST   /savings-goals/:id/contributions
DELETE /savings-goals/:id/contributions/:contributionId
```

## Investments

```text
GET    /investments
GET    /investments/:id
POST   /investments
PATCH  /investments/:id
DELETE /investments/:id

GET    /investments/:id/contributions
POST   /investments/:id/contributions
DELETE /investments/:id/contributions/:contributionId
```

## Loans and EMI

```text
GET    /loans
GET    /loans/:id
POST   /loans
PATCH  /loans/:id
DELETE /loans/:id

GET    /loans/:id/payments
POST   /loans/:id/payments
DELETE /loans/:id/payments/:paymentId
```

Loan payment records create linked `LOAN_PAYMENT` transactions and expose paid amount and remaining principal.

## Financial Goals

```text
GET    /financial-goals
GET    /financial-goals/:id
POST   /financial-goals
PATCH  /financial-goals/:id
DELETE /financial-goals/:id

GET    /financial-goals/:id/contributions
POST   /financial-goals/:id/contributions
DELETE /financial-goals/:id/contributions/:contributionId
```

## Dashboard

```text
GET /dashboard
GET /dashboard/cash-flow
GET /dashboard/expense-breakdown
GET /dashboard/income-breakdown
GET /dashboard/budget-utilization
GET /dashboard/savings
GET /dashboard/investments
GET /dashboard/net-worth
```

## Reports

```text
GET /reports/monthly
GET /reports/yearly
GET /reports/net-worth
GET /reports/category
GET /reports/cash-flow
```

## Analytics

```text
GET /analytics/spending-trends
GET /analytics/category-trends
GET /analytics/budget-performance
GET /analytics/savings-rate
GET /analytics/fixed-expense-ratio
GET /analytics/income-growth
GET /analytics/spending-anomalies
```

## Net Worth

```text
GET /net-worth
GET /net-worth/history
```

## Notifications

```text
GET   /notifications
GET   /notifications/unread
PATCH /notifications/:id/read
PATCH /notifications/read-all
```

## Exports

```text
GET /exports/transactions?format=CSV
GET /exports/transactions?format=XLSX
GET /exports/monthly-report?year=2026&month=9
GET /exports/yearly-report?year=2026
```

## Testing

The test suite covers route protection, validation, CRUD paths, budget generation, recurring generation, contributions, reports, analytics, exports, and database lifecycle paths.

```bash
npm test -- --runInBand
npm test -- --runInBand --coverage
```

## Endpoints

- Liveness: `GET /api/v1/health`
- Readiness: `GET /api/v1/health/ready` (requires PostgreSQL)
- Swagger UI: `/api/docs`
