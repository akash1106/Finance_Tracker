import { Router } from "express";
import { accountsRouter } from "../modules/accounts/accounts.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { incomeSourcesRouter } from "../modules/income-sources/income-sources.routes.js";
import { incomeRouter } from "../modules/income/income.routes.js";
import { categoriesRouter, subcategoriesRouter } from "../modules/categories/categories.routes.js";
import { transactionsRouter } from "../modules/transactions/transactions.routes.js";
import { budgetTemplatesRouter } from "../modules/budgets/budget-templates.routes.js";
import { budgetsRouter } from "../modules/budgets/budgets.routes.js";
import { fixedExpensesRouter } from "../modules/fixed-expenses/fixed-expenses.routes.js";
import { recurringTransactionsRouter } from "../modules/recurring-transactions/recurring-transactions.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/accounts", accountsRouter);
apiRouter.use("/income-sources", incomeSourcesRouter);
apiRouter.use("/income", incomeRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/subcategories", subcategoriesRouter);
apiRouter.use("/transactions", transactionsRouter);
apiRouter.use("/budget-templates", budgetTemplatesRouter);
apiRouter.use("/budgets", budgetsRouter);
apiRouter.use("/fixed-expenses", fixedExpensesRouter);
apiRouter.use("/recurring-transactions", recurringTransactionsRouter);
apiRouter.use("/health", healthRouter);
