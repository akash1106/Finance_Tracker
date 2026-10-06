import "dotenv/config";
import { PrismaClient } from "@prisma/client";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code: string; message: string; details?: unknown[] };
};

type User = { id: string; email: string };
type Account = { id: string };
type IncomeSource = { id: string };
type Category = { id: string };
type Subcategory = { id: string };
type Income = { id: string };
type Transaction = { id: string };
type BudgetTemplate = { id: string };
type Budget = { id: string };
type FixedExpense = { id: string };
type RecurringTransaction = { id: string };
type SavingsGoal = { id: string };
type Investment = { id: string };
type Loan = { id: string };
type FinancialGoal = { id: string };
type LoginData = { accessToken: string; user: User };

type ApiResult = {
  name: string;
  method: string;
  path: string;
  status: number;
  success: boolean;
  error?: string;
  details?: unknown;
};

const results: ApiResult[] = [];

const baseUrl = (process.env.API_BASE_URL ?? "http://localhost:3000/api/v1").replace(/\/$/, "");
const password = process.env.TEST_PASSWORD ?? "TestPassword123!";
const email = process.env.TEST_EMAIL ?? `api-smoke-${Date.now()}@example.com`;

const today = new Date();
const todayDateStr = today.toISOString().slice(0, 10);
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

const FALLBACK_TABLES = [
  "financial_goal_contributions",
  "financial_goals",
  "loan_payments",
  "loans",
  "investment_contributions",
  "investments",
  "savings_contributions",
  "savings_goals",
  "recurring_transactions",
  "fixed_expenses",
  "monthly_budget_items",
  "monthly_budgets",
  "budget_template_items",
  "budget_templates",
  "transactions",
  "subcategories",
  "categories",
  "income_transactions",
  "income_sources",
  "accounts",
  "notifications",
  "users",
];

function json(body: unknown): RequestInit {
  return { method: "POST", body: JSON.stringify(body) };
}

async function request<T>(name: string, path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? "GET";
  let status = 0;
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "content-type": "application/json",
        ...(options.headers ?? {}),
      },
    });
    status = response.status;
    const text = await response.text();
    let body: ApiResponse<T> | undefined;
    try {
      body = text ? (JSON.parse(text) as ApiResponse<T>) : undefined;
    } catch {
      // Non-JSON response
    }

    const isSuccess = response.ok && body?.success === true && !body?.error;

    if (!isSuccess) {
      let errorMsg: string;
      if (body?.error) {
        errorMsg = `[${body.error.code}] ${body.error.message}`;
      } else if (body?.message) {
        errorMsg = body.message;
      } else if (text) {
        errorMsg = text;
      } else {
        errorMsg = `HTTP ${status} ${response.statusText}`;
      }

      results.push({
        name,
        method,
        path,
        status,
        success: false,
        error: errorMsg,
        details: body?.error?.details,
      });

      console.error(`  ✖ [FAIL] ${name} -> ${method} ${path} (${status}): ${errorMsg}`);
      throw new Error(errorMsg);
    }

    results.push({
      name,
      method,
      path,
      status,
      success: true,
    });
    console.log(`  ✔ [PASS] ${name} -> ${method} ${path} (${status})`);
    return body?.data as T;
  } catch (error) {
    if (!results.some((r) => r.method === method && r.path === path && r.status === status)) {
      const msg = error instanceof Error ? error.message : String(error);
      results.push({
        name,
        method,
        path,
        status,
        success: false,
        error: msg,
      });
      console.error(`  ✖ [FAIL] ${name} -> ${method} ${path}: ${msg}`);
    }
    throw error;
  }
}

async function requestText(
  name: string,
  path: string,
  options: RequestInit = {},
  validator?: (text: string) => { valid: boolean; reason?: string },
): Promise<string> {
  const method = options.method ?? "GET";
  let status = 0;
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
      },
    });
    status = response.status;
    const text = await response.text();

    const validation = validator ? validator(text) : { valid: true };
    const isSuccess = response.ok && validation.valid;

    if (!isSuccess) {
      const errorMsg = !response.ok
        ? `HTTP ${status}: ${text || response.statusText}`
        : validation.reason ?? "Response validation failed";

      results.push({
        name,
        method,
        path,
        status,
        success: false,
        error: errorMsg,
      });

      console.error(`  ✖ [FAIL] ${name} -> ${method} ${path} (${status}): ${errorMsg}`);
      throw new Error(errorMsg);
    }

    results.push({
      name,
      method,
      path,
      status,
      success: true,
    });
    console.log(`  ✔ [PASS] ${name} -> ${method} ${path} (${status})`);
    return text;
  } catch (error) {
    if (!results.some((r) => r.method === method && r.path === path && r.status === status)) {
      const msg = error instanceof Error ? error.message : String(error);
      results.push({
        name,
        method,
        path,
        status,
        success: false,
        error: msg,
      });
      console.error(`  ✖ [FAIL] ${name} -> ${method} ${path}: ${msg}`);
    }
    throw error;
  }
}

async function requestDownload(name: string, path: string, options: RequestInit = {}): Promise<string> {
  const method = options.method ?? "GET";
  let status = 0;
  try {
    const response = await fetch(`${baseUrl}${path}`, options);
    status = response.status;
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      const errorMsg = `HTTP ${status}: ${text || response.statusText}`;

      results.push({
        name,
        method,
        path,
        status,
        success: false,
        error: errorMsg,
      });

      console.error(`  ✖ [FAIL] ${name} -> ${method} ${path} (${status}): ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const contentType = response.headers.get("content-type") ?? "";
    results.push({
      name,
      method,
      path,
      status,
      success: true,
    });
    console.log(`  ✔ [PASS] ${name} -> ${method} ${path} (${status}) [${contentType}]`);
    return contentType;
  } catch (error) {
    if (!results.some((r) => r.method === method && r.path === path && r.status === status)) {
      const msg = error instanceof Error ? error.message : String(error);
      results.push({
        name,
        method,
        path,
        status,
        success: false,
        error: msg,
      });
      console.error(`  ✖ [FAIL] ${name} -> ${method} ${path}: ${msg}`);
    }
    throw error;
  }
}

async function safeStep<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

async function clearDatabase(): Promise<void> {
  console.log("Clearing database (truncating tables while preserving schema)...");
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    let tables: string[] = [];
    try {
      const queryResult = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations';",
      );
      tables = queryResult.map((t) => t.tablename);
    } catch {
      tables = FALLBACK_TABLES;
    }

    if (tables.length === 0) {
      tables = FALLBACK_TABLES;
    }

    const tableList = tables.map((t) => `"${t}"`).join(", ");
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`);
    console.log(`✔ Database cleared successfully: truncated ${tables.length} tables (no data remaining, tables intact).`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`✖ Failed to clear database: ${errorMsg}`);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function printSummary(): void {
  const total = results.length;
  const passed = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log("\n============================================================");
  console.log("                   API SMOKE TEST SUMMARY");
  console.log("============================================================");
  console.log(`Total APIs tested: ${total}`);
  console.log(`Passed:            ${passed.length}`);
  console.log(`Failed:            ${failed.length}`);

  if (failed.length > 0) {
    console.log("\n------------------------------------------------------------");
    console.log(`FAILED APIS (${failed.length}):`);
    console.log("------------------------------------------------------------");
    failed.forEach((f, idx) => {
      console.log(`${idx + 1}. [${f.status || "ERR"}] ${f.method} ${f.path} (${f.name})`);
      console.log(`   Error: ${f.error}`);
      if (f.details && (!Array.isArray(f.details) || f.details.length > 0)) {
        console.log(`   Details: ${JSON.stringify(f.details, null, 2)}`);
      }
    });
    console.log("------------------------------------------------------------");
  } else {
    console.log("\n✔ SUCCESS: All tested APIs returned success with no errors!");
  }
  console.log("============================================================\n");
}

async function runTests(): Promise<void> {
  console.log("\n--- Testing API Health & Auth ---");
  await safeStep(() => request("Health Check", "/health"));
  await safeStep(() => request("Health Ready Check", "/health/ready"));

  const registered = await safeStep(() =>
    request<User>("Register User", "/auth/register", json({ name: "API Smoke Test", email, password })),
  );
  const login = await safeStep(() =>
    request<LoginData>("Login User", "/auth/login", json({ email, password })),
  );

  if (!registered || !login) {
    console.error("Critical prerequisite failed: cannot register or login. Skipping authenticated tests.");
    return;
  }

  if (registered.id !== login.user.id) {
    results.push({
      name: "User ID Match Validation",
      method: "POST",
      path: "/auth/register & /auth/login",
      status: 200,
      success: false,
      error: `Registered user ID (${registered.id}) does not match login user ID (${login.user.id})`,
    });
    console.error("  ✖ [FAIL] User ID match validation failed");
  }

  const headers = { Authorization: `Bearer ${login.accessToken}` };

  console.log("\n--- Setting Up Core Resources ---");
  const account = await safeStep(() =>
    request<Account>(
      "Create Account",
      "/accounts",
      { ...json({ name: "Smoke Test Bank", accountType: "BANK", openingBalance: 1000 }), headers },
    ),
  );
  const source = await safeStep(() =>
    request<IncomeSource>(
      "Create Income Source",
      "/income-sources",
      { ...json({ name: "Smoke Salary", isSalary: true }), headers },
    ),
  );
  const category = await safeStep(() =>
    request<Category>(
      "Create Category",
      "/categories",
      { ...json({ name: "Smoke Food", categoryType: "EXPENSE" }), headers },
    ),
  );
  const subcategory = category
    ? await safeStep(() =>
        request<Subcategory>(
          "Create Subcategory",
          `/categories/${category.id}/subcategories`,
          { ...json({ name: "Smoke Groceries" }), headers },
        ),
      )
    : undefined;

  const income = source && account
    ? await safeStep(() =>
        request<Income>(
          "Create Income",
          "/income",
          {
            ...json({
              incomeSourceId: source.id,
              accountId: account.id,
              amount: 50000,
              receivedDate: todayDateStr,
              description: "Smoke salary",
            }),
            headers,
          },
        ),
      )
    : undefined;

  const transaction = category && subcategory && account
    ? await safeStep(() =>
        request<Transaction>(
          "Create Transaction",
          "/transactions",
          {
            ...json({
              transactionType: "EXPENSE",
              amount: 250,
              categoryId: category.id,
              subcategoryId: subcategory.id,
              accountId: account.id,
              transactionDate: todayDateStr,
              paymentMethod: "UPI",
              description: "Smoke groceries",
            }),
            headers,
          },
        ),
      )
    : undefined;

  console.log("\n--- Setting Up Budget ---");
  const template = await safeStep(() =>
    request<BudgetTemplate>(
      "Create Budget Template",
      "/budget-templates",
      { ...json({ name: "Smoke Budget" }), headers },
    ),
  );

  if (template && category) {
    await safeStep(() =>
      request(
        "Add Budget Template Item",
        `/budget-templates/${template.id}/items`,
        { ...json({ categoryId: category.id, percentage: 100 }), headers },
      ),
    );
  }

  if (template) {
    await safeStep(() =>
      request(
        "Activate Budget Template",
        `/budget-templates/${template.id}`,
        { method: "PATCH", body: JSON.stringify({ isActive: true }), headers },
      ),
    );
  }

  const budget = income && template
    ? await safeStep(() =>
        request<Budget>(
          "Generate Budget",
          "/budgets/generate",
          { ...json({ incomeTransactionId: income.id, budgetTemplateId: template.id }), headers },
        ),
      )
    : undefined;

  console.log("\n--- Setting Up Fixed Expenses & Recurring ---");
  const fixedExpense = category && subcategory && account
    ? await safeStep(() =>
        request<FixedExpense>(
          "Create Fixed Expense",
          "/fixed-expenses",
          {
            ...json({
              name: "Smoke Rent",
              amount: 1000,
              categoryId: category.id,
              subcategoryId: subcategory.id,
              accountId: account.id,
              frequency: "MONTHLY",
              nextDueDate: todayDateStr,
              startDate: todayDateStr,
            }),
            headers,
          },
        ),
      )
    : undefined;

  if (fixedExpense) {
    await safeStep(() =>
      request("Generate Fixed Expense Instance", `/fixed-expenses/${fixedExpense.id}/generate`, { ...json({}), headers }),
    );
  }

  const recurring = category && subcategory && account
    ? await safeStep(() =>
        request<RecurringTransaction>(
          "Create Recurring Transaction",
          "/recurring-transactions",
          {
            ...json({
              name: "Smoke Subscription",
              transactionType: "EXPENSE",
              amount: 100,
              categoryId: category.id,
              subcategoryId: subcategory.id,
              accountId: account.id,
              frequency: "MONTHLY",
              startDate: todayDateStr,
              nextRunDate: todayDateStr,
            }),
            headers,
          },
        ),
      )
    : undefined;

  if (recurring) {
    await safeStep(() =>
      request("Generate Recurring Instance", `/recurring-transactions/${recurring.id}/generate`, { ...json({}), headers }),
    );
  }

  console.log("\n--- Setting Up Goals, Investments & Loans ---");
  const savingsGoal = await safeStep(() =>
    request<SavingsGoal>(
      "Create Savings Goal",
      "/savings-goals",
      { ...json({ name: "Smoke Emergency Fund", targetAmount: 10000 }), headers },
    ),
  );

  if (savingsGoal && account) {
    await safeStep(() =>
      request(
        "Add Savings Contribution",
        `/savings-goals/${savingsGoal.id}/contributions`,
        { ...json({ accountId: account.id, amount: 500, contributionDate: todayDateStr }), headers },
      ),
    );
  }

  const investment = await safeStep(() =>
    request<Investment>(
      "Create Investment",
      "/investments",
      { ...json({ name: "Smoke Mutual Fund", investmentType: "MUTUAL_FUND" }), headers },
    ),
  );

  if (investment && account) {
    await safeStep(() =>
      request(
        "Add Investment Contribution",
        `/investments/${investment.id}/contributions`,
        { ...json({ accountId: account.id, amount: 750, investmentDate: todayDateStr }), headers },
      ),
    );
  }

  const loan = await safeStep(() =>
    request<Loan>(
      "Create Loan",
      "/loans",
      {
        ...json({
          name: "Smoke Loan",
          principalAmount: 5000,
          interestRate: 8,
          emiAmount: 500,
          tenureMonths: 12,
          startDate: todayDateStr,
        }),
        headers,
      },
    ),
  );

  if (loan && account) {
    await safeStep(() =>
      request(
        "Add Loan Payment",
        `/loans/${loan.id}/payments`,
        { ...json({ accountId: account.id, amount: 500, paymentDate: todayDateStr }), headers },
      ),
    );
  }

  const financialGoal = await safeStep(() =>
    request<FinancialGoal>(
      "Create Financial Goal",
      "/financial-goals",
      { ...json({ name: "Smoke Car Goal", targetAmount: 100000 }), headers },
    ),
  );

  if (financialGoal) {
    await safeStep(() =>
      request(
        "Add Financial Goal Contribution",
        `/financial-goals/${financialGoal.id}/contributions`,
        { ...json({ amount: 1000, contributionDate: todayDateStr }), headers },
      ),
    );
  }

  console.log("\n--- Testing Read / Dashboard / Analytics / Export APIs ---");
  await safeStep(() => request("Get Profile", "/auth/me", { headers }));
  await safeStep(() => request("List Accounts", "/accounts", { headers }));
  await safeStep(() => request("List Income", "/income", { headers }));
  await safeStep(() => request("List Transactions", "/transactions", { headers }));
  await safeStep(() => request("Get Dashboard", "/dashboard", { headers }));
  await safeStep(() => request("Get Expense Breakdown", "/dashboard/expense-breakdown", { headers }));
  await safeStep(() => request("Get Income Breakdown", "/dashboard/income-breakdown", { headers }));
  await safeStep(() => request("Get Cash Flow", "/dashboard/cash-flow", { headers }));
  await safeStep(() => request("Get Budget Utilization", `/dashboard/budget-utilization?year=${currentYear}&month=${currentMonth}`, { headers }));
  await safeStep(() => request("Get Dashboard Savings", "/dashboard/savings", { headers }));
  await safeStep(() => request("Get Dashboard Investments", "/dashboard/investments", { headers }));
  await safeStep(() => request("Get Dashboard Net Worth", "/dashboard/net-worth", { headers }));
  await safeStep(() => request("Get Monthly Report", `/reports/monthly?year=${currentYear}&month=${currentMonth}`, { headers }));
  await safeStep(() => request("Get Yearly Report", `/reports/yearly?year=${currentYear}`, { headers }));
  await safeStep(() => request("Get Net Worth Report", "/reports/net-worth", { headers }));
  await safeStep(() => request("Get Category Report", "/reports/category", { headers }));
  await safeStep(() => request("Get Cash Flow Report", "/reports/cash-flow", { headers }));
  await safeStep(() => request("Get Spending Trends", "/analytics/spending-trends", { headers }));
  await safeStep(() => request("Get Category Trends", "/analytics/category-trends", { headers }));
  await safeStep(() => request("Get Budget Performance", "/analytics/budget-performance", { headers }));
  await safeStep(() => request("Get Savings Rate", "/analytics/savings-rate", { headers }));
  await safeStep(() => request("Get Fixed Expense Ratio", "/analytics/fixed-expense-ratio", { headers }));
  await safeStep(() => request("Get Income Growth", "/analytics/income-growth", { headers }));
  await safeStep(() => request("Get Spending Anomalies", "/analytics/spending-anomalies", { headers }));
  await safeStep(() => request("Get Net Worth", "/net-worth", { headers }));
  await safeStep(() => request("Get Net Worth History", "/net-worth/history", { headers }));
  await safeStep(() => request("List Notifications", "/notifications", { headers }));
  await safeStep(() => request("Get Unread Notifications Count", "/notifications/unread", { headers }));
  await safeStep(() => request("Mark All Notifications Read", "/notifications/read-all", { method: "PATCH", headers }));

  await safeStep(() =>
    requestText("Export Transactions CSV", "/exports/transactions?format=CSV", { headers }, (csv) => ({
      valid: csv.includes("id,transactionType"),
      reason: "CSV export does not contain expected header 'id,transactionType'",
    })),
  );
  await safeStep(() => requestDownload("Export Transactions XLSX", "/exports/transactions?format=XLSX", { headers }));
  await safeStep(() => requestDownload("Export Monthly Report", `/exports/monthly-report?year=${currentYear}&month=${currentMonth}`, { headers }));
  await safeStep(() => requestDownload("Export Yearly Report", `/exports/yearly-report?year=${currentYear}`, { headers }));

  if (budget) {
    console.log("\n--- Testing Budget Detail APIs ---");
    await safeStep(() => request("Get Budget By ID", `/budgets/${budget.id}`, { headers }));
    await safeStep(() => request("Get Budget Summary", `/budgets/${budget.id}/summary`, { headers }));
    await safeStep(() => request("Get Budget Items", `/budgets/${budget.id}/items`, { headers }));
  }

  if (registered) console.log(`\nCreated user ID: ${registered.id}`);
  if (income) console.log(`Created income ID: ${income.id}`);
  if (transaction) console.log(`Created transaction ID: ${transaction.id}`);
}

async function main(): Promise<void> {
  console.log("============================================================");
  console.log("              API SMOKE TEST - RUNNING");
  console.log("============================================================");
  console.log(`Target API Base URL: ${baseUrl}`);
  console.log(`Smoke test user email: ${email}`);

  let testError: Error | null = null;

  try {
    await runTests();
  } catch (error) {
    testError = error instanceof Error ? error : new Error(String(error));
  } finally {
    printSummary();
    console.log("============================================================");
    console.log("                  DATABASE CLEANUP");
    console.log("============================================================");
    try {
      await clearDatabase();
    } catch (clearError) {
      console.error("Database clear failed:", clearError);
      if (!testError) {
        testError = clearError instanceof Error ? clearError : new Error(String(clearError));
      }
    }
  }

  const failedCount = results.filter((r) => !r.success).length;
  if (failedCount > 0) {
    throw new Error(`Smoke test failed: ${failedCount} API endpoint(s) returned errors.`);
  }

  if (testError) {
    throw testError;
  }
}

main().catch((error: unknown) => {
  console.error("\n[PROCESS FAILED]:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
