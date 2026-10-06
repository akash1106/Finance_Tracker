# Personal Finance & Salary Tracker

## 1. Project Overview

A personal finance management system for personal/local usage.

The system tracks income, expenses, salary allocation, monthly budgets, fixed expenses, savings, investments, EMI/loans, financial goals, accounts, net worth, reports, analytics, notifications, and exports.

### Primary Objective

> Record where money comes from, allocate income into controlled budgets, track actual spending, monitor savings and investments, and provide a complete view of personal financial health.

---

# 2. Technology Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Charting library
- Responsive UI
- Dark mode

## Backend

- Node.js
- Express.js
- TypeScript
- REST API
- JWT authentication
- Swagger / OpenAPI

## Database

- PostgreSQL

## ORM

- Prisma recommended
- Drizzle ORM as an alternative

## Validation

- Zod recommended

## Testing

- Jest
- Supertest

## Future Mobile Application

- React Native
- Expo

The mobile application should consume the same REST API.

---

# 3. Main Objectives

The system should allow the user to:

1. Track multiple income sources.
2. Record salary/income received.
3. Allocate salary into customizable percentage-based budgets.
4. Track expenses against those budgets.
5. Warn when a budget approaches its limit.
6. Allow spending beyond a budget while clearly showing the exceeded amount.
7. Create and manage categories and subcategories.
8. Track fixed and recurring expenses.
9. Track savings and savings goals.
10. Track investment contributions.
11. Track EMI/loans.
12. Track financial goals.
13. Track bank/cash accounts.
14. Calculate net worth.
15. Generate monthly and yearly reports.
16. Analyze spending trends.
17. Export financial data to CSV/Excel.
18. Generate monthly/yearly PDF reports.
19. Provide a dashboard containing financial charts.
20. Support dark mode.
21. Maintain authentication and privacy.
22. Eventually support a mobile application.

---

# 4. Core Financial Concepts

The application must distinguish between:

### Income

Money received by the user.

### Budget

Planned amount allocated for a category or bucket.

### Transaction

Actual financial activity.

### Account

Where money is held.

### Savings

Money allocated toward a savings goal.

### Investment

Money contributed to an investment.

### Transfer

Money moved between accounts.

A transfer must not be counted as income or expense.

---

# 5. Application Modules

```text
Personal Finance System
│
├── Authentication
├── Dashboard
├── Income
├── Transactions
├── Categories
├── Accounts
├── Budget & Salary Allocation
├── Fixed Expenses
├── Recurring Transactions
├── Savings
├── Investments
├── EMI / Loans
├── Financial Goals
├── Reports
├── Analytics
├── Notifications
├── Export
└── Settings
```

# 6. Authentication

The application requires login.
Although initially intended for one user, the database should support a user entity.

### Features

- Register
- Login
- JWT authentication
- Protected API routes
- Refresh token
- Logout
- Current user information

All financial records must belong to a user.

# 7. Dashboard

The dashboard is the primary application screen.

### Summary Cards

- Total Income
- Total Expenses
- Total Savings
- Total Investments
- Available Money
- Net Worth
- Current Month Budget
- Budget Usage

### Charts

#### Income vs Expense

Monthly comparison of income and expenses.

#### Expense Breakdown

Category-based spending.

#### Budget Utilization

Shows allocated amount, spent amount, remaining amount, and usage percentage.

#### Income Source Breakdown

Shows income distribution by source.

#### Savings Trend

Monthly savings contributions.

#### Investment Trend

Monthly investment contributions.

#### Net Worth Trend

Historical net worth.

#### Fixed vs Variable Expenses

Comparison between fixed and variable spending.

#### Financial Goal Progress

Progress toward savings and financial goals.

# 8. Income Management

The system supports multiple income sources.

Examples:

- Salary
- Freelancing
- Interest
- Other

Each income transaction contains:

- Amount
- Income source
- Date
- Account
- Description
- Recurring status
- Notes

Salary is treated specially because it can trigger the salary allocation workflow.

# 9. Salary Allocation

The user can create customizable salary allocation templates.

Example:

Salary = ₹50,000

Fixed Expenses    30%
Investments       20%
Savings           15%
Food              10%
Transport          8%
Personal           7%
Entertainment      5%
Emergency          5%

Total allocation must equal 100%.

### Salary Allocation Requirements

- Percentage based.
- Categories can be added.
- Categories can be edited.
- Categories can be removed.
- Percentages can be changed.
- Templates can be created.
- Templates can be activated/deactivated.
- Active templates must total exactly 100%.
- A template can be selected when creating a monthly budget.
- The system calculates the allocated amount automatically.

# 10. Monthly Budget

Workflow:

Salary Received
       ↓
Select Budget Template
       ↓
Validate Allocation
       ↓
Calculate Amounts
       ↓
Create Monthly Budget
       ↓
Track Actual Spending

Example:

Salary = ₹50,000

Food          ₹5,000
Transport     ₹4,000
Investment   ₹10,000
Savings       ₹7,500
# 11. Budget Tracking

The system compares planned allocations with actual spending.

Example:

Food

Budget:     ₹5,000
Spent:      ₹4,250
Remaining:  ₹750
Used:       85%
### Budget Warning

At 80% usage:

WARNING

At 100% or above:

EXCEEDED

The system must never block a transaction because a budget was exceeded.

Example:

Budget:    ₹5,000
Spent:     ₹5,800
Exceeded:  ₹800
# 12. Categories

Category hierarchy:

Category
    ↓
Subcategory
    ↓
Transaction

Example:

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

Categories and subcategories support:

- Create
- Read
- Update
- Delete/deactivate

Historical categories should use soft deletion rather than physical deletion when transactions depend on them.

# 13. Transactions

Transaction fields:

- Amount
- Type
- Category
- Subcategory
- Date
- Account
- Description
- Payment Method
- Recurring
- Notes

Transaction types:

- Expense
- Transfer
- Saving
- Investment
- Loan Payment

Income is stored separately.

# 14. Fixed Expenses

Dedicated fixed-expense management.

Examples:

- Rent
- Internet
- Insurance
- EMI
- Subscription
- Other recurring bills

Each fixed expense supports:

- Name
- Amount
- Category
- Subcategory
- Account
- Frequency
- Due date
- Start date
- End date
- Auto generation
- Active/inactive status

Initial frequencies:

- Weekly
- Monthly
- Yearly

# 15. Recurring Transactions

Recurring transactions should generate planned transactions automatically.

Examples:

Salary       → Monthly
Rent         → Monthly
Internet     → Monthly
SIP          → Monthly
Insurance    → Yearly

The system distinguishes:

Planned Transaction
        vs
Actual Transaction

The user should be able to confirm a planned transaction as an actual transaction.

# 16. Savings

Savings support:

- Emergency Fund
- General Savings
- Savings Goals
- FD
- RD
- Bank balance
# 17. Savings Goals

Examples:
Examples:

Emergency Fund

```text
Target:      ₹2,00,000
Current:     ₹75,000
Remaining:   ₹1,25,000
Progress:    37.5%
```

Each savings goal supports:

- Name
- Target amount
- Current amount
- Target date
- Description
- Status
- Contributions

Statuses:

- Active
- Completed
- Paused
- Cancelled

# 18. Investments

Investment types:

- Mutual Fund
- Gold
- FD
- RD
- Other

The initial system tracks investment contributions only.

It does not require:

- Live NAV
- Market prices
- Portfolio APIs
- Current market value

Investment contribution fields:

- Investment type
- Amount
- Date
- Account
- Notes

# 19. EMI / Loans

Dedicated EMI/loan module.

Each loan tracks:

- Name
- Principal amount
- Interest rate
- EMI amount
- Tenure
- Start date
- End date
- Status

Statuses:

- Active
- Completed
- Cancelled

EMI payments are tracked separately.

# 20. Financial Goals

Financial goals are broader financial targets.

Examples:

- Buy a PC
- Buy a bike
- Buy a car
- Buy a house
- Vacation
- Emergency reserve

Each goal supports:

- Name
- Target amount
- Current amount
- Target date
- Status
- Contributions
- Description

# 21. Accounts

Basic account tracking is supported.

Examples:

- HDFC Salary Account
- SBI Savings
- Cash

No bank API integration is required for v1.

Account types:

- Bank
- Cash
- Other

Accounts track:

- Name
- Opening balance
- Current balance
- Active status

# 22. Money Transfers

Transfers between accounts must not count as income or expenses.

Example:

HDFC
₹50,000

      ↓ ₹10,000

SBI
₹10,000

The user's overall financial position does not change.

# 23. Net Worth

Formula:

`Net Worth = Assets - Liabilities`

### Assets

- Bank balances
- Cash
- Savings
- FD
- RD
- Investment contributions
- Gold

### Liabilities

- Remaining loans
- Remaining EMI balances

The application should provide historical net-worth data.

Because live investment valuation is not implemented in v1, investment figures should be clearly treated as contribution/book values rather than current market values.

# 24. Reports

## Monthly Report

Contains:

- Total income
- Total expenses
- Savings
- Investments
- Fixed expenses
- Variable expenses
- Budget performance
- Category breakdown
- Net worth
- Financial goals
- EMI payments

## Yearly Report

Contains:

- Total yearly income
- Total yearly expenses
- Total savings
- Total investments
- Category spending
- Monthly cash flow
- Net worth progression
- Budget performance

# 25. Advanced Analytics

The application should provide:

## Spending Trends

Analyze spending changes over time.

## Category Trends

Compare category spending across months.

## Budget Performance

Compare:

Planned

vs

Actual

## Savings Rate

Savings Rate =
(Savings + Investments) / Income × 100

## Fixed Expense Ratio

Fixed Expense Ratio =
Fixed Expenses / Income × 100

## Discretionary Spending

Discretionary Spending =
Total Expenses - Fixed Expenses

## Income Growth

Compare income across months and years.

## Spending Anomalies

Identify unusually high spending compared with historical spending patterns.

# 26. Notifications

Since the application is primarily local, v1 should use in-app notifications.

Examples:

- Salary received
- Budget approaching limit
- Budget exceeded
- Bill due
- EMI due
- Goal completed

Suggested budget thresholds:

| Usage | Status |
| --- | --- |
| < 80% | Normal |
| 80%-99% | Warning |
| >= 100% | Exceeded |

# 27. Export

The application should support:

## CSV

Export:

- Transactions
- Income
- Expenses
- Budgets
- Investments
- Fixed expenses

## Excel

Export the same financial data into XLSX.

## PDF

Generate:

- Monthly financial report
- Yearly financial report

Reports should contain financial summaries and charts where practical.

# 28. Settings

Settings should include:

- Profile
- Password
- Categories
- Subcategories
- Accounts
- Budget templates
- Notification preferences
- Theme
- Dark mode
- Export preferences

# 29. UI Navigation

Recommended navigation:

```text
Dashboard

Finance
├── Transactions
├── Income
├── Expenses
└── Accounts

Budget
├── Salary Allocation
├── Monthly Budget
├── Fixed Expenses
└── Categories

Savings & Investments
├── Savings
├── Investments
└── Goals

Debt
└── EMI / Loans

Reports
├── Monthly
├── Yearly
├── Net Worth
└── Analytics

Settings
├── Profile
├── Budget Templates
├── Categories
├── Accounts
└── Preferences
```

# 30. Backend Architecture

```text
                    ┌─────────────────────┐
                    │      Next.js        │
                    │      Web App        │
                    └──────────┬──────────┘
                               │
                            REST API
                               │
                    ┌──────────▼──────────┐
                    │   Node.js + Express │
                    │                     │
                    │ Authentication      │
                    │ Finance Logic       │
                    │ Budget Engine       │
                    │ Reports             │
                    │ Analytics           │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │     PostgreSQL      │
                    └─────────────────────┘
                               ▲
                               │
                    ┌──────────┴──────────┐
                    │ Future Mobile App   │
                    │ React Native/Expo   │
                    └─────────────────────┘
```

# 31. Important Financial Rules
## Money Precision

Use PostgreSQL:

`NUMERIC(15,2)`

Do not use PostgreSQL floating-point types for monetary values.

## Salary Allocation
```text
Salary Received
       ↓
Budget Template
       ↓
Validate total = 100%
       ↓
Create Monthly Budget
```
## Budget Exceeded

Budget limits are informational.

The application must not block spending.

## Category Deletion

Use soft deletion for categories and subcategories with historical transactions.

## Monthly Budget Uniqueness

Only one primary monthly budget should exist for a user/month.

`UNIQUE(user_id, year, month)`

## Transfers

Transfers between accounts do not count as:

- Income
- Expense
- Savings
- Investment

They only change account balances.

# 32. Recommended Development Phases

## Phase 1 — Backend Foundation

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma
- Environment configuration
- Error handling
- Validation
- Swagger
- Logging
- Testing setup

## Phase 2 — Authentication

- Users
- Register
- Login
- JWT
- Refresh token
- Protected routes

## Phase 3 — Core Finance

- Accounts
- Income Sources
- Income
- Categories
- Subcategories
- Transactions

## Phase 4 — Budget System

- Budget Templates
- Budget Template Items
- Salary Allocation
- Monthly Budgets
- Budget Tracking
- Budget Warnings

## Phase 5 — Recurring Finance

- Fixed Expenses
- Recurring Transactions
- Planned Transactions
- Confirmation workflow

## Phase 6 — Savings & Investments

- Savings Goals
- Savings Contributions
- Investments
- Investment Contributions

## Phase 7 — EMI

- Loans
- Loan Payments
- EMI tracking

## Phase 8 — Financial Goals

- Financial Goals
- Goal Contributions

## Phase 9 — Dashboard

- Cash Flow
- Expense Breakdown
- Budget Utilization
- Savings
- Investments
- Net Worth

## Phase 10 — Reports & Analytics

- Monthly Report
- Yearly Report
- Net Worth Report
- Category Analytics
- Spending Trends
- Budget Performance
- Anomaly Detection

## Phase 11 — Export

- CSV
- Excel
- PDF

## Phase 12 — Frontend

- Next.js
- Dashboard
- Finance pages
- Budget pages
- Reports
- Settings
- Dark mode

## Phase 13 — Mobile

- React Native / Expo
- Reuse existing REST API
'''

