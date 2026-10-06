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
};