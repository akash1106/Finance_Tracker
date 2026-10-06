import type { OpenAPIV3 } from "openapi-types";

const error = { $ref: "#/components/schemas/ErrorResponse" };
const filters: OpenAPIV3.ParameterObject[] = [
  { name: "from", in: "query", schema: { type: "string", format: "date" } },
  { name: "to", in: "query", schema: { type: "string", format: "date" } },
  { name: "year", in: "query", schema: { type: "integer", example: 2026 } },
  { name: "month", in: "query", schema: { type: "integer", minimum: 1, maximum: 12, example: 9 } },
];

export const analyticsPaths: OpenAPIV3.PathsObject = {
  "/analytics/spending-trends": { get: { tags: ["Analytics"], summary: "Get spending trends", security: [{ bearerAuth: [] }], parameters: filters, responses: { "200": { description: "Spending trends retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/TrendResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
  "/analytics/budget-performance": { get: { tags: ["Analytics"], summary: "Compare budget against actual spending", security: [{ bearerAuth: [] }], parameters: filters, responses: { "200": { description: "Budget performance retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/BudgetPerformanceResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
  "/analytics/category-trends": { get: { tags: ["Analytics"], summary: "Get category spending trends", security: [{ bearerAuth: [] }], parameters: filters, responses: { "200": { description: "Category trends retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryTrendsResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
  "/analytics/savings-rate": { get: { tags: ["Analytics"], summary: "Get savings rate", security: [{ bearerAuth: [] }], parameters: filters, responses: { "200": { description: "Savings rate retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/SavingsRateResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
  "/analytics/fixed-expense-ratio": { get: { tags: ["Analytics"], summary: "Get fixed expense ratio", security: [{ bearerAuth: [] }], parameters: filters, responses: { "200": { description: "Fixed expense ratio retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/SavingsRateResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
  "/analytics/income-growth": { get: { tags: ["Analytics"], summary: "Get income growth", security: [{ bearerAuth: [] }], parameters: filters, responses: { "200": { description: "Income growth retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/TrendResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
  "/analytics/spending-anomalies": { get: { tags: ["Analytics"], summary: "Get spending anomalies", security: [{ bearerAuth: [] }], parameters: filters, responses: { "200": { description: "Spending anomalies retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/TrendResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
};