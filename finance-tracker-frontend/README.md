# 🖥️ Finance Tracker — Modern Web Frontend

A high-performance, responsive web application for personal wealth management, salary allocation, zero-based budgeting, investment tracking, and financial analytics. Built on **Next.js 16 (App Router with Turbopack)**, **React 19**, **Tailwind CSS v4**, and **TanStack React Query v5**.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| --- | --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org/) | App Router with Turbopack bundler & server rendering |
| **Core UI** | [React 19](https://react.dev/) | Modern hooks, transitions, and concurrent features |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first design system with CSS custom variables |
| **Server State** | [TanStack React Query v5](https://tanstack.com/query) | Async data fetching, automatic caching, and cache invalidation |
| **Client State** | [Zustand](https://github.com/pmndrs/zustand) | Lightweight UI store for mobile sidebar, drawer toggles |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) | Strongly typed form state and client-side validation |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent icons across all navigation and modules |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) | Sleek, toast alerts for actions, errors, and system events |
| **HTTP Client** | [Axios](https://axios-http.com/) | Centralized client with automatic bearer token and cookie credentials |

---

## 📁 Source Code Organization

```
finance-tracker-frontend/
├── public/                      # Static assets and icons
├── src/
│   ├── app/                     # Next.js App Router (52 total routes)
│   │   ├── (auth)/              # Unauthenticated layout (login, register, forgot-password)
│   │   ├── (dashboard)/         # Protected dashboard layout with sidebar & header
│   │   ├── layout.tsx           # Global root HTML layout with Query & Auth Providers
│   │   ├── globals.css          # Tailwind CSS v4 root stylesheet and theme tokens
│   │   └── page.tsx             # Root route redirect
│   │
│   ├── components/              # Modular component hierarchy
│   │   ├── cards/               # Metric cards and KPI summary components
│   │   ├── common/              # Global shared components
│   │   ├── dialogs/             # Interactive modals (create, edit, delete confirmation)
│   │   ├── feedback/            # Toast alerts and inline warning banners
│   │   ├── forms/               # Reusable domain forms
│   │   ├── layout/              # App Shell: Sidebar, Mobile Sidebar, Header, Breadcrumbs
│   │   ├── tables/              # DataTable components with pagination and sorting
│   │   └── ui/                  # Design primitives (Button, Card, Dialog, Badge, Input, Table, etc.)
│   │
│   ├── features/                # Domain-specific feature context
│   │   └── auth/                # AuthProvider, AuthContext, token storage helpers
│   │
│   ├── hooks/                   # Custom React Query domain hooks
│   │   ├── use-accounts.ts      # Bank and wallet queries/mutations
│   │   ├── use-analytics.ts     # Spending trends, budget performance, category matrix
│   │   ├── use-auth.ts          # Authenticated session hook
│   │   ├── use-budget.ts        # Monthly budget envelopes & generation
│   │   ├── use-categories.ts    # Category & subcategory taxonomy hooks
│   │   ├── use-dashboard.ts     # Cash flow, net worth, and summary metrics
│   │   ├── use-fixed-expenses.ts# Fixed overhead queries & execution
│   │   ├── use-goals.ts         # Long-term financial milestones
│   │   ├── use-income.ts        # Income inflows and salary allocation
│   │   ├── use-investments.ts   # Asset portfolio and contribution ledgers
│   │   ├── use-loans.ts         # Liabilities and EMI repayment schedules
│   │   ├── use-notifications.ts # Real-time alerts, unread counts, dismiss actions
│   │   ├── use-profile.ts       # Profile name updates and password change mutations
│   │   ├── use-recurring.ts     # Automated recurring transaction rules
│   │   ├── use-reports.ts       # Monthly, yearly, net worth, cash flow reports
│   │   ├── use-savings.ts       # Savings goals and deposit ledgers
│   │   └── use-transactions.ts  # Filtered transaction ledger queries & mutations
│   │
│   ├── lib/                     # Utilities and shared infrastructure
│   │   ├── api/                 # Strongly typed Axios API service modules
│   │   ├── constants/           # Navigation groups, query key factories
│   │   ├── formatters/          # Currency (INR Vedic grouping), Date (date-fns)
│   │   └── query/               # queryClient configuration and query-keys
│   │
│   ├── store/                   # Zustand stores (ui-store.ts)
│   └── types/                   # Unified TypeScript interfaces and domain schemas
```

---

## 🗺️ Application Routes (52 Routes)

### 1. Authentication
- `/login` — Secure email and password authentication with cookie/token storage
- `/register` — New user registration with automatic credential hashing
- `/forgot-password` — Password recovery workflow
- `/reset-password` — Tokenized password reset interface

### 2. Daily Ledgers & Overview
- `/dashboard` — Financial cockpit with live account balances, monthly cash flow, and combined recent activity
- `/transactions` — Unified transaction table with type, date, account, and category filters
- `/transactions/new` — Create income, expense, or savings transaction
- `/transactions/[id]` — Detailed transaction view and editor
- `/income` — Inflow tracking and salary allocation ledger
- `/income/new` — Log new income or salary deposit
- `/income/[id]` — Income source detail view
- `/accounts` — Account cards (Savings, Checking, Credit Card, Wallet, Cash) with live balance computations
- `/accounts/new` — Add bank account or financial wallet
- `/accounts/[id]` — Individual account detail and chronological activity
- `/categories` — Category and subcategory taxonomy manager
- `/categories/[id]` — Category expense analytics and transaction list

### 3. Budgeting & Automation
- `/budget` — Monthly zero-based budget planner and envelope monitor
- `/budget/[id]` — Detailed monthly budget envelope breakdown
- `/budget/allocation` — Visual salary allocation calculator
- `/budget/history` — Historical budget adherence and variance archives
- `/budget/templates` — Reusable allocation templates with strict 100% validation
- `/fixed-expenses` — Recurring obligations (rent, subscriptions) with auto-generate actions
- `/fixed-expenses/new` — Register new fixed expense commitment
- `/fixed-expenses/[id]` — Fixed expense detail and history
- `/recurring` — Automated recurring transaction rules (daily, weekly, monthly, yearly)
- `/recurring/new` — Set up new automated recurring ledger rule
- `/recurring/[id]` — Recurring rule detail and manual run trigger

### 4. Wealth & Liabilities
- `/savings` — Savings overview and goal portfolio
- `/savings/goals` — Catalog of active and completed savings targets
- `/savings/goals/new` — Create new savings goal
- `/savings/goals/[id]` — Savings target detail with contribution deposit ledger
- `/investments` — Investment asset tracker (Stocks, Mutual Funds, ETFs, Crypto, Real Estate)
- `/investments/new` — Add investment asset to portfolio
- `/investments/[id]` — Investment detail with capital contribution ledger
- `/loans` — Liabilities overview, loan principal tracker, and EMI schedules
- `/loans/new` — Register new loan or mortgage
- `/loans/[id]` — Loan detail with EMI payment ledger and balance amortization
- `/goals` — Long-term financial milestone tracker

### 5. Financial Intelligence & Reports
- `/reports` — Reports hub with navigation to all financial statements
- `/reports/monthly` — Monthly executive financial profit & loss statement
- `/reports/yearly` — Consolidated 12-month annual financial audit
- `/reports/net-worth` — Total assets versus total liabilities report
- `/reports/cash-flow` — Net cash flow velocity and capital deployment report
- `/reports/category` — Category spending distribution report
- `/analytics` — Algorithmic financial intelligence hub
- `/analytics/spending` — Historical monthly burn rate and spending anomaly detector (>150% average)
- `/analytics/categories` — Multi-month category spending matrix and concentration analysis
- `/analytics/budget` — Category budget variance adherence tracker

### 6. Tools, Alerts & Settings
- `/notifications` — Notifications center with category tabs, unread filters, and alert simulator
- `/exports` — Data export center with authenticated CSV, Excel (.xlsx), and PDF downloads
- `/settings` — Main configuration hub
- `/settings/profile` — Update display name, view verified email, UUID, and registration date
- `/settings/security` — Change password with BCrypt validation and cryptographic safeguards
- `/settings/appearance` — Currency formatting (INR ₹), Vedic numbering toggle, decimal precision, theme selector
- `/settings/notifications` — Configure threshold triggers for budget limit warnings, bill reminder lead time, and anomaly alerts
- `/settings/accounts` — Convenience redirect to `/accounts`
- `/settings/budget` — Convenience redirect to `/budget`
- `/settings/categories` — Convenience redirect to `/categories`

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Backend API**: The backend server must be running at `http://localhost:3000` (or configured URL)

---

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *Edit `.env.local`:*
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   ```

3. Launch development server with Turbopack:
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3001](http://localhost:3001) in your browser.*

---

## 🔨 Production Build & Verification

Verify TypeScript compliance and bundle optimization across all 52 static and dynamic routes:

```bash
npm run build
```

*Expected output: `✓ Generating static pages using 11 workers (52/52) in ...ms` with 0 errors.*

To run the production server:
```bash
npm start
```

---

## 🎨 Design Principles & UI Patterns
- **Tailwind Tokens**: Semantic color tokens (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-primary`, `bg-muted`) supporting adaptive contrast.
- **Indian Vedic Numbering**: Built-in formatting using standard Indian groupings (`₹1,50,000` for 1.5 Lakhs) alongside optional decimal precision.
- **Micro-Interactions**: Smooth hover effects, skeleton loading states, empty states with actionable triggers, and Sonner feedback toasts.
- **Responsive Layout**: Collapsible desktop sidebar and gesture-friendly mobile drawer menu.

---

## 📄 License
This frontend is licensed under the MIT License.
