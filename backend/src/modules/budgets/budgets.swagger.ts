import type { OpenAPIV3 } from "openapi-types";

const error = { $ref: "#/components/schemas/ErrorResponse" };
const budget = { $ref: "#/components/schemas/MonthlyBudgetResponse" };
const id: OpenAPIV3.ParameterObject = { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } };
const itemId: OpenAPIV3.ParameterObject = { name: "itemId", in: "path", required: true, schema: { type: "string", format: "uuid" } };

export const budgetsPaths: OpenAPIV3.PathsObject = {
  "/budgets": {
    get: { tags: ["Monthly Budgets"], summary: "List monthly budgets", security: [{ bearerAuth: [] }], parameters: [{ name: "year", in: "query", schema: { type: "integer", example: 2026 } }, { name: "month", in: "query", schema: { type: "integer", minimum: 1, maximum: 12, example: 9 } }], responses: { "200": { description: "Budgets retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/MonthlyBudgetListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/budgets/generate": {
    post: { tags: ["Monthly Budgets"], summary: "Generate a monthly budget from salary", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/GenerateBudgetRequest" } } } }, responses: { "201": { description: "Budget generated", content: { "application/json": { schema: budget } } }, "400": { description: "Invalid template allocation or duplicate month", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Income or template not found", content: { "application/json": { schema: error } } } } },
  },
  "/budgets/{id}": {
    parameters: [id],
    get: { tags: ["Monthly Budgets"], summary: "Get a monthly budget", security: [{ bearerAuth: [] }], responses: { "200": { description: "Budget retrieved", content: { "application/json": { schema: budget } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Budget not found", content: { "application/json": { schema: error } } } } },
  },
  "/budgets/{id}/summary": {
    parameters: [id],
    get: { tags: ["Budget Tracking"], summary: "Get budget summary and warning status", security: [{ bearerAuth: [] }], responses: { "200": { description: "Budget summary retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/BudgetSummaryResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Budget not found", content: { "application/json": { schema: error } } } } },
  },
  "/budgets/{id}/items": {
    parameters: [id],
    get: { tags: ["Budget Tracking"], summary: "List monthly budget items", security: [{ bearerAuth: [] }], responses: { "200": { description: "Budget items retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/BudgetItemListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Budget not found", content: { "application/json": { schema: error } } } } },
  },
  "/budgets/{id}/items/{itemId}": {
    parameters: [id, itemId],
    get: { tags: ["Budget Tracking"], summary: "Get one monthly budget item", security: [{ bearerAuth: [] }], responses: { "200": { description: "Budget item retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/BudgetItemResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Budget item not found", content: { "application/json": { schema: error } } } } },
  },
};