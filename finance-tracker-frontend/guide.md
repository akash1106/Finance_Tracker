# Frontend Architecture & Implementation Guide

Comprehensive step-by-step architectural manual and implementation guide for building the **Personal Finance Tracker** frontend application with Next.js, React, and TanStack Query.

---

## Architecture Overview

```text
Next.js (App Router)
   │
   ├── TypeScript
   │
   ├── Tailwind CSS
   │
   ├── React
   │
   ├── TanStack Query ──────► API state / caching
   │
   ├── React Hook Form ─────► Form handling
   │
   ├── Zod ─────────────────► Client-side schema validation
   │
   ├── Recharts ────────────► Financial charts & visualizers
   │
   └── Axios / fetch
           │
           ▼
      Express REST API (Port 3000 / api/v1)
           │
           ▼
       PostgreSQL
```

---

## Phase 0 — Frontend Project Setup

### Goal
Create a clean, scalable Next.js application optimized for modern React patterns, strict TypeScript validation, and seamless integration with the Express REST API.

### Recommended Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Server State / Cache** | TanStack Query (React Query) |
| **HTTP Client** | Axios |
| **Forms** | React Hook Form |
| **Validation** | Zod + `@hookform/resolvers` |
| **Data Visualization** | Recharts |
| **Icons** | Lucide React |
| **Date Utilities** | `date-fns` |
| **UI Polish (Optional)** | Sonner (Toasts), `next-themes` (Dark mode), Zustand (Global UI state) |

### Library Selection Rationale

| Library | Purpose | Why We Use It |
| :--- | :--- | :--- |
| **Next.js** | Frontend Framework | Fast routing, App Router, metadata, server/client component flexibility |
| **TypeScript** | Type Safety | End-to-end interface contracts aligning with backend schema |
| **Tailwind CSS** | Styling | Utility-first, responsive design, dark mode compatibility |
| **TanStack Query** | Server State | Caching, deduplication, automatic refetching, mutation handling |
| **Axios** | HTTP Client | Request/response interceptors, credentials handling, unified error parsing |
| **React Hook Form** | Forms | Minimal re-renders, uncontrolled input performance |
| **Zod** | Validation | Runtime type checking, easy integration with React Hook Form |
| **Recharts** | Charts | Declarative SVG financial charts (line, bar, pie, gauge) |
| **Lucide React** | Icons | Lightweight, consistent iconography |
| **date-fns** | Date Manipulation | Immutable, tree-shakeable date formatting and arithmetic |
| **Sonner** | Toasts | Beautiful, stackable toast notifications |
| **next-themes** | Dark Mode | Smooth theme transitions without hydration mismatch |
| **Zustand** | Global UI State | Lean state management for sidebar toggles, modals, and filters |

---

## Phase 1 — Create the Frontend Application

Create a dedicated repository/folder for the frontend client:

```bash
# 1. Initialize Next.js project
npx create-next-app@latest finance-tracker-frontend
```

### Recommended CLI Selections

```text
TypeScript:         Yes
ESLint:             Yes
Tailwind CSS:       Yes
src/ directory:     Yes
App Router:         Yes
Turbopack:          Yes
Import alias:       @/*
```

### Dependency Installation

```bash
cd finance-tracker-frontend
npm install

# Core runtime dependencies
npm install @tanstack/react-query axios react-hook-form zod @hookform/resolvers recharts lucide-react date-fns

# Optional UI enhancements
npm install sonner next-themes zustand
```

---

## Phase 2 — Frontend Environment Configuration

Create `.env.local` in the project root:

```env
# Local Development Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

For production deployment:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

> [!CAUTION]
> Never put sensitive secrets (database passwords, private API keys) into variables prefixed with `NEXT_PUBLIC_*`. Only publicly safe URLs and client configurations belong here.

---

## Phase 3 — Frontend Folder Structure

```text
finance-tracker-frontend/
│
├── public/
│   ├── icons/
│   └── images/
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── reset-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── transactions/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── income/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   │
│   │   │   ├── accounts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   │
│   │   │   ├── categories/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │
│   │   │   ├── budget/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── allocation/
│   │   │   │   ├── history/
│   │   │   │   ├── templates/
│   │   │   │   └── [id]/
│   │   │   │
│   │   │   ├── fixed-expenses/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   │
│   │   │   ├── recurring/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │
│   │   │   ├── savings/
│   │   │   │   ├── page.tsx
│   │   │   │   └── goals/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── new/
│   │   │   │       └── [id]/
│   │   │   │
│   │   │   ├── investments/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   │
│   │   │   ├── loans/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   │
│   │   │   ├── goals/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── monthly/
│   │   │   │   ├── yearly/
│   │   │   │   └── net-worth/
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── spending/
│   │   │   │   ├── categories/
│   │   │   │   └── budget/
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── exports/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── profile/
│   │   │       ├── security/
│   │   │       ├── categories/
│   │   │       ├── accounts/
│   │   │       ├── budget/
│   │   │       ├── notifications/
│   │   │       └── appearance/
│   │   │
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── charts/
│   │   ├── cards/
│   │   ├── dialogs/
│   │   ├── feedback/
│   │   └── common/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── income/
│   │   ├── accounts/
│   │   ├── categories/
│   │   ├── budget/
│   │   ├── fixed-expenses/
│   │   ├── recurring/
│   │   ├── savings/
│   │   ├── investments/
│   │   ├── loans/
│   │   ├── goals/
│   │   ├── reports/
│   │   ├── analytics/
│   │   └── notifications/
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── accounts.api.ts
│   │   │   ├── income.api.ts
│   │   │   ├── transactions.api.ts
│   │   │   ├── categories.api.ts
│   │   │   ├── budget.api.ts
│   │   │   ├── savings.api.ts
│   │   │   ├── investments.api.ts
│   │   │   ├── loans.api.ts
│   │   │   ├── goals.api.ts
│   │   │   ├── dashboard.api.ts
│   │   │   ├── reports.api.ts
│   │   │   ├── analytics.api.ts
│   │   │   └── notifications.api.ts
│   │   │
│   │   ├── auth/
│   │   ├── query/
│   │   ├── utils/
│   │   ├── formatters/
│   │   └── constants/
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-debounce.ts
│   │   ├── use-pagination.ts
│   │   ├── use-date-range.ts
│   │   └── use-mobile.ts
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── transaction.schema.ts
│   │   ├── income.schema.ts
│   │   ├── account.schema.ts
│   │   ├── category.schema.ts
│   │   ├── budget.schema.ts
│   │   ├── savings.schema.ts
│   │   ├── investment.schema.ts
│   │   ├── loan.schema.ts
│   │   └── goal.schema.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── transaction.ts
│   │   ├── income.ts
│   │   ├── account.ts
│   │   ├── category.ts
│   │   ├── budget.ts
│   │   ├── savings.ts
│   │   ├── investment.ts
│   │   ├── loan.ts
│   │   ├── goal.ts
│   │   ├── dashboard.ts
│   │   └── api.ts
│   │
│   ├── providers/
│   │   ├── query-provider.tsx
│   │   └── theme-provider.tsx
│   │
│   └── store/
│       └── ui-store.ts
│
├── .env.local
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
└── README.md
```

---

## Phase 4 — Application Shell

Before building specific financial pages, construct the unified dashboard layout shell:

### Main Layout Wireframe

```text
┌──────────────────────────────────────────────────────────┐
│ Header (Breadcrumbs, Search, Date Range, Notifications, Profile)
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│ Sidebar      │           Page Content Area               │
│              │                                           │
│ Dashboard    │                                           │
│ Transactions │                                           │
│ Income       │                                           │
│ Accounts     │                                           │
│ Budget       │                                           │
│ Savings      │                                           │
│ Investments  │                                           │
│ Loans        │                                           │
│ Goals        │                                           │
│ Reports      │                                           │
│ Analytics    │                                           │
│              │                                           │
│ Settings     │                                           │
└──────────────┴───────────────────────────────────────────┘
```

### Layout Components (`components/layout/`)
- `sidebar.tsx`: Collapsible desktop sidebar with active route highlighting.
- `header.tsx`: App bar with user avatar, theme toggle, and notification bell.
- `mobile-sidebar.tsx`: Sheet/drawer layout for small devices.
- `breadcrumbs.tsx`: Dynamic route hierarchy navigation.
- `page-header.tsx`: Title, subtitle, and primary call-to-action buttons.
- `dashboard-layout.tsx`: Root wrapper ensuring responsive container margins.

---

## Phase 5 — Design System & UI Primitives

Build atomic reusable components in `src/components/ui/` before page implementations:

### Reusable UI Primitives

| Category | Components |
| :--- | :--- |
| **Inputs** | `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Radio`, `DatePicker` |
| **Data Display** | `Badge`, `Avatar`, `Card`, `Table`, `Progress`, `Tabs` |
| **Overlays** | `Dialog` (Modal), `DropdownMenu`, `Tooltip`, `Sheet` |
| **Feedback** | `Skeleton`, `Spinner`, `Alert`, `Toast` (Sonner), `EmptyState` |
| **Navigation** | `Pagination`, `Breadcrumbs` |

```tsx
// Example reusable Button API
<Button variant="primary" size="md" isLoading={isSubmitting}>
  Add Transaction
</Button>
```

---

## Phase 6 — Authentication Frontend

### User Authentication Flow

```text
User enters credentials
         │
         ▼
POST /api/v1/auth/login
         │
         ▼
Backend sets HttpOnly Cookie & returns user object
         │
         ▼
Client updates AuthState ──► Redirects to /dashboard
```

### Auth Pages
* **`/login`**: Email, password input, Remember Me, Forgot Password link.
* **`/register`**: Name, email, password (with real-time complexity indicator), link to Login.
* **`/forgot-password`**: Email submission for password reset link.
* **`/reset-password`**: Password update with token validation.

---

## Phase 7 — Authentication State Management

### Directory Structure (`src/features/auth/`)
```text
features/auth/
├── auth-provider.tsx
├── auth.service.ts
├── auth.types.ts
└── auth.utils.ts
```

### Custom Hook (`hooks/use-auth.ts`)
Exposes reactive authentication state:
```ts
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

---

## Phase 8 — API Client Architecture

Centralize API communication in `src/lib/api/client.ts` using Axios:

### Core Responsibilities
1. Configure base URL from `NEXT_PUBLIC_API_URL`.
2. Enable `withCredentials: true` so HttpOnly cookies are automatically sent.
3. Fallback Bearer token insertion from memory for non-cookie environments.
4. Response envelope unwrapping (`response.data.data`).
5. Standardized error transformation (`AppError`).

```ts
// src/lib/api/client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
```

> [!TIP]
> Never call `fetch()` directly in page components. Encapsulate all requests inside domain API files (e.g. `transactions.api.ts`, `accounts.api.ts`) and access them via React Query hooks.

---

## Phase 9 — TanStack Query Integration

Manage all asynchronous backend state using TanStack Query queries and mutations.

### Query Cache & Mutation Flow

```text
User creates transaction
          │
          ▼
useCreateTransaction() Mutation
          │
          ▼
POST /api/v1/transactions
          │
          ▼
On Success: queryClient.invalidateQueries({ queryKey: ['transactions'] })
          │
          ├──► Auto-refetches Transaction List
          ├──► Auto-refetches Dashboard Overview
          └──► Auto-refetches Monthly Budget
```

---

## Phase 10 — Core Finance Pages

Build these foundational financial modules after authentication:

### 10.1 Transactions (`/transactions`)
* **Purpose**: Primary transaction ledger.
* **Features**: Full-text search, category filter, account filter, transaction type selector, date range picker, pagination, sort by amount/date.
* **Actions**: Add Transaction, Edit, Delete, View Detail drawer.

### 10.2 Add Transaction (`/transactions/new`)
* **Form Fields**:
  - Transaction Type (`EXPENSE`, `INCOME`, `TRANSFER`)
  - Amount (`₹`)
  - Category & Dynamic Subcategory dropdown
  - Source Account
  - Payment Method (`UPI`, `CARD`, `NET_BANKING`, `CASH`)
  - Date & Description

### 10.3 Income History (`/income`)
* **Features**: Income list, filter by salary/freelance, date filter, source filter, total income banner.

### 10.4 Add Income (`/income/new`)
* **Fields**: Source Name, Amount, Deposit Account, Date, Description.
* **Salary Trigger**: If source is marked as **Salary**, prompt:
  * *"Salary recorded! Would you like to generate this month's budget from your allocation template?"*

### 10.5 Accounts (`/accounts`)
* **Display**: Balance cards for each bank, cash, or credit account with net liquid total.

---

## Phase 11 — Category Management (`/categories`)

Manage the two-tier category hierarchy:

```text
Food
├── Groceries
├── Restaurant
└── Snacks

Transport
├── Petrol
├── Bus
└── Metro
```

* **Actions**: Add Category, Add Subcategory, Edit Name/Icon/Color, Deactivate.

---

## Phase 12 — Salary Allocation Configurator (`/budget/allocation`)

> [!IMPORTANT]
> The allocation template is the cornerstone of the zero-based budgeting engine.

### Allocation Table Interface

| Category | Allocation % |
| :--- | :--- |
| **Fixed Expenses** | 30% |
| **Savings** | 15% |
| **Investments** | 20% |
| **Food** | 10% |
| **Transport** | 8% |
| **Personal** | 7% |
| **Emergency** | 10% |
| **Total** | **100%** |

### Live Validation Indicator
- `100% ✓`: Valid (Save button active)
- `92% ⚠`: 8% unallocated (Save disabled)
- `108% ✕`: Allocation exceeds 100% (Save disabled)

---

## Phase 13 — Monthly Budget (`/budget`)

Tracks monthly spending performance in real time:

### Top Metric Summary Cards
* **Income**: `₹50,000`
* **Allocated**: `₹50,000`
* **Spent**: `₹31,500`
* **Remaining**: `₹18,500`

### Category Progress Bars
```text
Food
₹4,250 / ₹5,000
[█████████████████░░░] 85% — WARNING

Transport
₹1,800 / ₹4,000
[█████████░░░░░░░░░░░] 45% — NORMAL
```

---

## Phase 14 — Budget Detail (`/budget/[id]`)

Deep-dive page for a specific monthly budget:
- Visual allocation vs actual spending charts.
- Over-budget warning highlights.
- Category drilldown displaying all individual transactions that consumed that budget.

---

## Phase 15 — Fixed Expenses (`/fixed-expenses`)

Tracks non-negotiable scheduled obligations:

| Expense | Amount | Frequency | Next Due Date | Action |
| :--- | :--- | :--- | :--- | :--- |
| **Rent** | `₹10,000` | Monthly | 01 Oct | `Generate` |
| **Internet** | `₹999` | Monthly | 05 Oct | `Generate` |
| **Insurance** | `₹2,500` | Monthly | 10 Oct | `Generate` |

---

## Phase 16 — Recurring Transactions (`/recurring`)

Automates regular transactions:
- Status Badges: `ACTIVE`, `PAUSED`, `DUE`.
- Execution frequency and next scheduled execution date.

---

## Phase 17 — Savings Overview (`/savings`)

Aggregated liquid savings dashboard:
- Total Savings Balance: `₹2,30,000`
- Breakdown: Emergency Fund, Fixed Deposits (FD), Recurring Deposits (RD), General Savings.

---

## Phase 18 — Savings Goals (`/savings/goals`)

Visual goal cards:

```text
Emergency Fund
₹75,000 / ₹2,00,000
[███████░░░░░░░░░] 37.5%
₹1,25,000 remaining
```

---

## Phase 19 — Savings Goal Detail (`/savings/goals/[id]`)

- Target completion date calculation.
- Contribution history log with `+ Add Contribution` modal.
- Historical progress chart.

---

## Phase 20 — Investments (`/investments`)

Tracks investment contributions:
* **Total Invested**: `₹2,80,000`
* **Asset Allocation**: Mutual Funds (`₹1.2L`), Gold (`₹50K`), FD (`₹80K`), RD (`₹30K`).
* Distribution pie chart.

> [!NOTE]
> V1 tracks cumulative invested capital, not fluctuating live stock/market valuations.

---

## Phase 21 — Loans & EMI Management (`/loans`)

Tracks debt obligations and repayment:
- **Laptop Loan**: Principal `₹80,000`, EMI `₹5,000`, Paid `₹35,000`, Remaining `₹45,000`, Status `ACTIVE`.

---

## Phase 22 — Loan Details (`/loans/[id]`)

Displays EMI schedule, remaining tenure in months, and a `+ Record EMI Payment` quick action button.

---

## Phase 23 — Financial Goals (`/goals`)

Aspirational long-term targets (e.g. Gaming PC, Car, Vacation):
- Target vs Current saved amount.
- Progress percentage indicator.

---

## Phase 24 — Main Dashboard (`/dashboard`)

```text
┌─────────────────────────────────────────────────────┐
│ Good morning, Akash                    Sep 2026     │
├───────────┬───────────┬───────────┬─────────────────┤
│ Income    │ Expenses  │ Savings   │ Net Worth       │
│ ₹50,000   │ ₹27,500   │ ₹7,500    │ ₹4.7L           │
└───────────┴───────────┴───────────┴─────────────────┘

┌─────────────────────────────┬───────────────────────┐
│ Income vs Expenses          │ Expense Breakdown     │
│                             │                       │
│        📈 Line Chart        │       🥧 Donut Chart  │
│                             │                       │
└─────────────────────────────┴───────────────────────┘

┌─────────────────────────────┬───────────────────────┐
│ Budget Utilization          │ Savings Trend         │
│                             │                       │
│        📊 Bar Chart         │       📈 Line Chart   │
└─────────────────────────────┴───────────────────────┘

┌─────────────────────────────┬───────────────────────┐
│ Recent Transactions         │ Upcoming Payments     │
│                             │                       │
│        📋 Table             │       ⏰ Alert Cards  │
└─────────────────────────────┴───────────────────────┘
```

---

## Phase 25 — Dashboard Feature Components

```text
src/features/dashboard/components/
├── dashboard-header.tsx
├── financial-summary.tsx
├── income-expense-chart.tsx
├── expense-breakdown-chart.tsx
├── budget-utilization.tsx
├── savings-chart.tsx
├── investment-chart.tsx
├── net-worth-chart.tsx
├── recent-transactions.tsx
├── upcoming-payments.tsx
├── budget-alerts.tsx
└── goal-progress.tsx
```

---

## Phase 26 — Reports Center (`/reports`)

Report Hub providing cards to generate:
- Monthly Report
- Yearly Report
- Net Worth Report
- Cash Flow Report
- Category Analysis Report

---

## Phase 27 — Monthly Report (`/reports/monthly`)

- Consolidated financial statement for selected month.
- Top spending categories and fixed expenses list.
- **Action**: `[Export PDF]`.

---

## Phase 28 — Yearly Report (`/reports/yearly`)

- Year dropdown selector (`2026 ▼`).
- Annual totals: Income, Expenses, Savings, Investments.
- Highest spending month and highest spending category.

---

## Phase 29 — Analytics Hub (`/analytics`)

Answers key personal finance questions:
1. *Where am I spending the most?*
2. *Is my spending increasing month-over-month?*
3. *Is my savings rate improving?*
4. *What percentage of my salary goes to fixed obligations?*
5. *Which categories consistently exceed budget limits?*

---

## Phase 30 — Analytics Charts

| Chart | Visualization Type | Purpose |
| :--- | :--- | :--- |
| **Spending Trend** | Line Chart | Monthly spending trajectory over 12 months |
| **Category Comparison** | Bar Chart | Top categories ranked by expenditure |
| **Income Growth** | Line Chart | Income progression over time |
| **Savings Rate** | Line Chart | Savings as a percentage of income |
| **Fixed Expense Ratio** | Stacked Bar | Mandatory expenses vs discretionary cash |
| **Budget Performance** | Grouped Bar | Budgeted vs Actual per category |
| **Spending Anomalies** | Scatter / Flagged Bar | Highlight statistical spending outliers |

---

## Phase 31 — In-App Notifications (`/notifications`)

- Unread indicator in top navigation bar (`🔔 3`).
- Notification cards for budget thresholds, due bills, and completed goals.
- Mark as Read and Mark All as Read actions.

---

## Phase 32 — Data Export Center (`/exports`)

Export center supporting:
- Transactions (CSV / Excel `.xlsx`)
- Monthly Financial Report (PDF)
- Yearly Financial Report (PDF)

---

## Phase 33 — Settings (`/settings`)

Settings navigation:
- **Profile**: Name, Email, Profile details.
- **Security**: Password update, Active tokens, Logout.
- **Categories**: Category hierarchy customization.
- **Accounts**: Account ordering and defaults.
- **Budget**: Warning thresholds (e.g. 80%, 100%).
- **Appearance**: Light, Dark, System theme.

---

## Phase 34 — Responsive Design Strategy

| Screen | Layout Pattern |
| :--- | :--- |
| **Desktop (≥ 1024px)** | Persistent sidebar navigation, multi-column grid layouts |
| **Tablet (768px - 1023px)** | Collapsible sidebar, 2-column grids |
| **Mobile (< 768px)** | Header with drawer menu or bottom navigation bar, single-column stacked cards |

> [!TIP]
> Do not simply horizontally squish desktop tables on mobile screens. Transform rows into individual card components or wrap tables in smooth horizontal scrolling containers.

---

## Phase 35 — Loading States

Every asynchronous view must present a Skeleton placeholder:
- `DashboardSkeleton`: Skeleton cards, skeleton chart boxes.
- `TableSkeleton`: Animated grey placeholder table rows.
- `FormSkeleton`: Inputs and button placeholders.

---

## Phase 36 — Empty States

Ensure every list view displays an actionable Empty State:

```text
┌──────────────────────────────────────────────┐
│                  💳 No Data                  │
│             No transactions yet              │
│  Start tracking your spending to understand  │
│          where your money goes.              │
│                                              │
│          [ + Add Transaction ]               │
└──────────────────────────────────────────────┘
```

---

## Phase 37 — Error Handling & Recovery

- **Form Validation Errors**: Inline field messages under inputs.
- **API Errors**: Sonner toast notifications displaying backend error message.
- **401 Unauthorized**: Redirect to `/login` with return URL query parameter.
- **500 Server Errors**: Gentle fallback banner with a *“Try Again”* button.

---

## Phase 38 — Form Architecture Workflow

```text
User fills Form
       │
       ▼
React Hook Form state
       │
       ▼
Zod Client Schema Validation
       │
       ▼
API Mutation (useMutation)
       │
       ▼
Success Response
       │
       ├──► Toast Notification
       ├──► Query Invalidation
       └──► Close Dialog / Redirect
```

---

## Phase 39 — State Separation Strategy

Avoid putting all state in global stores. Separate concerns into three clean tiers:

```text
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ Server State            │ Local State             │ Global UI State         │
│ (TanStack Query)        │ (React useState)        │ (Zustand)               │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ • Transactions          │ • Modal open/close      │ • Sidebar collapsed     │
│ • Income & Accounts     │ • Form inputs           │ • Dark / Light theme    │
│ • Budgets & Goals       │ • Active tab            │ • Global notification   │
│ • Reports & Analytics   │ • Table sort/filter     │   preferences           │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

---

## Phase 40 — Type Definition Architecture

Mirror backend TypeScript interfaces in `src/types/`:

```text
src/types/
├── api.ts              # ApiResponse<T>, PaginatedResponse<T>, ApiError
├── auth.ts             # User, LoginResponse, Session
├── account.ts          # Account, AccountType
├── income.ts           # IncomeSource, IncomeTransaction
├── category.ts         # Category, Subcategory
├── transaction.ts      # Transaction, TransactionType
├── budget.ts           # BudgetTemplate, MonthlyBudget, BudgetItem
├── savings.ts          # SavingsGoal, SavingsContribution
├── investment.ts       # Investment, InvestmentContribution
├── loan.ts             # Loan, LoanPayment
├── goal.ts             # FinancialGoal, GoalContribution
├── dashboard.ts        # DashboardSummary, CashFlow, ExpenseBreakdown
└── report.ts           # MonthlyReport, NetWorthReport
```

---

## Phase 41 — API-to-Page Mapping

| Frontend Page | Backend Endpoint (`/api/v1`) |
| :--- | :--- |
| **Dashboard** | `GET /dashboard`, `GET /dashboard/*` |
| **Transactions** | `/transactions` |
| **Income** | `/income`, `/income-sources` |
| **Accounts** | `/accounts` |
| **Categories** | `/categories` |
| **Budget** | `/budgets` |
| **Salary Allocation** | `/budget-templates` |
| **Fixed Expenses** | `/fixed-expenses` |
| **Recurring** | `/recurring-transactions` |
| **Savings** | `/savings-goals` |
| **Investments** | `/investments` |
| **Loans** | `/loans` |
| **Goals** | `/financial-goals` |
| **Reports** | `/reports/*` |
| **Analytics** | `/analytics/*` |
| **Notifications** | `/notifications` |
| **Export** | `/exports/*` |

---

## Phase 42 — Recommended Development Order

Execute implementation incrementally in this sequenced order:

```text
Phase 1: Project Setup & Tailwind
   ↓
Phase 2: UI Primitives & Design System
   ↓
Phase 3: Application Shell & Layout
   ↓
Phase 4: Authentication Flow (/login, /register)
   ↓
Phase 5: API Client & TanStack Query Provider
   ↓
Phase 6: Accounts Module
   ↓
Phase 7: Categories Module
   ↓
Phase 8: Income Module
   ↓
Phase 9: Transactions Module
   ↓
Phase 10: Salary Allocation Configurator
   ↓
Phase 11: Monthly Budget Module
   ↓
Phase 12: Main Dashboard
   ↓
Phase 13: Fixed Expenses
   ↓
Phase 14: Recurring Transactions
   ↓
Phase 15: Savings Goals
   ↓
Phase 16: Investments
   ↓
Phase 17: Loans & EMI
   ↓
Phase 18: Financial Goals
   ↓
Phase 19: Financial Reports
   ↓
Phase 20: Analytics Hub
   ↓
Phase 21: Notifications
   ↓
Phase 22: Export Center
   ↓
Phase 23: Settings
   ↓
Phase 24: Responsive Mobile Polish
   ↓
Phase 25: End-to-End Verification & Polish
```

---

## Phase 43 — MVP Frontend Scope

Do not wait for all 25 phases before testing. The first usable MVP requires only:

1. **Authentication** (`/login`, `/register`)
2. **Accounts** (`/accounts`)
3. **Categories** (`/categories`)
4. **Income** (`/income`)
5. **Transactions** (`/transactions`)
6. **Salary Allocation** (`/budget/allocation`)
7. **Monthly Budget** (`/budget`)
8. **Dashboard Overview** (`/dashboard`)

### Complete MVP User Workflow

```text
1. Login
    ↓
2. Create Bank Account (e.g. HDFC Salary)
    ↓
3. Create Categories (Food, Rent, Transport)
    ↓
4. Record Monthly Salary
    ↓
5. Configure Salary Allocation Template (100% total)
    ↓
6. Generate Monthly Budget
    ↓
7. Add Daily Expense Transactions
    ↓
8. Verify Budget Remaining Balances Update
    ↓
9. Verify Dashboard Metrics & Charts Update
```

---

## Phase 44 — Post-MVP Production Roadmap

Once the core MVP loop is validated:
- Add Fixed Expenses & Recurring auto-rules.
- Add Savings Goals, Investments, and Loans / EMI tracking.
- Add Reports (Monthly PDF, Yearly PDF, Net Worth balance sheet).
- Add Analytics trends and outlier detection.
- Add Dark Mode, keyboard shortcuts, and responsive mobile drawers.

---

## Phase 45 — Feature Priority Matrix

| Module | Route | Priority |
| :--- | :--- | :--- |
| **Auth** | `/login`, `/register` | **P0** (MVP) |
| **Dashboard** | `/dashboard` | **P0** (MVP) |
| **Accounts** | `/accounts` | **P0** (MVP) |
| **Categories** | `/categories` | **P0** (MVP) |
| **Income** | `/income`, `/income/new` | **P0** (MVP) |
| **Transactions** | `/transactions`, `/transactions/new` | **P0** (MVP) |
| **Budget** | `/budget/allocation`, `/budget` | **P0** (MVP) |
| **Fixed Expenses** | `/fixed-expenses` | **P1** (Core) |
| **Recurring** | `/recurring` | **P1** (Core) |
| **Savings** | `/savings`, `/savings/goals` | **P1** (Core) |
| **Investments** | `/investments` | **P1** (Core) |
| **Loans** | `/loans` | **P1** (Core) |
| **Goals** | `/goals` | **P1** (Core) |
| **Reports** | `/reports/monthly`, `/reports/yearly`, `/reports/net-worth` | **P1** (Core) |
| **Analytics** | `/analytics` | **P2** (Advanced) |
| **Notifications**| `/notifications` | **P2** (Advanced) |
| **Export** | `/exports` | **P2** (Advanced) |
| **Settings** | `/settings/*` | **P2** (Advanced) |

* **P0**: Critical for the first usable MVP release.
* **P1**: Essential product functionality.
* **P2**: Polish, exports, and advanced analytics.

---

## Core Architectural Principle

Maintain strict separation of concerns across the application stack:

```text
Page Component (app/transactions/page.tsx)
       │
       ▼
Feature Component (TransactionTable)
       │
       ▼
Custom Hook (useTransactions())
       │
       ▼
TanStack Query Cache
       │
       ▼
API Service (transactions.api.ts)
       │
       ▼
Axios Client (client.ts)
       │
       ▼
Express API (GET /api/v1/transactions)
```