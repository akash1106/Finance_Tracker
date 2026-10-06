import type { OpenAPIV3 } from "openapi-types";

const error = { $ref: "#/components/schemas/ErrorResponse" };
const queryParameters: OpenAPIV3.ParameterObject[] = [
  { name: "from", in: "query", schema: { type: "string", format: "date" } },
  { name: "to", in: "query", schema: { type: "string", format: "date" } },
  { name: "year", in: "query", schema: { type: "integer", example: 2026 } },
  { name: "month", in: "query", schema: { type: "integer", minimum: 1, maximum: 12, example: 9 } },
];
const dashboardResponse = { $ref: "#/components/schemas/DashboardResponse" };

export const dashboardPaths: OpenAPIV3.PathsObject = {
  "/dashboard": {
    get: { tags: ["Dashboard"], summary: "Get the main dashboard", security: [{ bearerAuth: [] }], parameters: queryParameters, responses: { "200": { description: "Dashboard retrieved", content: { "application/json": { schema: dashboardResponse } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/dashboard/cash-flow": {
    get: { tags: ["Dashboard"], summary: "Get monthly cash flow", security: [{ bearerAuth: [] }], parameters: queryParameters, responses: { "200": { description: "Cash flow retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/CashFlowResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/dashboard/expense-breakdown": {
    get: { tags: ["Dashboard"], summary: "Get expense breakdown by category", security: [{ bearerAuth: [] }], parameters: queryParameters, responses: { "200": { description: "Expense breakdown retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/ExpenseBreakdownResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/dashboard/income-breakdown": {
    get: { tags: ["Dashboard"], summary: "Get income breakdown by source", security: [{ bearerAuth: [] }], parameters: queryParameters, responses: { "200": { description: "Income breakdown retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/IncomeBreakdownResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/dashboard/budget-utilization": {
    get: { tags: ["Dashboard"], summary: "Get budget utilization", security: [{ bearerAuth: [] }], parameters: queryParameters, responses: { "200": { description: "Budget utilization retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/BudgetUtilizationResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/dashboard/savings": {
    get: { tags: ["Dashboard"], summary: "Get savings history", security: [{ bearerAuth: [] }], responses: { "200": { description: "Savings history retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/HistoryResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/dashboard/investments": {
    get: { tags: ["Dashboard"], summary: "Get investment history", security: [{ bearerAuth: [] }], responses: { "200": { description: "Investment history retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/HistoryResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/dashboard/net-worth": {
    get: { tags: ["Dashboard"], summary: "Get current net worth", security: [{ bearerAuth: [] }], parameters: queryParameters, responses: { "200": { description: "Net worth retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/NetWorthResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
};