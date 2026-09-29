import type { OpenAPIV3 } from "openapi-types";

const error = { $ref: "#/components/schemas/ErrorResponse" };
const fixedExpense = { $ref: "#/components/schemas/FixedExpenseResponse" };
const id: OpenAPIV3.ParameterObject = { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } };

export const fixedExpensesPaths: OpenAPIV3.PathsObject = {
  "/fixed-expenses": {
    get: {
      tags: ["Fixed Expenses"],
      summary: "List active fixed expenses",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Fixed expenses retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/FixedExpenseListResponse" } } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: error } } },
      },
    },
    post: {
      tags: ["Fixed Expenses"],
      summary: "Create a fixed expense",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateFixedExpenseRequest" } } } },
      responses: {
        "201": { description: "Fixed expense created", content: { "application/json": { schema: fixedExpense } } },
        "400": { description: "Invalid request or related resource", content: { "application/json": { schema: error } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: error } } },
      },
    },
  },
  "/fixed-expenses/{id}": {
    parameters: [id],
    get: {
      tags: ["Fixed Expenses"], summary: "Get a fixed expense", security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Fixed expense retrieved", content: { "application/json": { schema: fixedExpense } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: error } } },
        "404": { description: "Fixed expense not found", content: { "application/json": { schema: error } } },
      },
    },
    patch: {
      tags: ["Fixed Expenses"], summary: "Update a fixed expense", security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateFixedExpenseRequest" } } } },
      responses: {
        "200": { description: "Fixed expense updated", content: { "application/json": { schema: fixedExpense } } },
        "400": { description: "Invalid request", content: { "application/json": { schema: error } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: error } } },
        "404": { description: "Fixed expense not found", content: { "application/json": { schema: error } } },
      },
    },
    delete: {
      tags: ["Fixed Expenses"], summary: "Deactivate a fixed expense", security: [{ bearerAuth: [] }],
      responses: {
        "204": { description: "Fixed expense deactivated" },
        "401": { description: "Authentication required", content: { "application/json": { schema: error } } },
        "404": { description: "Fixed expense not found", content: { "application/json": { schema: error } } },
      },
    },
  },
  "/fixed-expenses/{id}/generate": {
    parameters: [id],
    post: {
      tags: ["Fixed Expenses"],
      summary: "Generate the next fixed-expense transaction",
      description: "Creates an EXPENSE transaction on nextDueDate and advances the due date according to frequency.",
      security: [{ bearerAuth: [] }],
      responses: {
        "201": { description: "Expense transaction generated", content: { "application/json": { schema: { $ref: "#/components/schemas/TransactionResponse" } } } },
        "400": { description: "Inactive or completed fixed expense", content: { "application/json": { schema: error } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: error } } },
        "404": { description: "Fixed expense not found", content: { "application/json": { schema: error } } },
      },
    },
  },
};