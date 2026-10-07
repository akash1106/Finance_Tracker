# 💰 Money Tracker — Personal Finance & Wealth Management System

A production-ready, full-stack personal finance application designed for complete financial visibility, zero-based salary budgeting, investment portfolio tracking, loan/EMI management, automated financial analytics, and archival reporting.

---

## 🏛️ System Architecture

This repository is structured as a full-stack monorepo with an Express REST API backend and a Next.js (App Router + Turbopack) frontend.

```
money-tracker/
├── backend/                     # Node.js + Express + Prisma + PostgreSQL REST API
│   ├── prisma/                  # Prisma schema and database migrations
│   ├── src/                     # Modular TypeScript source code
│   │   ├── config/              # Database, environment, and logger configuration
│   │   ├── middleware/          # JWT authentication, validation, rate limiting
│   │   ├── modules/             # Domain modules (auth, accounts, budgets, etc.)
│   │   └── utils/               # AppError, asyncHandler, pagination helpers
│   └── tests/                   # Jest + Supertest comprehensive test suites
│
└── finance-tracker-frontend/    # Next.js 16 + React 19 + Tailwind CSS + TanStack Query
    ├── src/
    │   ├── app/                 # App Router pages and route handlers (52 routes)
    │   ├── components/          # Reusable UI component library (cards, tables, forms, ui)
    │   ├── features/            # Authentication providers and stores
    │   ├── hooks/               # TanStack React Query custom domain hooks
    │   ├── lib/                 # API clients, formatters (currency, date), constants
    │   └── types/               # TypeScript interfaces and domain schemas
```

---

## 🚀 Technology Stack

### **Backend (`/backend`)**
- **Runtime & Language**: Node.js, TypeScript
- **Framework**: Express.js
- **Database ORM**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens), BCrypt password hashing (12 rounds), HttpOnly cookies
- **Validation**: Zod schema validation middleware
- **Documentation**: OpenAPI / Swagger UI (`/api/docs`)
- **Export Engines**: ExcelJS (XLSX spreadsheets), PDFKit (PDF financial statements)
- **Logging & Security**: Pino structured logger, Helmet, CORS, Express Rate Limit
- **Testing**: Jest, Supertest (11 test suites, 72/72 tests passing)

### **Frontend (`/finance-tracker-frontend`)**
- **Framework**: Next.js 16 (App Router with Turbopack)
- **UI Library**: React 19, Tailwind CSS v4, Lucide React icons
- **State & Server Cache**: TanStack React Query v5, Zustand UI store
- **Form Management**: React Hook Form, Zod schema resolvers
- **Localization**: Indian Rupee (`₹` INR) Vedic numbering (Lakhs & Crores) and international formatters
- **Feedback & Alerts**: Sonner toast system, accessible dialog modals, responsive mobile sidebar

---

## ✨ Core Features & Functional Modules

### 1. 🔐 Authentication & Profile Management
- Secure user registration, credential login, and session persistence via HttpOnly cookies and Bearer tokens.
- Profile settings to manage user legal display name, email verification status, and cryptographic password updates with BCrypt safeguards.

### 2. 💳 Multi-Account Ledger Management
- Multi-account tracking: Bank Savings, Checking, Credit Cards, Digital Wallets, and Cash Reserves.
- Opening balances and dynamic live balance computation updated by income, expenses, savings deposits, and loan repayments.

### 3. 💸 Transaction Tracking & Double-Entry Verification
- Record income, expense, and savings transactions with category, subcategory, account, date, and payment method tags.
- Automatic account balance synchronization upon transaction creation, edit, or deletion.

### 4. 💵 Income & Zero-Based Salary Allocation
- Track recurring salaries, freelance earnings, bonuses, dividends, and gifts.
- Allocate incoming salary across custom budget envelopes ensuring zero-based budgeting principles.

### 5. 📊 Monthly Budgets & Reusable Templates
- Create custom allocation templates with strict 100% total allocation validation.
- Generate monthly budgets linked directly to salary deposits.
- Real-time budget utilization status: `NORMAL` (<80%), `WARNING` (80–100%), and `EXCEEDED` (>100%).

### 6. 🔄 Fixed Expenses & Recurring Rules
- Maintain recurring obligations (rent, utility subscriptions, memberships) with `WEEKLY`, `MONTHLY`, and `YEARLY` intervals.
- Automated ledger entry generation linked through `recurringTransactionId`.

### 7. 🎯 Financial Goals & Savings Portfolios
- Set and monitor savings targets (Emergency Fund, Down Payment, Travel, Retirement).
- Record goal contributions with automatic source account balance deductions and live percentage progress milestones.

### 8. 📈 Investment Portfolio Management
- Track stocks, mutual funds, ETFs, fixed deposits, crypto, and real estate assets.
- Log regular investment SIPs/contributions and monitor portfolio capital accumulation.

### 9. 🏛️ Loans & EMI Repayment Schedules
- Manage personal loans, auto loans, home mortgages, and liabilities.
- Log monthly EMI payments that automatically deduct from bank accounts, record `LOAN_PAYMENT` ledger transactions, and update remaining principal balances.

### 10. 🧠 Financial Intelligence & Analytics Engine
- **Savings Rate Tracker**: Real-time savings percentage calculation against income inflows.
- **Fixed Expense Ratio**: Measure essential fixed costs against discretionary spending (50/30/20 rule comparison).
- **Spending Anomalies Detection**: Algorithmic identification of spiky months exceeding 150% of historical average burn rates.
- **Category Trends Matrix**: Multi-month spending distribution shifts and category concentration analysis.

### 11. 📑 Comprehensive Reports Center
- **Monthly Statements**: Detailed monthly profit, loss, savings rate, and net capital surplus.
- **Yearly Consolidated Audit**: 12-month financial trajectory and annual asset accumulation.
- **Net Worth Overview**: Current total assets vs liabilities.
- **Cash Flow Ledger**: Inflow vs outflow velocity breakdown.
- **Category Expenditure Reports**: Breakdown by spending hierarchy.

### 12. 🔔 Real-Time Notifications Center
- Automated alerts for budget envelope threshold breaches, upcoming bill/EMI due dates, spending anomalies, and milestone achievements.
- Mark notifications as read individually or in bulk, dismiss notices, and simulate test alerts via an interactive modal.

### 13. 📥 Data Export Center & Compliance
- Download transaction data in **CSV** and **Excel (.xlsx)** formats with date range filters.
- Stream executive **PDF** financial statements for any selected month or year.

---

## 🛠️ Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **PostgreSQL**: v14.0 or higher
- **npm** or **yarn** / **pnpm**

---

### 1. Clone the Repository
```bash
git clone https://github.com/akash1106/Finance_Tracker.git
cd Finance_Tracker
```

---

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Copy the sample environment file and configure your credentials:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your PostgreSQL database URL and JWT Secret:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL="postgresql://postgres:password@localhost:5432/money_tracker?schema=public"
   JWT_SECRET="your-ultra-secure-jwt-secret-key-at-least-32-chars-long"
   CLIENT_URL="http://localhost:3001"
   ```

4. Install backend dependencies:
   ```bash
   npm install
   ```

5. Generate the Prisma Client and run database migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will be live at `http://localhost:3000/api/v1` and Swagger documentation at `http://localhost:3000/api/docs`.*

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the `finance-tracker-frontend` directory:
   ```bash
   cd finance-tracker-frontend
   ```

2. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *(Ensure `NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"` is set).*

3. Install frontend dependencies:
   ```bash
   npm install
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The application will be live at `http://localhost:3001`.*

---

## 🧪 Testing & Verification

### Run Backend Test Suite
The backend includes complete test coverage for auth, validation, database lifecycles, budget algorithms, recurring execution, contributions, reports, and exports:
```bash
cd backend
npm test
```
*Expected: 11 passed test suites (72/72 tests).*

### Build Frontend Production Bundle
Verify TypeScript type-checking and Next.js Turbopack compilation across all 52 static and dynamic routes:
```bash
cd finance-tracker-frontend
npm run build
```
*Expected: 0 TypeScript and bundling errors.*

---

## 📡 API Endpoint Overview

| Module | Method | Endpoint | Description |
| --- | --- | --- | --- |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new user account |
| | `POST` | `/api/v1/auth/login` | Authenticate credentials & issue token |
| | `GET` | `/api/v1/auth/me` | Fetch authenticated user profile |
| | `PATCH` | `/api/v1/auth/profile` | Update user display name |
| | `PATCH` | `/api/v1/auth/password` | Change user password |
| | `POST` | `/api/v1/auth/logout` | Clear session cookie |
| **Accounts** | `GET` / `POST` | `/api/v1/accounts` | List accounts / Create new account |
| | `GET` / `PATCH` / `DELETE`| `/api/v1/accounts/:id` | View, update, or soft-deactivate account |
| **Transactions** | `GET` / `POST` | `/api/v1/transactions` | Query filtered transactions / Create transaction |
| | `GET` / `PATCH` / `DELETE`| `/api/v1/transactions/:id` | View, modify, or delete transaction |
| **Income** | `GET` / `POST` | `/api/v1/income` | Query income transactions / Log salary inflow |
| **Budgets** | `GET` / `POST` | `/api/v1/budgets` | List monthly budgets / Generate budget |
| | `GET` | `/api/v1/budgets/:id/summary` | Budget utilization and warning status |
| **Fixed Costs** | `GET` / `POST` | `/api/v1/fixed-expenses` | List or register fixed expense rule |
| **Recurring** | `GET` / `POST` | `/api/v1/recurring-transactions` | List or register recurring automation |
| **Savings** | `GET` / `POST` | `/api/v1/savings-goals` | Manage savings goals and milestones |
| | `GET` / `POST` | `/api/v1/savings-goals/:id/contributions` | Ledger of goal contributions |
| **Investments** | `GET` / `POST` | `/api/v1/investments` | Manage portfolio investments and SIPs |
| **Loans** | `GET` / `POST` | `/api/v1/loans` | Manage liabilities and track EMI payments |
| **Analytics** | `GET` | `/api/v1/analytics/spending-trends` | Monthly expense burn-rate trajectory |
| | `GET` | `/api/v1/analytics/spending-anomalies` | Detected spiky months (>150% average) |
| | `GET` | `/api/v1/analytics/savings-rate` | Real-time savings efficiency ratio |
| | `GET` | `/api/v1/analytics/fixed-expense-ratio` | Fixed obligations vs discretionary ratio |
| | `GET` | `/api/v1/analytics/budget-performance` | Budget envelopes vs actual outlays |
| **Reports** | `GET` | `/api/v1/reports/monthly` | Monthly consolidated profit & loss statement |
| | `GET` | `/api/v1/reports/yearly` | Annual financial audit statement |
| | `GET` | `/api/v1/reports/net-worth` | Real-time assets vs liabilities |
| **Notifications**| `GET` / `POST` | `/api/v1/notifications` | List user notices / Trigger alert |
| | `PATCH` | `/api/v1/notifications/read-all` | Mark all alerts as read |
| | `DELETE` | `/api/v1/notifications/:id` | Dismiss notification |
| **Exports** | `GET` | `/api/v1/exports/transactions?format=CSV` | Export transactions in CSV or XLSX |
| | `GET` | `/api/v1/exports/monthly-report` | Download executive monthly PDF statement |
| | `GET` | `/api/v1/exports/yearly-report` | Download annual audit PDF report |

---

## 🗺️ Frontend Route Map

- `/dashboard` — Executive financial dashboard with live cash flow, balances, and recent ledger activity
- `/transactions` — Unified transaction table with advanced multi-parameter filtering, creation modal, and editing
- `/income` — Income inflows and salary allocation ledger
- `/accounts` — Account cards, balances, and transaction history
- `/categories` — Category and subcategory taxonomy manager
- `/budget` — Monthly zero-based budget planner and envelope monitor
- `/budget/allocation` — Visual salary distribution calculator
- `/budget/templates` — Reusable budget percentage allocation templates
- `/fixed-expenses` — Fixed overhead obligations and auto-generation
- `/recurring` — Automated recurring transaction rules
- `/savings` — Savings hub and goal progress ledger
- `/investments` — Investment asset tracker and contribution ledger
- `/loans` — Liabilities, loan repayment ledger, and EMI schedules
- `/goals` — Long-term financial milestones tracker
- `/reports` — Financial report center (Monthly, Yearly, Net Worth, Cash Flow, Category)
- `/analytics` — Algorithmic financial intelligence hub
- `/analytics/spending` — Historical burn rate and spending anomalies detector
- `/analytics/categories` — Multi-month category spending matrix
- `/analytics/budget` — Category budget variance adherence tracker
- `/notifications` — Notifications center with category tabs, filters, and alert simulator
- `/exports` — Archival download hub for CSV, Excel, and PDF financial reports
- `/settings` — Profile management, security/password updates, appearance, and notification triggers

---

## 📄 License
This project is licensed under the MIT License.
