import type { OpenAPIV3 } from "openapi-types";
import { accountsPaths } from "../modules/accounts/accounts.swagger.js";
import { authPaths } from "../modules/auth/auth.swagger.js";
import { categoriesPaths, subcategoriesPaths } from "../modules/categories/categories.swagger.js";
import { healthPaths } from "../modules/health/health.swagger.js";
import { incomePaths } from "../modules/income/income.swagger.js";
import { incomeSourcesPaths } from "../modules/income-sources/income-sources.swagger.js";
import { transactionsPaths } from "../modules/transactions/transactions.swagger.js";
import { budgetTemplatesPaths } from "../modules/budgets/budget-templates.swagger.js";
import { budgetsPaths } from "../modules/budgets/budgets.swagger.js";
import { fixedExpensesPaths } from "../modules/fixed-expenses/fixed-expenses.swagger.js";
import { recurringTransactionsPaths } from "../modules/recurring-transactions/recurring-transactions.swagger.js";
import { savingsPaths } from "../modules/savings/savings.swagger.js";
import { investmentsPaths } from "../modules/investments/investments.swagger.js";
import { loansPaths } from "../modules/loans/loans.swagger.js";
import { financialGoalsPaths } from "../modules/financial-goals/financial-goals.swagger.js";
import { dashboardPaths } from "../modules/dashboard/dashboard.swagger.js";
import { reportsPaths } from "../modules/reports/reports.swagger.js";
import { analyticsPaths } from "../modules/analytics/analytics.swagger.js";
import { exportsPaths } from "../modules/exports/exports.swagger.js";

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Personal Finance & Salary Tracker API",
    version: "0.1.0",
    description: "REST API for the personal finance tracker.",
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1",
    },
  ],
  paths: {
    ...accountsPaths,
    ...authPaths,
    ...budgetTemplatesPaths,
    ...budgetsPaths,
    ...fixedExpensesPaths,
    ...recurringTransactionsPaths,
    ...savingsPaths,
    ...investmentsPaths,
    ...loansPaths,
    ...financialGoalsPaths,
    ...dashboardPaths,
    ...reportsPaths,
    ...analyticsPaths,
    ...exportsPaths,
    ...categoriesPaths,
    ...healthPaths,
    ...incomePaths,
    ...incomeSourcesPaths,
    ...subcategoriesPaths,
    ...transactionsPaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", maxLength: 100, example: "Akash" },
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, format: "password", example: "password123" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", format: "password", example: "password123" },
        },
      },
      Account: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "HDFC Salary Account" },
          accountType: { type: "string", enum: ["BANK", "CASH", "OTHER"] },
          openingBalance: { type: "string", example: "50000.00" },
          balance: { type: "string", example: "50000.00" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateAccountRequest: {
        type: "object",
        required: ["name", "accountType"],
        properties: {
          name: { type: "string", maxLength: 100, example: "HDFC Salary Account" },
          accountType: { type: "string", enum: ["BANK", "CASH", "OTHER"] },
          openingBalance: { type: "number", minimum: 0, example: 50000 },
        },
      },
      UpdateAccountRequest: {
        allOf: [{ $ref: "#/components/schemas/CreateAccountRequest" }],
      },
      AccountResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { $ref: "#/components/schemas/Account" } } },
        ],
      },
      IncomeSource: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Salary" },
          isSalary: { type: "boolean", example: true },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateIncomeSourceRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", maxLength: 100, example: "Salary" },
          isSalary: { type: "boolean", default: false },
        },
      },
      UpdateIncomeSourceRequest: {
        allOf: [{ $ref: "#/components/schemas/CreateIncomeSourceRequest" }],
      },
      IncomeSourceResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { $ref: "#/components/schemas/IncomeSource" } } },
        ],
      },
      IncomeSourceListResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/IncomeSource" } } } },
        ],
      },
      CreateIncomeRequest: {
        type: "object",
        required: ["incomeSourceId", "accountId", "amount", "receivedDate"],
        properties: {
          incomeSourceId: { type: "string", format: "uuid" },
          accountId: { type: "string", format: "uuid" },
          amount: { type: "number", minimum: 0, exclusiveMinimum: true, example: 50000 },
          receivedDate: { type: "string", format: "date" },
          description: { type: "string", maxLength: 1000 },
          isRecurring: { type: "boolean", default: false },
          notes: { type: "string", maxLength: 2000 },
        },
      },
      UpdateIncomeRequest: {
        allOf: [{ $ref: "#/components/schemas/CreateIncomeRequest" }],
      },
      Income: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          incomeSourceId: { type: "string", format: "uuid" },
          accountId: { type: "string", format: "uuid" },
          amount: { type: "string", example: "50000.00" },
          receivedDate: { type: "string", format: "date-time" },
          description: { type: "string", nullable: true },
          isRecurring: { type: "boolean" },
          notes: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      IncomeResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { $ref: "#/components/schemas/Income" } } },
        ],
      },
      IncomeListResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Income" } }, pagination: { $ref: "#/components/schemas/Pagination" } } },
        ],
      },
      CreateCategoryRequest: {
        type: "object",
        required: ["name", "categoryType"],
        properties: {
          name: { type: "string", maxLength: 100, example: "Food" },
          categoryType: { type: "string", enum: ["EXPENSE", "INCOME", "SAVING", "INVESTMENT"] },
          description: { type: "string", maxLength: 1000 },
        },
      },
      UpdateCategoryRequest: { allOf: [{ $ref: "#/components/schemas/CreateCategoryRequest" }] },
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" }, userId: { type: "string", format: "uuid" },
          name: { type: "string" }, categoryType: { type: "string" }, description: { type: "string", nullable: true },
          isActive: { type: "boolean" }, subcategories: { type: "array", items: { $ref: "#/components/schemas/Subcategory" } },
          createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" },
        },
      },
      CategoryResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Category" } } }] },
      CategoryListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Category" } } } }] },
      CreateSubcategoryRequest: { type: "object", required: ["name"], properties: { name: { type: "string", maxLength: 100, example: "Groceries" }, description: { type: "string", maxLength: 1000 } } },
      UpdateSubcategoryRequest: { allOf: [{ $ref: "#/components/schemas/CreateSubcategoryRequest" }] },
      Subcategory: { type: "object", properties: { id: { type: "string", format: "uuid" }, categoryId: { type: "string", format: "uuid" }, name: { type: "string" }, description: { type: "string", nullable: true }, isActive: { type: "boolean" }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } } },
      SubcategoryResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Subcategory" } } }] },
      SubcategoryListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Subcategory" } } } }] },
      CreateTransactionRequest: {
        type: "object",
        required: ["transactionType", "amount", "accountId", "transactionDate"],
        properties: {
          transactionType: { type: "string", enum: ["EXPENSE", "TRANSFER", "SAVING", "INVESTMENT", "LOAN_PAYMENT"] },
          amount: { type: "number", minimum: 0, exclusiveMinimum: true }, categoryId: { type: "string", format: "uuid" }, subcategoryId: { type: "string", format: "uuid" },
          accountId: { type: "string", format: "uuid" }, transactionDate: { type: "string", format: "date" },
          paymentMethod: { type: "string", enum: ["CASH", "UPI", "DEBIT_CARD", "BANK_TRANSFER", "OTHER"] }, description: { type: "string" }, notes: { type: "string" },
        },
      },
      UpdateTransactionRequest: { allOf: [{ $ref: "#/components/schemas/CreateTransactionRequest" }] },
      Transaction: { type: "object", properties: { id: { type: "string", format: "uuid" }, userId: { type: "string", format: "uuid" }, transactionType: { type: "string" }, amount: { type: "string", example: "500.00" }, categoryId: { type: "string", format: "uuid", nullable: true }, subcategoryId: { type: "string", format: "uuid", nullable: true }, accountId: { type: "string", format: "uuid" }, transactionDate: { type: "string", format: "date-time" }, paymentMethod: { type: "string", nullable: true }, description: { type: "string", nullable: true }, notes: { type: "string", nullable: true }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } } },
      TransactionResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Transaction" } } }] },
      TransactionListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Transaction" } }, pagination: { $ref: "#/components/schemas/Pagination" } } }] },
      Pagination: { type: "object", properties: { page: { type: "integer" }, limit: { type: "integer" }, total: { type: "integer" }, totalPages: { type: "integer" } } },
      CreateBudgetTemplateRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", maxLength: 100, example: "Normal Salary Budget" },
          description: { type: "string", maxLength: 1000 },
          isActive: { type: "boolean", default: false },
        },
      },
      UpdateBudgetTemplateRequest: { allOf: [{ $ref: "#/components/schemas/CreateBudgetTemplateRequest" }] },
      BudgetTemplateItem: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          budgetTemplateId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid" },
          percentage: { type: "string", example: "30.00" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateBudgetTemplateItemRequest: {
        type: "object",
        required: ["categoryId", "percentage"],
        properties: {
          categoryId: { type: "string", format: "uuid" },
          percentage: { type: "number", minimum: 0, exclusiveMinimum: true, maximum: 100, example: 30 },
        },
      },
      UpdateBudgetTemplateItemRequest: {
        type: "object",
        required: ["percentage"],
        properties: { percentage: { type: "number", minimum: 0, exclusiveMinimum: true, maximum: 100, example: 30 } },
      },
      BudgetTemplate: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          items: { type: "array", items: { $ref: "#/components/schemas/BudgetTemplateItem" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      BudgetTemplateResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/BudgetTemplate" } } }] },
      BudgetTemplateItemResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/BudgetTemplateItem" } } }] },
      BudgetTemplateListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/BudgetTemplate" } } } }] },
      BudgetValidationResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { type: "object", properties: { valid: { type: "boolean" }, totalPercentage: { type: "string", example: "100.00" } } } } },
        ],
      },
      GenerateBudgetRequest: {
        type: "object",
        required: ["incomeTransactionId", "budgetTemplateId"],
        properties: {
          incomeTransactionId: { type: "string", format: "uuid" },
          budgetTemplateId: { type: "string", format: "uuid" },
        },
      },
      MonthlyBudgetItem: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          monthlyBudgetId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid" },
          allocatedAmount: { type: "string", example: "5000.00" },
          spentAmount: { type: "string", example: "2300.00" },
          percentage: { type: "string", example: "10.00" },
        },
      },
      MonthlyBudget: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          budgetTemplateId: { type: "string", format: "uuid" },
          incomeTransactionId: { type: "string", format: "uuid" },
          month: { type: "integer", example: 9 },
          year: { type: "integer", example: 2026 },
          allocatedAmount: { type: "string", example: "50000.00" },
          items: { type: "array", items: { $ref: "#/components/schemas/MonthlyBudgetItem" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      MonthlyBudgetResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/MonthlyBudget" } } }] },
      MonthlyBudgetListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/MonthlyBudget" } } } }] },
      BudgetItemResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/MonthlyBudgetItem" } } }] },
      BudgetItemListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/MonthlyBudgetItem" } } } }] },
      BudgetSummaryResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { type: "object", properties: { allocated: { type: "string" }, spent: { type: "string" }, remaining: { type: "string" }, percentageUsed: { type: "string" }, status: { type: "string", enum: ["NORMAL", "WARNING", "EXCEEDED"] } } } } },
        ],
      },
      CreateFixedExpenseRequest: {
        type: "object",
        required: ["name", "amount", "categoryId", "subcategoryId", "accountId", "frequency", "nextDueDate", "startDate"],
        properties: {
          name: { type: "string", maxLength: 150, example: "Rent" },
          amount: { type: "number", minimum: 0, exclusiveMinimum: true, example: 25000 },
          categoryId: { type: "string", format: "uuid" },
          subcategoryId: { type: "string", format: "uuid" },
          accountId: { type: "string", format: "uuid" },
          frequency: { type: "string", enum: ["WEEKLY", "MONTHLY", "YEARLY"] },
          nextDueDate: { type: "string", format: "date" },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          autoGenerate: { type: "boolean", default: true },
          description: { type: "string", maxLength: 1000 },
        },
      },
      UpdateFixedExpenseRequest: { allOf: [{ $ref: "#/components/schemas/CreateFixedExpenseRequest" }] },
      FixedExpense: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          name: { type: "string" },
          amount: { type: "string", example: "25000.00" },
          categoryId: { type: "string", format: "uuid" },
          subcategoryId: { type: "string", format: "uuid" },
          accountId: { type: "string", format: "uuid" },
          frequency: { type: "string", enum: ["WEEKLY", "MONTHLY", "YEARLY"] },
          nextDueDate: { type: "string", format: "date-time" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time", nullable: true },
          autoGenerate: { type: "boolean" },
          isActive: { type: "boolean" },
          description: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      FixedExpenseResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/FixedExpense" } } }] },
      FixedExpenseListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/FixedExpense" } } } }] },
      CreateRecurringTransactionRequest: {
        type: "object",
        required: ["name", "transactionType", "amount", "accountId", "frequency", "startDate", "nextRunDate"],
        properties: {
          name: { type: "string", maxLength: 150, example: "Monthly Internet" },
          transactionType: { type: "string", enum: ["EXPENSE", "TRANSFER", "SAVING", "INVESTMENT", "LOAN_PAYMENT"] },
          amount: { type: "number", minimum: 0, exclusiveMinimum: true, example: 1500 },
          categoryId: { type: "string", format: "uuid" },
          subcategoryId: { type: "string", format: "uuid" },
          accountId: { type: "string", format: "uuid" },
          paymentMethod: { type: "string", enum: ["CASH", "UPI", "DEBIT_CARD", "BANK_TRANSFER", "OTHER"] },
          frequency: { type: "string", enum: ["WEEKLY", "MONTHLY", "YEARLY"] },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          nextRunDate: { type: "string", format: "date" },
          notes: { type: "string", maxLength: 2000 },
        },
      },
      UpdateRecurringTransactionRequest: { allOf: [{ $ref: "#/components/schemas/CreateRecurringTransactionRequest" }] },
      RecurringTransaction: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          name: { type: "string" },
          transactionType: { type: "string" },
          amount: { type: "string", example: "1500.00" },
          categoryId: { type: "string", format: "uuid", nullable: true },
          subcategoryId: { type: "string", format: "uuid", nullable: true },
          accountId: { type: "string", format: "uuid" },
          paymentMethod: { type: "string", nullable: true },
          frequency: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time", nullable: true },
          nextRunDate: { type: "string", format: "date-time" },
          isActive: { type: "boolean" },
          notes: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      RecurringTransactionResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/RecurringTransaction" } } }] },
      RecurringTransactionListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/RecurringTransaction" } } } }] },
      CreateSavingsGoalRequest: {
        type: "object",
        required: ["name", "targetAmount"],
        properties: {
          name: { type: "string", maxLength: 150, example: "Emergency Fund" },
          targetAmount: { type: "number", minimum: 0, exclusiveMinimum: true, example: 100000 },
          targetDate: { type: "string", format: "date" },
          description: { type: "string", maxLength: 1000 },
        },
      },
      UpdateSavingsGoalRequest: { allOf: [{ $ref: "#/components/schemas/CreateSavingsGoalRequest" }], properties: { status: { type: "string", enum: ["ACTIVE", "COMPLETED", "PAUSED", "CANCELLED"] } } },
      SavingsGoal: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" }, userId: { type: "string", format: "uuid" }, name: { type: "string" },
          targetAmount: { type: "string", example: "100000.00" }, currentAmount: { type: "string", example: "25000.00" },
          targetDate: { type: "string", format: "date-time", nullable: true }, description: { type: "string", nullable: true },
          status: { type: "string", enum: ["ACTIVE", "COMPLETED", "PAUSED", "CANCELLED"] },
          createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateSavingsContributionRequest: { type: "object", required: ["accountId", "amount", "contributionDate"], properties: { accountId: { type: "string", format: "uuid" }, amount: { type: "number", minimum: 0, exclusiveMinimum: true }, contributionDate: { type: "string", format: "date" }, notes: { type: "string" } } },
      SavingsContribution: { type: "object", properties: { id: { type: "string", format: "uuid" }, savingsGoalId: { type: "string", format: "uuid" }, accountId: { type: "string", format: "uuid" }, amount: { type: "string", example: "5000.00" }, contributionDate: { type: "string", format: "date-time" }, transactionId: { type: "string", format: "uuid" }, notes: { type: "string", nullable: true }, createdAt: { type: "string", format: "date-time" } } },
      SavingsGoalResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/SavingsGoal" } } }] },
      SavingsGoalListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/SavingsGoal" } } } }] },
      SavingsContributionResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/SavingsContribution" } } }] },
      SavingsContributionListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/SavingsContribution" } } } }] },
      CreateInvestmentRequest: { type: "object", required: ["name", "investmentType"], properties: { name: { type: "string", maxLength: 150, example: "Index Mutual Fund" }, investmentType: { type: "string", enum: ["MUTUAL_FUND", "GOLD", "FD", "OTHER"] }, description: { type: "string", maxLength: 1000 } } },
      UpdateInvestmentRequest: { allOf: [{ $ref: "#/components/schemas/CreateInvestmentRequest" }] },
      Investment: { type: "object", properties: { id: { type: "string", format: "uuid" }, userId: { type: "string", format: "uuid" }, name: { type: "string" }, investmentType: { type: "string" }, description: { type: "string", nullable: true }, isActive: { type: "boolean" }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } } },
      CreateInvestmentContributionRequest: { type: "object", required: ["accountId", "amount", "investmentDate"], properties: { accountId: { type: "string", format: "uuid" }, amount: { type: "number", minimum: 0, exclusiveMinimum: true }, investmentDate: { type: "string", format: "date" }, notes: { type: "string" } } },
      InvestmentContribution: { type: "object", properties: { id: { type: "string", format: "uuid" }, investmentId: { type: "string", format: "uuid" }, accountId: { type: "string", format: "uuid" }, amount: { type: "string", example: "10000.00" }, investmentDate: { type: "string", format: "date-time" }, transactionId: { type: "string", format: "uuid" }, notes: { type: "string", nullable: true }, createdAt: { type: "string", format: "date-time" } } },
      InvestmentResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Investment" } } }] },
      InvestmentListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Investment" } } } }] },
      InvestmentContributionResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/InvestmentContribution" } } }] },
      InvestmentContributionListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/InvestmentContribution" } } } }] },
      CreateLoanRequest: {
        type: "object",
        required: ["name", "principalAmount", "interestRate", "emiAmount", "tenureMonths", "startDate"],
        properties: {
          name: { type: "string", maxLength: 150, example: "Home Loan" },
          principalAmount: { type: "number", minimum: 0, exclusiveMinimum: true, example: 500000 },
          interestRate: { type: "number", minimum: 0, example: 8.5 },
          emiAmount: { type: "number", minimum: 0, exclusiveMinimum: true, example: 12000 },
          tenureMonths: { type: "integer", minimum: 1, example: 60 },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          description: { type: "string", maxLength: 1000 },
        },
      },
      UpdateLoanRequest: { allOf: [{ $ref: "#/components/schemas/CreateLoanRequest" }], properties: { status: { type: "string", enum: ["ACTIVE", "COMPLETED", "CANCELLED"] } } },
      Loan: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" }, userId: { type: "string", format: "uuid" }, name: { type: "string" },
          principalAmount: { type: "string", example: "500000.00" }, interestRate: { type: "string", example: "8.50" }, emiAmount: { type: "string", example: "12000.00" },
          tenureMonths: { type: "integer" }, startDate: { type: "string", format: "date-time" }, endDate: { type: "string", format: "date-time", nullable: true },
          status: { type: "string", enum: ["ACTIVE", "COMPLETED", "CANCELLED"] }, description: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateLoanPaymentRequest: { type: "object", required: ["accountId", "amount", "paymentDate"], properties: { accountId: { type: "string", format: "uuid" }, amount: { type: "number", minimum: 0, exclusiveMinimum: true }, paymentDate: { type: "string", format: "date" }, notes: { type: "string" } } },
      LoanPayment: { type: "object", properties: { id: { type: "string", format: "uuid" }, loanId: { type: "string", format: "uuid" }, accountId: { type: "string", format: "uuid" }, transactionId: { type: "string", format: "uuid" }, amount: { type: "string", example: "12000.00" }, paymentDate: { type: "string", format: "date-time" }, notes: { type: "string", nullable: true }, createdAt: { type: "string", format: "date-time" } } },
      LoanResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { allOf: [{ $ref: "#/components/schemas/Loan" }, { type: "object", properties: { paidAmount: { type: "string" }, remainingPrincipal: { type: "string" }, payments: { type: "array", items: { $ref: "#/components/schemas/LoanPayment" } } } }] } } }] },
      LoanListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Loan" } } } }] },
      LoanPaymentResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/LoanPayment" } } }] },
      LoanPaymentListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/LoanPayment" } } } }] },
      CreateFinancialGoalRequest: {
        type: "object",
        required: ["name", "targetAmount"],
        properties: {
          name: { type: "string", maxLength: 150, example: "Buy a car" },
          targetAmount: { type: "number", minimum: 0, exclusiveMinimum: true, example: 800000 },
          targetDate: { type: "string", format: "date" },
          description: { type: "string", maxLength: 1000 },
        },
      },
      UpdateFinancialGoalRequest: { allOf: [{ $ref: "#/components/schemas/CreateFinancialGoalRequest" }], properties: { status: { type: "string", enum: ["ACTIVE", "COMPLETED", "CANCELLED"] } } },
      FinancialGoal: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" }, userId: { type: "string", format: "uuid" }, name: { type: "string" },
          targetAmount: { type: "string", example: "800000.00" }, currentAmount: { type: "string", example: "100000.00" },
          targetDate: { type: "string", format: "date-time", nullable: true }, status: { type: "string", enum: ["ACTIVE", "COMPLETED", "CANCELLED"] },
          description: { type: "string", nullable: true }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateFinancialGoalContributionRequest: { type: "object", required: ["amount", "contributionDate"], properties: { amount: { type: "number", minimum: 0, exclusiveMinimum: true }, contributionDate: { type: "string", format: "date" }, notes: { type: "string" } } },
      FinancialGoalContribution: { type: "object", properties: { id: { type: "string", format: "uuid" }, financialGoalId: { type: "string", format: "uuid" }, amount: { type: "string", example: "10000.00" }, contributionDate: { type: "string", format: "date-time" }, transactionId: { type: "string", format: "uuid", nullable: true }, notes: { type: "string", nullable: true }, createdAt: { type: "string", format: "date-time" } } },
      FinancialGoalResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/FinancialGoal" } } }] },
      FinancialGoalListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/FinancialGoal" } } } }] },
      FinancialGoalContributionResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/FinancialGoalContribution" } } }] },
      FinancialGoalContributionListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/FinancialGoalContribution" } } } }] },
      DashboardResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "object", properties: { income: { type: "string" }, expenses: { type: "string" }, savings: { type: "string" }, investments: { type: "string" }, remaining: { type: "string" }, netWorth: { type: "string" } } } } }] },
      CashFlowResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { type: "object", properties: { month: { type: "string", example: "2026-09" }, income: { type: "string" }, expenses: { type: "string" }, savings: { type: "string" }, investments: { type: "string" }, netCashFlow: { type: "string" } } } } } }] },
      ExpenseBreakdownResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { type: "object", properties: { category: { type: "string" }, amount: { type: "string" } } } } } }] },
      BudgetUtilizationResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { type: "object", properties: { budgetId: { type: "string", format: "uuid" }, categoryId: { type: "string", format: "uuid" }, allocated: { type: "string" }, spent: { type: "string" }, remaining: { type: "string" }, percentageUsed: { type: "string" } } } } } }] },
      HistoryResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { type: "object", properties: { date: { type: "string", format: "date-time" }, amount: { type: "string" }, goalId: { type: "string", format: "uuid" }, investmentId: { type: "string", format: "uuid" } } } } } }] },
      NetWorthResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "object", properties: { assets: { type: "string" }, liabilities: { type: "string" }, netWorth: { type: "string" } } } } }] },
      ReportResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "object" } } }] },
      CategoryReportResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { type: "object", properties: { categoryId: { type: "string", format: "uuid", nullable: true }, category: { type: "string" }, amount: { type: "string" } } } } } }] },
      CashFlowReportResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "object", properties: { income: { type: "string" }, expenses: { type: "string" }, savings: { type: "string" }, investments: { type: "string" }, netCashFlow: { type: "string" } } } } }] },
      TrendResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { type: "object", properties: { month: { type: "string" }, amount: { type: "string" } } } } } }] },
      BudgetPerformanceResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { type: "object", properties: { budgetId: { type: "string", format: "uuid" }, categoryId: { type: "string", format: "uuid" }, allocated: { type: "string" }, spent: { type: "string" }, variance: { type: "string" } } } } } }] },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Akash" },
          email: { type: "string", format: "email", example: "user@example.com" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          {
            type: "object",
            properties: {
              data: { $ref: "#/components/schemas/User" },
              message: { type: "string" },
            },
          },
        ],
      },
      LoginResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                  user: { $ref: "#/components/schemas/User" },
                },
              },
              message: { type: "string" },
            },
          },
        ],
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
          message: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string" },
              details: { type: "array", items: { type: "object" } },
            },
          },
        },
      },
    },
  },
};
