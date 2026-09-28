# Personal Finance & Salary Tracker

## 1. Project Overview

A personal finance management system for tracking:

* Multiple income sources
* Salary allocation
* Monthly budgets
* Expenses and spending
* Categories and subcategories
* Fixed/recurring expenses
* Savings
* Investments
* Financial goals
* EMI/loans
* Bank/cash accounts
* Net worth
* Financial reports
* Advanced spending analytics

### Technology

| Layer             | Technology                   |
| ----------------- | ---------------------------- |
| Backend           | Node.js                      |
| API               | Express.js                   |
| Database          | PostgreSQL                   |
| API Style         | REST                         |
| Authentication    | JWT                          |
| ORM               | Prisma / Drizzle / Sequelize |
| API Documentation | Swagger / OpenAPI            |
| Validation        | Zod / Joi                    |
| Testing           | Jest + Supertest             |
| Frontend          | Next.js                      |
| Future Mobile     | React Native / Expo          |

---

# 2. Core Design Principles

The backend should distinguish between:

### Budget

How much money is **allowed/planned** for a category.

### Transaction

What actually happened with the money.

### Account

Where the money physically exists.

### Investment

Money moved into an investment.

### Savings

Money allocated toward a savings goal.

### Transfer

Money moved between accounts.

These should not be treated as the same thing.

For example:

```text
Salary
  ↓
Income Transaction
  ↓
Monthly Budget
  ├── Food ₹5,000
  ├── Transport ₹4,000
  ├── Investment ₹10,000
  └── Savings ₹7,500
```

Actual spending then consumes the budget:

```text
Food Budget = ₹5,000

Restaurant = ₹500
Groceries  = ₹1,500
Snacks     = ₹300

Spent      = ₹2,300
Remaining  = ₹2,700
```

---

# 3. Database Tables

## 3.1 `users`

Stores application users.

Even though the application is initially for one user, authentication should be designed around a user table.

| Column        | Type         | Conditions       |
| ------------- | ------------ | ---------------- |
| id            | UUID         | PK               |
| name          | VARCHAR(100) | NOT NULL         |
| email         | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | TEXT         | NOT NULL         |
| is_active     | BOOLEAN      | DEFAULT TRUE     |
| created_at    | TIMESTAMP    | NOT NULL         |
| updated_at    | TIMESTAMP    | NOT NULL         |

---

# 3.2 `accounts`

Represents where money is held.

Examples:

* HDFC Salary Account
* SBI Savings
* Cash

| Column          | Type          | Conditions    |
| --------------- | ------------- | ------------- |
| id              | UUID          | PK            |
| user_id         | UUID          | FK → users.id |
| name            | VARCHAR(100)  | NOT NULL      |
| account_type    | VARCHAR       | NOT NULL      |
| opening_balance | NUMERIC(15,2) | DEFAULT 0     |
| is_active       | BOOLEAN       | DEFAULT TRUE  |
| created_at      | TIMESTAMP     | NOT NULL      |
| updated_at      | TIMESTAMP     | NOT NULL      |

### `account_type`

Recommended values:

```text
BANK
CASH
OTHER
```

### Conditions

* Account belongs to a user.
* Account cannot be physically deleted if transactions exist.
* Use `is_active = false` instead.

---

# 3.3 `income_sources`

Defines where income comes from.

Examples:

```text
Salary
Freelancing
Interest
Other
```

| Column     | Type         | Conditions    |
| ---------- | ------------ | ------------- |
| id         | UUID         | PK            |
| user_id    | UUID         | FK            |
| name       | VARCHAR(100) | NOT NULL      |
| is_salary  | BOOLEAN      | DEFAULT FALSE |
| is_active  | BOOLEAN      | DEFAULT TRUE  |
| created_at | TIMESTAMP    | NOT NULL      |
| updated_at | TIMESTAMP    | NOT NULL      |

Only one source needs to be marked as the primary salary source initially, but the schema can support multiple salary sources.

---

# 3.4 `income_transactions`

Records actual income received.

| Column                   | Type          | Conditions    |
| ------------------------ | ------------- | ------------- |
| id                       | UUID          | PK            |
| user_id                  | UUID          | FK            |
| income_source_id         | UUID          | FK            |
| account_id               | UUID          | FK            |
| amount                   | NUMERIC(15,2) | NOT NULL, > 0 |
| received_date            | DATE          | NOT NULL      |
| description              | TEXT          | NULL          |
| is_recurring             | BOOLEAN       | DEFAULT FALSE |
| recurring_transaction_id | UUID          | NULL          |
| notes                    | TEXT          | NULL          |
| created_at               | TIMESTAMP     | NOT NULL      |
| updated_at               | TIMESTAMP     | NOT NULL      |

### Conditions

* `amount > 0`
* Income source must belong to the same user.
* Account must belong to the same user.
* Salary income can trigger salary allocation.

---

# 3.5 `categories`

Main expense/income categories.

Examples:

```text
Food
Transport
Shopping
Entertainment
Bills
Investment
Savings
```

| Column        | Type         | Conditions   |
| ------------- | ------------ | ------------ |
| id            | UUID         | PK           |
| user_id       | UUID         | FK           |
| name          | VARCHAR(100) | NOT NULL     |
| category_type | VARCHAR(30)  | NOT NULL     |
| description   | TEXT         | NULL         |
| is_active     | BOOLEAN      | DEFAULT TRUE |
| created_at    | TIMESTAMP    | NOT NULL     |
| updated_at    | TIMESTAMP    | NOT NULL     |

### `category_type`

```text
EXPENSE
INCOME
SAVING
INVESTMENT
```

For v1, most transaction categories will be `EXPENSE`.

### Conditions

```text
UNIQUE(user_id, name, category_type)
```

Use soft deletion.

---

# 3.6 `subcategories`

Child categories.

Example:

```text
Food
├── Groceries
├── Restaurant
├── Snacks
└── Delivery
```

| Column      | Type         | Conditions   |
| ----------- | ------------ | ------------ |
| id          | UUID         | PK           |
| category_id | UUID         | FK           |
| name        | VARCHAR(100) | NOT NULL     |
| description | TEXT         | NULL         |
| is_active   | BOOLEAN      | DEFAULT TRUE |
| created_at  | TIMESTAMP    | NOT NULL     |
| updated_at  | TIMESTAMP    | NOT NULL     |

### Conditions

```text
UNIQUE(category_id, name)
```

A subcategory cannot exist without a parent category.

---

# 3.7 `transactions`

Main table for actual spending and financial movements.

| Column                   | Type          | Conditions    |
| ------------------------ | ------------- | ------------- |
| id                       | UUID          | PK            |
| user_id                  | UUID          | FK            |
| transaction_type         | VARCHAR(30)   | NOT NULL      |
| amount                   | NUMERIC(15,2) | NOT NULL, > 0 |
| category_id              | UUID          | NULL          |
| subcategory_id           | UUID          | NULL          |
| account_id               | UUID          | FK            |
| transaction_date         | DATE          | NOT NULL      |
| payment_method           | VARCHAR(30)   | NULL          |
| description              | TEXT          | NULL          |
| recurring_transaction_id | UUID          | NULL          |
| notes                    | TEXT          | NULL          |
| created_at               | TIMESTAMP     | NOT NULL      |
| updated_at               | TIMESTAMP     | NOT NULL      |

### `transaction_type`

```text
EXPENSE
TRANSFER
SAVING
INVESTMENT
LOAN_PAYMENT
```

Income is kept in `income_transactions`.

### `payment_method`

```text
CASH
UPI
DEBIT_CARD
BANK_TRANSFER
OTHER
```

### Conditions

* `amount > 0`
* Expense should have a category.
* Expense should normally have a subcategory.
* Account must belong to the user.
* Category must belong to the user.
* Subcategory must belong to the selected category.

---

# 3.8 `budget_templates`

Defines reusable salary allocation templates.

Example:

```text
Normal Salary Budget
```

| Column      | Type         | Conditions   |
| ----------- | ------------ | ------------ |
| id          | UUID         | PK           |
| user_id     | UUID         | FK           |
| name        | VARCHAR(100) | NOT NULL     |
| description | TEXT         | NULL         |
| is_active   | BOOLEAN      | DEFAULT TRUE |
| created_at  | TIMESTAMP    | NOT NULL     |
| updated_at  | TIMESTAMP    | NOT NULL     |

---

# 3.9 `budget_template_items`

Defines the percentage allocation.

Example:

```text
Normal Salary Budget

Fixed Expenses → 30%
Investment      → 20%
Savings         → 15%
Food            → 10%
Transport       → 8%
Personal        → 7%
Entertainment   → 5%
Emergency       → 5%
```

| Column             | Type         | Conditions  |
| ------------------ | ------------ | ----------- |
| id                 | UUID         | PK          |
| budget_template_id | UUID         | FK          |
| category_id        | UUID         | FK          |
| percentage         | NUMERIC(5,2) | > 0, <= 100 |
| created_at         | TIMESTAMP    | NOT NULL    |
| updated_at         | TIMESTAMP    | NOT NULL    |

### Important condition

For an active template:

```text
SUM(percentage) = 100
```

The API must reject activation if the total is not 100%.

---

# 3.10 `monthly_budgets`

Represents the actual budget generated for a particular month.

Example:

```text
September 2026
Salary = ₹50,000
```

| Column                | Type          | Conditions |
| --------------------- | ------------- | ---------- |
| id                    | UUID          | PK         |
| user_id               | UUID          | FK         |
| budget_template_id    | UUID          | FK         |
| income_transaction_id | UUID          | FK         |
| month                 | INTEGER       | 1-12       |
| year                  | INTEGER       | Valid year |
| allocated_amount      | NUMERIC(15,2) | > 0        |
| created_at            | TIMESTAMP     | NOT NULL   |
| updated_at            | TIMESTAMP     | NOT NULL   |

### Conditions

```text
UNIQUE(user_id, month, year)
```

Only one primary monthly budget per month.

---

# 3.11 `monthly_budget_items`

Actual bucket allocations for the month.

| Column            | Type          | Conditions |
| ----------------- | ------------- | ---------- |
| id                | UUID          | PK         |
| monthly_budget_id | UUID          | FK         |
| category_id       | UUID          | FK         |
| allocated_amount  | NUMERIC(15,2) | >= 0       |
| spent_amount      | NUMERIC(15,2) | DEFAULT 0  |
| percentage        | NUMERIC(5,2)  | >= 0       |
| created_at        | TIMESTAMP     | NOT NULL   |
| updated_at        | TIMESTAMP     | NOT NULL   |

### Derived values

```text
remaining =
allocated_amount - spent_amount
```

```text
usage_percentage =
spent_amount / allocated_amount × 100
```

### Important

`spent_amount` can exceed `allocated_amount`.

Example:

```text
Budget = ₹5,000
Spent  = ₹5,800

Exceeded = ₹800
```

The system warns but does not block the transaction.

---

# 3.12 `fixed_expenses`

Stores recurring/fixed financial commitments.

Examples:

* Rent
* Internet
* EMI
* Insurance
* Subscription

| Column         | Type          | Conditions   |
| -------------- | ------------- | ------------ |
| id             | UUID          | PK           |
| user_id        | UUID          | FK           |
| name           | VARCHAR(150)  | NOT NULL     |
| amount         | NUMERIC(15,2) | > 0          |
| category_id    | UUID          | FK           |
| subcategory_id | UUID          | FK           |
| account_id     | UUID          | FK           |
| frequency      | VARCHAR(30)   | NOT NULL     |
| next_due_date  | DATE          | NOT NULL     |
| start_date     | DATE          | NOT NULL     |
| end_date       | DATE          | NULL         |
| auto_generate  | BOOLEAN       | DEFAULT TRUE |
| is_active      | BOOLEAN       | DEFAULT TRUE |
| description    | TEXT          | NULL         |
| created_at     | TIMESTAMP     | NOT NULL     |
| updated_at     | TIMESTAMP     | NOT NULL     |

### `frequency`

```text
WEEKLY
MONTHLY
YEARLY
```

Can later support custom recurrence.

---

# 3.13 `recurring_transactions`

Generic recurring transaction configuration.

This can support recurring income and expenses.

| Column           | Type          | Conditions   |
| ---------------- | ------------- | ------------ |
| id               | UUID          | PK           |
| user_id          | UUID          | FK           |
| name             | VARCHAR(150)  | NOT NULL     |
| transaction_type | VARCHAR(30)   | NOT NULL     |
| amount           | NUMERIC(15,2) | > 0          |
| category_id      | UUID          | NULL         |
| subcategory_id   | UUID          | NULL         |
| account_id       | UUID          | FK           |
| payment_method   | VARCHAR(30)   | NULL         |
| frequency        | VARCHAR(30)   | NOT NULL     |
| start_date       | DATE          | NOT NULL     |
| end_date         | DATE          | NULL         |
| next_run_date    | DATE          | NOT NULL     |
| is_active        | BOOLEAN       | DEFAULT TRUE |
| notes            | TEXT          | NULL         |
| created_at       | TIMESTAMP     | NOT NULL     |
| updated_at       | TIMESTAMP     | NOT NULL     |

---

# 3.14 `savings_goals`

Tracks savings targets.

Examples:

```text
Emergency Fund
New PC
Bike
Vacation
```

| Column         | Type          | Conditions |
| -------------- | ------------- | ---------- |
| id             | UUID          | PK         |
| user_id        | UUID          | FK         |
| name           | VARCHAR(150)  | NOT NULL   |
| target_amount  | NUMERIC(15,2) | > 0        |
| current_amount | NUMERIC(15,2) | DEFAULT 0  |
| target_date    | DATE          | NULL       |
| description    | TEXT          | NULL       |
| status         | VARCHAR(30)   | NOT NULL   |
| created_at     | TIMESTAMP     | NOT NULL   |
| updated_at     | TIMESTAMP     | NOT NULL   |

### `status`

```text
ACTIVE
COMPLETED
PAUSED
CANCELLED
```

---

# 3.15 `savings_contributions`

Tracks money added to savings goals.

| Column            | Type          | Conditions |
| ----------------- | ------------- | ---------- |
| id                | UUID          | PK         |
| savings_goal_id   | UUID          | FK         |
| account_id        | UUID          | FK         |
| amount            | NUMERIC(15,2) | > 0        |
| contribution_date | DATE          | NOT NULL   |
| transaction_id    | UUID          | FK         |
| notes             | TEXT          | NULL       |
| created_at        | TIMESTAMP     | NOT NULL   |

---

# 3.16 `investments`

Investment categories.

Examples:

```text
Mutual Fund
Gold
FD
```

| Column          | Type         | Conditions   |
| --------------- | ------------ | ------------ |
| id              | UUID         | PK           |
| user_id         | UUID         | FK           |
| name            | VARCHAR(150) | NOT NULL     |
| investment_type | VARCHAR(30)  | NOT NULL     |
| description     | TEXT         | NULL         |
| is_active       | BOOLEAN      | DEFAULT TRUE |
| created_at      | TIMESTAMP    | NOT NULL     |
| updated_at      | TIMESTAMP    | NOT NULL     |

### `investment_type`

```text
MUTUAL_FUND
GOLD
FD
OTHER
```

---

# 3.17 `investment_contributions`

Tracks money invested.

| Column          | Type          | Conditions |
| --------------- | ------------- | ---------- |
| id              | UUID          | PK         |
| investment_id   | UUID          | FK         |
| account_id      | UUID          | FK         |
| amount          | NUMERIC(15,2) | > 0        |
| investment_date | DATE          | NOT NULL   |
| transaction_id  | UUID          | FK         |
| notes           | TEXT          | NULL       |
| created_at      | TIMESTAMP     | NOT NULL   |

This intentionally tracks **contributions**, not current market value.

---

# 3.18 `loans`

Dedicated EMI/loan tracking.

| Column           | Type          | Conditions |
| ---------------- | ------------- | ---------- |
| id               | UUID          | PK         |
| user_id          | UUID          | FK         |
| name             | VARCHAR(150)  | NOT NULL   |
| principal_amount | NUMERIC(15,2) | > 0        |
| interest_rate    | NUMERIC(5,2)  | >= 0       |
| emi_amount       | NUMERIC(15,2) | > 0        |
| tenure_months    | INTEGER       | > 0        |
| start_date       | DATE          | NOT NULL   |
| end_date         | DATE          | NULL       |
| status           | VARCHAR(30)   | NOT NULL   |
| description      | TEXT          | NULL       |
| created_at       | TIMESTAMP     | NOT NULL   |
| updated_at       | TIMESTAMP     | NOT NULL   |

### `status`

```text
ACTIVE
COMPLETED
CANCELLED
```

---

# 3.19 `loan_payments`

Tracks EMI payments.

| Column         | Type          | Conditions |
| -------------- | ------------- | ---------- |
| id             | UUID          | PK         |
| loan_id        | UUID          | FK         |
| account_id     | UUID          | FK         |
| transaction_id | UUID          | FK         |
| amount         | NUMERIC(15,2) | > 0        |
| payment_date   | DATE          | NOT NULL   |
| notes          | TEXT          | NULL       |
| created_at     | TIMESTAMP     | NOT NULL   |

---

# 3.20 `financial_goals`

General financial goals separate from savings goals.

Example:

```text
Buy a car
Buy a house
Build emergency reserve
Travel
```

| Column         | Type          | Conditions |
| -------------- | ------------- | ---------- |
| id             | UUID          | PK         |
| user_id        | UUID          | FK         |
| name           | VARCHAR(150)  | NOT NULL   |
| target_amount  | NUMERIC(15,2) | > 0        |
| target_date    | DATE          | NULL       |
| current_amount | NUMERIC(15,2) | DEFAULT 0  |
| status         | VARCHAR(30)   | NOT NULL   |
| description    | TEXT          | NULL       |
| created_at     | TIMESTAMP     | NOT NULL   |
| updated_at     | TIMESTAMP     | NOT NULL   |

---

# 3.21 `financial_goal_contributions`

| Column            | Type          | Conditions |
| ----------------- | ------------- | ---------- |
| id                | UUID          | PK         |
| financial_goal_id | UUID          | FK         |
| amount            | NUMERIC(15,2) | > 0        |
| contribution_date | DATE          | NOT NULL   |
| transaction_id    | UUID          | NULL       |
| notes             | TEXT          | NULL       |
| created_at        | TIMESTAMP     | NOT NULL   |

---

# 3.22 `notifications`

Stores in-app notifications.

| Column            | Type         | Conditions    |
| ----------------- | ------------ | ------------- |
| id                | UUID         | PK            |
| user_id           | UUID         | FK            |
| title             | VARCHAR(200) | NOT NULL      |
| message           | TEXT         | NOT NULL      |
| notification_type | VARCHAR(50)  | NOT NULL      |
| reference_id      | UUID         | NULL          |
| is_read           | BOOLEAN      | DEFAULT FALSE |
| created_at        | TIMESTAMP    | NOT NULL      |

### Examples

```text
BUDGET_WARNING
BUDGET_EXCEEDED
BILL_DUE
GOAL_COMPLETED
EMI_DUE
```

---

# 4. Database Relationships

The major relationships are:

```text
users
 │
 ├── accounts
 │
 ├── income_sources
 │       └── income_transactions
 │
 ├── categories
 │       └── subcategories
 │
 ├── transactions
 │
 ├── budget_templates
 │       └── budget_template_items
 │
 ├── monthly_budgets
 │       └── monthly_budget_items
 │
 ├── fixed_expenses
 │
 ├── recurring_transactions
 │
 ├── savings_goals
 │       └── savings_contributions
 │
 ├── investments
 │       └── investment_contributions
 │
 ├── loans
 │       └── loan_payments
 │
 ├── financial_goals
 │       └── financial_goal_contributions
 │
 └── notifications
```

---

# 5. REST API

Base URL:

```text
/api/v1
```

Authentication:

```text
Authorization: Bearer <JWT>
```

---

# 6. Authentication APIs

## POST `/auth/register`

Create a user account.

### Request

```json
{
  "name": "Akash",
  "email": "user@example.com",
  "password": "password"
}
```

---

## POST `/auth/login`

Authenticate user.

Returns:

```json
{
  "accessToken": "...",
  "user": {}
}
```

---

## POST `/auth/refresh`

Refresh access token.

---

## GET `/auth/me`

Returns authenticated user information.

---

## POST `/auth/logout`

Invalidate/logout the current session if refresh-token/session management is implemented.

---

# 7. Account APIs

## GET `/accounts`

Get all accounts.

## GET `/accounts/:id`

Get account details and balance.

## POST `/accounts`

Create an account.

## PATCH `/accounts/:id`

Update an account.

## DELETE `/accounts/:id`

Deactivate an account.

---

# 8. Income Source APIs

## GET `/income-sources`

List income sources.

## POST `/income-sources`

Create income source.

## GET `/income-sources/:id`

Get income source.

## PATCH `/income-sources/:id`

Update income source.

## DELETE `/income-sources/:id`

Deactivate income source.

---

# 9. Income APIs

## GET `/income`

List income transactions.

Supported filters:

```text
from
to
incomeSource
account
isSalary
page
limit
```

## GET `/income/:id`

Get income transaction.

## POST `/income`

Record income.

## PATCH `/income/:id`

Update income.

## DELETE `/income/:id`

Delete income transaction.

---

# 10. Category APIs

## GET `/categories`

List categories.

Optional:

```text
type=EXPENSE
includeInactive=false
```

## POST `/categories`

Create category.

## GET `/categories/:id`

Get category with subcategories.

## PATCH `/categories/:id`

Update category.

## DELETE `/categories/:id`

Deactivate category.

---

# 11. Subcategory APIs

## GET `/categories/:categoryId/subcategories`

List subcategories.

## POST `/categories/:categoryId/subcategories`

Create subcategory.

## GET `/subcategories/:id`

Get subcategory.

## PATCH `/subcategories/:id`

Update subcategory.

## DELETE `/subcategories/:id`

Deactivate subcategory.

---

# 12. Transaction APIs

## GET `/transactions`

List transactions.

Filters:

```text
from
to
type
category
subcategory
account
paymentMethod
page
limit
sort
```

## GET `/transactions/:id`

Get transaction.

## POST `/transactions`

Create transaction.

## PATCH `/transactions/:id`

Update transaction.

## DELETE `/transactions/:id`

Delete transaction.

---

# 13. Budget Template APIs

## GET `/budget-templates`

List budget templates.

## POST `/budget-templates`

Create budget template.

## GET `/budget-templates/:id`

Get template with allocation items.

## PATCH `/budget-templates/:id`

Update template.

## DELETE `/budget-templates/:id`

Deactivate template.

---

# 14. Budget Template Item APIs

## POST `/budget-templates/:id/items`

Add allocation category.

Example:

```json
{
  "categoryId": "uuid",
  "percentage": 20
}
```

## PATCH `/budget-templates/:id/items/:itemId`

Update allocation percentage.

## DELETE `/budget-templates/:id/items/:itemId`

Remove allocation.

## POST `/budget-templates/:id/validate`

Validate that allocation equals 100%.

Response:

```json
{
  "valid": true,
  "totalPercentage": 100
}
```

---

# 15. Monthly Budget APIs

## GET `/budgets`

List monthly budgets.

Filters:

```text
year
month
```

## GET `/budgets/:id`

Get complete monthly budget.

## POST `/budgets/generate`

Generate monthly budget from salary and template.

### Request

```json
{
  "incomeTransactionId": "uuid",
  "budgetTemplateId": "uuid"
}
```

The server calculates every allocation.

---

## GET `/budgets/:id/summary`

Returns:

```json
{
  "allocated": 50000,
  "spent": 27500,
  "remaining": 22500,
  "percentageUsed": 55
}
```

---

## GET `/budgets/:id/items`

Returns all budget buckets.

---

## GET `/budgets/:id/items/:itemId`

Returns one budget bucket.

---

# 16. Fixed Expense APIs

## GET `/fixed-expenses`

List fixed expenses.

## POST `/fixed-expenses`

Create fixed expense.

## GET `/fixed-expenses/:id`

Get fixed expense.

## PATCH `/fixed-expenses/:id`

Update fixed expense.

## DELETE `/fixed-expenses/:id`

Deactivate fixed expense.

## POST `/fixed-expenses/:id/generate`

Generate the next planned transaction.

---

# 17. Recurring Transaction APIs

## GET `/recurring-transactions`

List recurring transactions.

## POST `/recurring-transactions`

Create recurring rule.

## GET `/recurring-transactions/:id`

Get recurring rule.

## PATCH `/recurring-transactions/:id`

Update recurring rule.

## DELETE `/recurring-transactions/:id`

Deactivate recurring rule.

## POST `/recurring-transactions/:id/generate`

Generate the next transaction.

---

# 18. Savings Goal APIs

## GET `/savings-goals`

List savings goals.

## POST `/savings-goals`

Create savings goal.

## GET `/savings-goals/:id`

Get goal details.

## PATCH `/savings-goals/:id`

Update goal.

## DELETE `/savings-goals/:id`

Delete/deactivate goal.

## GET `/savings-goals/:id/contributions`

List contributions.

## POST `/savings-goals/:id/contributions`

Add contribution.

## DELETE `/savings-goals/:id/contributions/:contributionId`

Remove contribution.

---

# 19. Investment APIs

## GET `/investments`

List investments.

## POST `/investments`

Create investment type.

## GET `/investments/:id`

Get investment.

## PATCH `/investments/:id`

Update investment.

## DELETE `/investments/:id`

Deactivate investment.

## GET `/investments/:id/contributions`

List contributions.

## POST `/investments/:id/contributions`

Record investment contribution.

## DELETE `/investments/:id/contributions/:contributionId`

Delete contribution.

---

# 20. Loan / EMI APIs

## GET `/loans`

List loans.

## POST `/loans`

Create loan.

## GET `/loans/:id`

Get loan details.

## PATCH `/loans/:id`

Update loan.

## DELETE `/loans/:id`

Deactivate loan.

## GET `/loans/:id/payments`

List EMI payments.

## POST `/loans/:id/payments`

Record EMI payment.

## DELETE `/loans/:id/payments/:paymentId`

Delete payment.

---

# 21. Financial Goal APIs

## GET `/financial-goals`

List goals.

## POST `/financial-goals`

Create financial goal.

## GET `/financial-goals/:id`

Get goal.

## PATCH `/financial-goals/:id`

Update goal.

## DELETE `/financial-goals/:id`

Deactivate goal.

## GET `/financial-goals/:id/contributions`

List contributions.

## POST `/financial-goals/:id/contributions`

Add contribution.

---

# 22. Dashboard APIs

The dashboard should not require the frontend to make 15 different API calls.

Create dedicated aggregation endpoints.

## GET `/dashboard`

Returns the main dashboard.

Example:

```json
{
  "income": 50000,
  "expenses": 27500,
  "savings": 7500,
  "investments": 10000,
  "remaining": 5000,
  "netWorth": 425000
}
```

---

## GET `/dashboard/cash-flow`

Returns monthly income and expense data.

Parameters:

```text
from
to
```

---

## GET `/dashboard/expense-breakdown`

Returns category-wise spending.

---

## GET `/dashboard/budget-utilization`

Returns:

```text
category
allocated
spent
remaining
percentageUsed
```

---

## GET `/dashboard/income-breakdown`

Income by source.

---

## GET `/dashboard/savings`

Savings history.

---

## GET `/dashboard/investments`

Investment contribution history.

---

## GET `/dashboard/net-worth`

Net-worth history.

---

# 23. Reports APIs

## GET `/reports/monthly`

Parameters:

```text
year
month
```

Returns:

* Total income
* Total expenses
* Savings
* Investments
* Fixed expenses
* Variable expenses
* Budget performance
* Category breakdown
* Net worth

---

## GET `/reports/yearly`

Parameters:

```text
year
```

Returns yearly financial summary.

---

## GET `/reports/net-worth`

Parameters:

```text
from
to
```

Returns net-worth history.

---

## GET `/reports/category`

Parameters:

```text
from
to
category
```

Returns category analysis.

---

## GET `/reports/cash-flow`

Parameters:

```text
from
to
```

Returns:

```text
Income
Expenses
Savings
Investments
Net Cash Flow
```

---

# 24. Analytics APIs

## GET `/analytics/spending-trends`

Analyzes spending over time.

---

## GET `/analytics/category-trends`

Shows category spending trends.

---

## GET `/analytics/budget-performance`

Compares:

```text
Budget
vs
Actual
```

---

## GET `/analytics/savings-rate`

Calculates savings rate.

---

## GET `/analytics/fixed-expense-ratio`

Calculates fixed expense percentage.

---

## GET `/analytics/income-growth`

Shows income changes over time.

---

## GET `/analytics/spending-anomalies`

Identifies unusual spending compared with historical patterns.

---

# 25. Net Worth APIs

## GET `/net-worth`

Current net worth.

## GET `/net-worth/history`

Historical net worth.

### Formula

```text
Net Worth =
Assets - Liabilities
```

Assets:

```text
Bank balances
Cash
Savings
Investment contributions
FD
RD
Gold
```

Liabilities:

```text
Remaining loan/EMI balances
```

---

# 26. Notification APIs

## GET `/notifications`

List notifications.

## GET `/notifications/unread`

List unread notifications.

## PATCH `/notifications/:id/read`

Mark notification as read.

## PATCH `/notifications/read-all`

Mark all notifications as read.

---

# 27. Export APIs

## GET `/exports/transactions`

Export transactions.

Supported:

```text
CSV
XLSX
```

---

## GET `/exports/monthly-report`

Generate monthly PDF report.

Parameters:

```text
year
month
```

---

## GET `/exports/yearly-report`

Generate yearly PDF report.

---

# 28. Important Business Rules

## Salary allocation

```text
Salary Received
        ↓
Select Budget Template
        ↓
Validate allocation = 100%
        ↓
Generate Monthly Budget
```

---

## Budget warning

```text
Usage < 80%
    ↓
Normal

Usage >= 80%
    ↓
WARNING

Usage >= 100%
    ↓
EXCEEDED
```

Transactions are **never blocked** because of budget limits.

---

## Category deletion

Categories with historical transactions should not be physically deleted.

Instead:

```text
is_active = false
```

---

## Budget calculation

```text
remaining =
allocated_amount - actual_spending
```

Can become negative.

Example:

```text
Allocated = ₹5,000
Spent     = ₹5,800

Remaining = -₹800
```

---

## Monthly budget

Only one primary monthly budget should exist for a user/month:

```text
UNIQUE(user_id, year, month)
```

---

## Budget template

An active budget template must satisfy:

```text
SUM(allocation percentages) = 100%
```

---

## Money transfer

Transfers between accounts must not count as income or expense.

Example:

```text
HDFC ₹50,000
     ↓
SBI ₹10,000
```

Net financial position:

```text
₹0 change
```

Only account distribution changed.

---

# 29. API Response Standard

All APIs should use a consistent response structure.

### Success

```json
{
  "success": true,
  "data": {},
  "message": "Transaction created successfully"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be greater than zero",
    "details": []
  }
}
```

---

# 30. Pagination

List APIs should support:

```text
?page=1&limit=20
```

Response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "totalPages": 7
  }
}
```

---

# 31. Recommended API Project Structure

```text
backend/
│
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── swagger.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── accounts/
│   │   ├── income/
│   │   ├── categories/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── fixed-expenses/
│   │   ├── recurring-transactions/
│   │   ├── savings/
│   │   ├── investments/
│   │   ├── loans/
│   │   ├── goals/
│   │   ├── dashboard/
│   │   ├── reports/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── exports/
│   │
│   ├── routes/
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── calculations.ts
│   │   ├── pagination.ts
│   │   └── date.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   └── schema.prisma
│
├── tests/
│
├── .env
├── .env.example
├── package.json
└── README.md
```

---

# 32. Development Order

Do **not** implement all endpoints at once.

Build the backend in phases.

## Phase 1 — Foundation

```text
Express
PostgreSQL
ORM
Environment configuration
Error handling
Validation
Swagger
Logging
```

## Phase 2 — Authentication

```text
User
Register
Login
JWT
Protected routes
```

## Phase 3 — Basic Finance

```text
Accounts
Income Sources
Income
Categories
Subcategories
Transactions
```

## Phase 4 — Budget System

```text
Budget Templates
Budget Template Items
Salary Allocation
Monthly Budgets
Budget Tracking
Budget Warnings
```

## Phase 5 — Recurring Finance

```text
Fixed Expenses
Recurring Transactions
Planned Transactions
```

## Phase 6 — Savings & Investments

```text
Savings Goals
Savings Contributions
Investments
Investment Contributions
```

## Phase 7 — EMI

```text
Loans
Loan Payments
EMI tracking
```

## Phase 8 — Goals

```text
Financial Goals
Goal Contributions
```

## Phase 9 — Dashboard

```text
Cash Flow
Expense Breakdown
Budget Utilization
Savings
Investment
Net Worth
```

## Phase 10 — Reports & Analytics

```text
Monthly Report
Yearly Report
Net Worth Report
Category Analytics
Spending Trends
Budget Performance
```

## Phase 11 — Export

```text
CSV
Excel
PDF
```

---

# 33. MVP

For the first usable version, implement only:

```text
Authentication
     ↓
Accounts
     ↓
Income
     ↓
Categories
     ↓
Transactions
     ↓
Budget Templates
     ↓
Salary Allocation
     ↓
Monthly Budget
     ↓
Budget Tracking
     ↓
Dashboard
```

Then add:

```text
Fixed Expenses
Savings
Investments
Loans
Goals
Reports
Analytics
Exports
```

This keeps the first backend manageable while still establishing the correct architecture for the complete system.
