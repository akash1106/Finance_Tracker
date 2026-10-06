import type { OpenAPIV3 } from "openapi-types";

const errorResponse = { $ref: "#/components/schemas/ErrorResponse" };
const transactionResponse = { $ref: "#/components/schemas/TransactionResponse" };
const idParameter: OpenAPIV3.ParameterObject = { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } };
const transactionTypes = ["EXPENSE", "TRANSFER", "SAVING", "INVESTMENT", "LOAN_PAYMENT"];
const paymentMethods = ["CASH", "UPI", "DEBIT_CARD", "BANK_TRANSFER", "OTHER"];

export const transactionsPaths: OpenAPIV3.PathsObject = {
  "/transactions": {
    get: {
      tags: ["Transactions"], summary: "List transactions", security: [{ bearerAuth: [] }],
      parameters: [
        { name: "from", in: "query", schema: { type: "string", format: "date" } }, { name: "to", in: "query", schema: { type: "string", format: "date" } },
        { name: "type", in: "query", schema: { type: "string", enum: transactionTypes } }, { name: "category", in: "query", schema: { type: "string", format: "uuid" } },
        { name: "subcategory", in: "query", schema: { type: "string", format: "uuid" } }, { name: "account", in: "query", schema: { type: "string", format: "uuid" } },
        { name: "paymentMethod", in: "query", schema: { type: "string", enum: paymentMethods } }, { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } }, { name: "sort", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
      ],
      responses: { "200": { description: "Transactions retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/TransactionListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } } },
    },
    post: { tags: ["Transactions"], summary: "Create a transaction", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTransactionRequest" } } } }, responses: { "201": { description: "Transaction created", content: { "application/json": { schema: transactionResponse } } }, "400": { description: "Invalid request or related resource", content: { "application/json": { schema: errorResponse } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } } } },
  },
  "/transactions/{id}": {
    parameters: [idParameter],
    get: { tags: ["Transactions"], summary: "Get a transaction", security: [{ bearerAuth: [] }], responses: { "200": { description: "Transaction retrieved", content: { "application/json": { schema: transactionResponse } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Transaction not found", content: { "application/json": { schema: errorResponse } } } } },
    patch: { tags: ["Transactions"], summary: "Update a transaction", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateTransactionRequest" } } } }, responses: { "200": { description: "Transaction updated", content: { "application/json": { schema: transactionResponse } } }, "400": { description: "Invalid request", content: { "application/json": { schema: errorResponse } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Transaction not found", content: { "application/json": { schema: errorResponse } } } } },
    delete: { tags: ["Transactions"], summary: "Delete a transaction", security: [{ bearerAuth: [] }], responses: { "204": { description: "Transaction deleted" }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Transaction not found", content: { "application/json": { schema: errorResponse } } } } },
  },
};