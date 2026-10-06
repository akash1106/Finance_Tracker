# Personal Finance Tracker — Complete Page & Route Specification

A comprehensive specification of all pages, routes, components, and user flows for the Personal Finance Tracker web application.

---

## 1. Authentication Pages

| Page | Route | What It Does |
| :--- | :--- | :--- |
| **Login** | `/login` | User logs into the application. |
| **Register** | `/register` | Creates a new user account. |
| **Forgot Password** | `/forgot-password` | Initiates password recovery. |
| **Reset Password** | `/reset-password` | Allows the user to set a new password. |

---

## 2. Dashboard

| Page | Route | What It Does |
| :--- | :--- | :--- |
| **Dashboard** | `/dashboard` | Main financial overview containing income, expenses, savings, investments, budget status, cash flow, and charts. |

### Dashboard Sections

```text
Dashboard
│
├── Total Balance
├── Monthly Income
├── Monthly Expenses
├── Monthly Savings
├── Investments
├── Net Worth
│
├── Income vs Expense Chart
├── Expense Category Chart
├── Budget Utilization
├── Savings Trend
├── Investment Trend
├── Net Worth Trend
│
├── Recent Transactions
├── Upcoming Bills
├── Budget Warnings
└── Goal Progress
```

### Date Range Selector Options
The dashboard provides a global date-range selector with the following presets:
- **All Time**
- **This Month**
- **3 Months**
- **6 Months**
- **1 Year**
- **Custom Range**

---

## 3. Transactions

### 3.1 Transaction List
* **Route**: `/transactions`
* **Purpose**: Displays all recorded financial transactions with filtering and pagination.

#### Example Table View

| Date | Category | Description | Account | Amount |
| :--- | :--- | :--- | :--- | :--- |
| 29 Sep | Food | Lunch | HDFC | `₹250` |
| 28 Sep | Transport | Petrol | HDFC | `₹1,000` |
| 27 Sep | Shopping | Clothes | Cash | `₹2,500` |

#### Key Features
- Full-text search
- Filter by category & subcategory
- Filter by account
- Filter by transaction type (Income / Expense / Transfer)
- Filter by date range
- Sorting (Date, Amount, Category)
- Server-side pagination
- Quick Actions: Edit, Delete, View Details, Add Transaction

### 3.2 Add Transaction
* **Route**: `/transactions/new`
* **Purpose**: Manually records spending or other financial movements.

#### Form Fields
- **Transaction Type**: Expense / Income / Transfer
- **Amount**: Monetary value (`₹`)
- **Category**: Select root category
- **Subcategory**: Dependent on selected category
- **Account**: Source account
- **Payment Method**: UPI, Card, Net Banking, Cash
- **Date**: Date picker (defaults to today)
- **Description**: Short title/merchant
- **Notes**: Optional additional context

### 3.3 Transaction Details
* **Route**: `/transactions/:id`
* **Purpose**: Displays complete metadata and audit trail for a single transaction.

---

## 4. Income

### 4.1 Income List
* **Route**: `/income`
* **Purpose**: Displays all income received across all sources.

#### Supported Income Types
- Salary
- Freelance
- Interest / Dividends
- Other / Gifts

#### Displayed Fields
- **Amount**
- **Source**
- **Date**
- **Account**
- **Description**
- **Salary Indicator** (Salary vs Non-salary)

### 4.2 Add Income
* **Route**: `/income/new`
* **Purpose**: Records incoming funds.

#### Example Record

| Field | Value |
| :--- | :--- |
| **Source** | Salary |
| **Amount** | `₹50,000` |
| **Account** | HDFC Salary Account |
| **Date** | 30 Sep |

> [!TIP]
> **Automated Budget Prompt**: If the income source is marked as **Salary**, the app displays an actionable prompt:
> 
> *“Salary received! Would you like to generate this month's budget?”*  
> `[Create Budget]`

### 4.3 Income Details
* **Route**: `/income/:id`
* **Purpose**: Displays the complete record and receipt for an income entry.

---

## 5. Accounts

### 5.1 Accounts Overview
* **Route**: `/accounts`
* **Purpose**: Shows all bank, cash, and digital wallet accounts with live balances.

#### Example Account Cards
- **HDFC Salary Account**: `₹48,500`
- **SBI Savings**: `₹25,000`
- **Cash**: `₹3,500`

#### Key Features
- Add new account
- Edit account settings
- Deactivate/Archive account
- Live running balance view
- View dedicated account transaction ledger

### 5.2 Add Account
* **Route**: `/accounts/new`
* **Fields**:
  - Account Name
  - Account Type (`SAVINGS`, `CHECKING`, `CASH`, `CREDIT_CARD`)
  - Opening Balance

### 5.3 Account Details
* **Route**: `/accounts/:id`
* **Ledger Details**:
  - Current Balance
  - Opening Balance
  - Total Income Credited
  - Total Expenses Debited
  - Transfers In / Transfers Out
  - Paginated transaction history for this account

---

## 6. Categories

### 6.1 Categories Management
* **Route**: `/categories`
* **Purpose**: Hierarchical management of categories and subcategories.

#### Hierarchical Category Structure

```text
Food
├── Groceries
├── Restaurant
├── Snacks
└── Delivery

Transport
├── Petrol
├── Bus
├── Train
└── Cab
```

#### Key Features
- Create root category
- Edit category details (color, icon)
- Deactivate category
- Create subcategory under parent
- Edit/Deactivate subcategory

### 6.2 Category Details
* **Route**: `/categories/:id`
* **Displays**:
  - Category metadata & subcategory list
  - Total historical spending
  - Current month's budget allocation
  - Monthly spending trends

---

## 7. Salary Allocation

> [!IMPORTANT]
> This is a flagship feature of the application, empowering users to practice zero-based budgeting.

### Salary Allocation Configurator
* **Route**: `/budget/allocation`
* **Purpose**: Define how monthly salary is divided across categories by percentage.

#### Example Allocation Template

| Category | Percentage |
| :--- | :--- |
| **Fixed Expenses** | 25% |
| **Investments** | 20% |
| **Savings** | 15% |
| **Food** | 10% |
| **Emergency** | 10% |
| **Transport** | 8% |
| **Personal** | 7% |
| **Entertainment** | 5% |
| **Total** | **100%** |

#### Key Features
- Add/Remove category allocation rows
- Dynamic percentage sliders/inputs
- Live validation indicator:
  - `100% ✓` (Valid — Save button enabled)
  - `92% ⚠ (8% unallocated)`
  - `108% ✕ (Exceeds 100%)`
- Save template to backend

---

## 8. Monthly Budget

### 8.1 Budget Overview
* **Route**: `/budget`
* **Purpose**: Tracks spending against current monthly budget allocations.

#### Example Month Summary: September 2026

| Metric | Amount |
| :--- | :--- |
| **Salary** | `₹50,000` |
| **Allocated** | `₹50,000` |
| **Spent** | `₹32,500` |
| **Remaining** | `₹17,500` |

#### Category Budget Cards

```text
Food
₹5,000 / ₹5,000
[████████████████████] 100% — EXCEEDED

Transport
₹2,500 / ₹4,000
[████████████░░░░░░░░] 62.5% — NORMAL

Entertainment
₹4,200 / ₹5,000
[████████████████░░░░] 84% — WARNING
```

### 8.2 Budget Details
* **Route**: `/budget/:id`
* **Displays**: Complete monthly budget breakdown, category-by-category remaining balances, percentage usage, and budget drilldowns.

### 8.3 Budget History
* **Route**: `/budget/history`
* **Purpose**: Compare monthly budget performance over time.

| Month | Income | Budget | Spent |
| :--- | :--- | :--- | :--- |
| **Sep 2026** | `₹50,000` | `₹50,000` | `₹42,500` |
| **Aug 2026** | `₹48,000` | `₹48,000` | `₹44,200` |
| **Jul 2026** | `₹48,000` | `₹48,000` | `₹39,500` |

---

## 9. Budget Templates

### 9.1 Budget Templates Overview
* **Route**: `/budget/templates`
* **Purpose**: Manage predefined salary allocation templates (e.g. Standard Month, Festival Month, Lean Month).

### 9.2 Edit Budget Template
* **Route**: `/budget/templates/:id`
* **Configuration**: Category mapping, target percentages, and strict 100% total validation.

---

## 10. Fixed Expenses

### 10.1 Fixed Expenses Overview
* **Route**: `/fixed-expenses`
* **Purpose**: Track and automate recurring mandatory expenses.

#### Example Fixed Expenses Table

| Expense | Amount | Frequency | Next Due Date |
| :--- | :--- | :--- | :--- |
| **Rent** | `₹10,000` | Monthly | 01 Oct |
| **Internet** | `₹999` | Monthly | 05 Oct |
| **Insurance** | `₹2,500` | Monthly | 10 Oct |
| **Subscription** | `₹499` | Monthly | 15 Oct |

#### Key Features
- Add, Edit, Deactivate
- Configure frequency (Monthly, Quarterly, Yearly)
- Due date reminder alerts
- One-click instance generation (`Generate Transaction`)

### 10.2 Add Fixed Expense
* **Route**: `/fixed-expenses/new`
* **Fields**: Name, Amount, Category, Subcategory, Account, Frequency, Start Date, Next Due Date, Auto Generate toggle.

### 10.3 Fixed Expense Details
* **Route**: `/fixed-expenses/:id`
* **Displays**: Expense schedule, next due date, past payment history, total amount paid to date.

---

## 11. Recurring Transactions

### 11.1 Recurring Transactions Overview
* **Route**: `/recurring`
* **Purpose**: Automated rules for scheduled income, transfers, and recurring charges.

#### Example Schedule

| Item | Amount | Frequency | Next Execution | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Salary** | `₹50,000` | Monthly | 30 Sep | `ACTIVE` |
| **Rent** | `₹10,000` | Monthly | 01 Oct | `ACTIVE` |
| **SIP** | `₹5,000` | Monthly | 05 Oct | `ACTIVE` |
| **Insurance** | `₹15,000` | Yearly | 15 Dec | `PAUSED` |

### 11.2 Recurring Transaction Details
* **Route**: `/recurring/:id`
* **Displays**: Execution schedule, start/end dates, source account, destination category, run history, and pause/resume controls.

---

## 12. Savings

### Savings Overview
* **Route**: `/savings`
* **Purpose**: High-level aggregation of all liquid and emergency savings.

#### Example Savings Breakdown

| Category | Amount |
| :--- | :--- |
| **Emergency Fund** | `₹75,000` |
| **Fixed Deposit (FD)** | `₹1,00,000` |
| **Recurring Deposit (RD)** | `₹30,000` |
| **General Savings** | `₹25,000` |
| **Total Liquid Savings** | **`₹2,30,000`** |

---

## 13. Savings Goals

### 13.1 Savings Goals List
* **Route**: `/savings/goals`
* **Purpose**: Track target balances for specific safety-net funds and projects.

#### Example Goal Card: Emergency Fund
```text
Emergency Fund
₹75,000 / ₹2,00,000
[███████░░░░░░░░░░░] 37.5%
Target: ₹2,00,000 | Remaining: ₹1,25,000
```

### 13.2 Add Savings Goal
* **Route**: `/savings/goals/new`
* **Fields**: Goal Name, Target Amount, Target Date, Description.

### 13.3 Savings Goal Details
* **Route**: `/savings/goals/:id`
* **Sections**: Goal Summary, Progress Gauge, Target Completion Date, Remaining Balance, Historical Contributions Ledger, and Quick Action `+ Add Contribution`.

---

## 14. Investments

### 14.1 Investments Overview
* **Route**: `/investments`
* **Purpose**: Track capital allocated to wealth-building assets.

> [!NOTE]
> **V1 Scope**: Tracks **total money invested / contributed**, not real-time fluctuating market valuations.

#### Example Portfolio Breakdown

| Asset Type | Invested Amount |
| :--- | :--- |
| **Mutual Funds** | `₹1,20,000` |
| **Gold** | `₹50,000` |
| **Fixed Deposit (FD)** | `₹80,000` |
| **Recurring Deposit (RD)** | `₹30,000` |
| **Total Invested** | **`₹2,80,000`** |

### 14.2 Add Investment
* **Route**: `/investments/new`
* **Fields**: Investment Name, Asset Type, Target Amount, Start Date.

### 14.3 Investment Details & Contribution Modal
* **Details Route**: `/investments/:id`
* **Contribution Modal / Route**: `/investments/:id/contribute`
* **Features**: Log additional capital contributions, view monthly contribution chart, inspect full payment ledger.

---

## 15. Loans / EMI

### 15.1 Loans Overview
* **Route**: `/loans`
* **Purpose**: Liability management and EMI repayment progress.

#### Example Loan Card: Laptop Loan
- **Principal**: `₹80,000`
- **Monthly EMI**: `₹5,000`
- **Paid to Date**: `₹35,000`
- **Remaining Balance**: `₹45,000`
- **Status**: `ACTIVE`

### 15.2 Add Loan
* **Route**: `/loans/new`
* **Fields**: Loan Name, Principal, Interest Rate, Monthly EMI, Tenure (Months), Start Date, End Date.

### 15.3 Loan Details & Record Payment Modal
* **Details Route**: `/loans/:id`
* **Payment Modal / Route**: `/loans/:id/payment`
* **Features**: Displays remaining tenure, amortization progress, records monthly EMI payment and automatically links expense transaction.

---

## 16. Financial Goals

### 16.1 Financial Goals Overview
* **Route**: `/goals`
* **Purpose**: Aspiration targets (e.g. Vacation, Gaming PC, Car).

#### Examples
- **Gaming PC**: `₹80,000 / ₹1,50,000` (53.3% complete, `₹70,000` remaining)
- **Car Down Payment**: `₹2,00,000 / ₹8,00,000` (25.0% complete, `₹6,00,000` remaining)
- **Vacation Fund**: `₹25,000 / ₹60,000` (41.6% complete, `₹35,000` remaining)

### 16.2 Add Goal & Goal Details
* **Add Route**: `/goals/new`
* **Details Route**: `/goals/:id`
* **Features**: Target date forecasting, contribution history table, progress visualizer.

---

## 17. Reports

### 17.1 Reports Center
* **Route**: `/reports`
* **Available Reports**:
  - Monthly Report
  - Yearly Report
  - Net Worth Report
  - Cash Flow Report
  - Category Analysis Report

### 17.2 Monthly Report
* **Route**: `/reports/monthly`
* **Month Breakdown (e.g. September 2026)**:
  - Income: `₹50,000`
  - Expenses: `₹27,500`
  - Savings: `₹7,500`
  - Investments: `₹10,000`
  - Remaining Surplus: `₹5,000`
* **Export Action**: `[Export PDF]`

### 17.3 Yearly Report
* **Route**: `/reports/yearly`
* **Features**: Year selector dropdown (`2026 ▼`), Total annual income vs expenses, Highest spending month, Highest spending category, Net worth expansion.

---

## 18. Net Worth

### Net Worth Balance Sheet
* **Route**: `/reports/net-worth`
* **Purpose**: Complete snapshot of financial solvency.

#### Example Balance Sheet

```text
======================================================
ASSETS
------------------------------------------------------
Bank Accounts                           ₹1,50,000
Cash in Hand                              ₹10,000
Savings Goals                             ₹75,000
Investments (Capital Contributed)       ₹2,80,000
------------------------------------------------------
TOTAL ASSETS                            ₹5,15,000
======================================================
LIABILITIES
------------------------------------------------------
Outstanding Loans (Principal)             ₹45,000
------------------------------------------------------
TOTAL LIABILITIES                         ₹45,000
======================================================
NET WORTH                               ₹4,70,000
======================================================
```

---

## 19. Analytics

### 19.1 Analytics Hub
* **Route**: `/analytics`
* **Analytical Modules**:
  1. Spending Trends (`/analytics/spending`)
  2. Category Trends (`/analytics/categories`)
  3. Budget Performance (`/analytics/budget`)
  4. Income Growth
  5. Savings Rate
  6. Fixed Expense Ratio
  7. Spending Anomalies (AI/Heuristic flags on abnormal spending)

---

## 20. Notifications

### Notifications Center
* **Route**: `/notifications`
* **Features**:
  - Global unread badge in header (`🔔 3`)
  - Warning alert cards:
    - `⚠ Food budget reached 82% (2 hours ago)`
    - `⚠ Internet bill is due tomorrow (1 day ago)`
    - `✓ Emergency Fund goal completed (3 days ago)`
  - Mark as read / Mark all as read controls

---

## 21. Export Center

### Data Export Center
* **Route**: `/exports`
* **Modules Supported**: Transactions, Income, Expenses, Budgets, Investments, Reports.
* **Supported Formats**:
  - `CSV`
  - `Excel (.xlsx)`
  - `PDF Report`

---

## 22. Settings

### Settings Hub & Sub-pages
* **Route**: `/settings`

| Sub-page | Route | Purpose |
| :--- | :--- | :--- |
| **Profile** | `/settings/profile` | Update user name, email, avatar. |
| **Security** | `/settings/security` | Change password, active session tokens, logout. |
| **Categories** | `/settings/categories` | Manage custom categories and default colors. |
| **Accounts** | `/settings/accounts` | Default payment accounts, account ordering. |
| **Budget** | `/settings/budget` | Warning threshold percentages (e.g. 80%, 100%). |
| **Notifications** | `/settings/notifications` | Toggle in-app alert categories. |
| **Appearance** | `/settings/appearance` | Light mode, Dark mode, System theme. |

---

## 23. Recommended Final Page & Routing Tree

```text
/
├── login
├── register
│
└── (dashboard)
    │
    ├── dashboard
    │
    ├── transactions
    │   ├── new
    │   └── [id]
    │
    ├── income
    │   ├── new
    │   └── [id]
    │
    ├── accounts
    │   ├── new
    │   └── [id]
    │
    ├── categories
    │   └── [id]
    │
    ├── budget
    │   ├── allocation
    │   ├── history
    │   ├── templates
    │   └── [id]
    │
    ├── fixed-expenses
    │   ├── new
    │   └── [id]
    │
    ├── recurring
    │   └── [id]
    │
    ├── savings
    │   └── goals
    │       ├── new
    │       └── [id]
    │
    ├── investments
    │   ├── new
    │   └── [id]
    │
    ├── loans
    │   ├── new
    │   └── [id]
    │
    ├── goals
    │   ├── new
    │   └── [id]
    │
    ├── reports
    │   ├── monthly
    │   ├── yearly
    │   └── net-worth
    │
    ├── analytics
    │   ├── spending
    │   ├── categories
    │   └── budget
    │
    ├── notifications
    │
    ├── exports
    │
    └── settings
        ├── profile
        ├── security
        ├── categories
        ├── accounts
        ├── budget
        ├── notifications
        └── appearance
```

### Suggested Desktop Navigation Structure

```text
Dashboard

Transactions
Income
Accounts

Budget
├── Monthly Budget
├── Salary Allocation
└── Fixed Expenses

Savings & Investments
├── Savings
├── Investments
└── Goals

Loans / EMI

Reports
Analytics

Notifications

Settings
```

> [!TIP]
> This structure yields **20–25 distinct routes**. Several CRUD actions and payment logs can be presented as drawers or modal dialogs rather than dedicated full-screen pages to optimize speed and user experience.