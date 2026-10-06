import type { OpenAPIV3 } from "openapi-types";

const error = { $ref: "#/components/schemas/ErrorResponse" };
const response = { $ref: "#/components/schemas/RecurringTransactionResponse" };
const id: OpenAPIV3.ParameterObject = { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } };

export const recurringTransactionsPaths: OpenAPIV3.PathsObject = {
  "/recurring-transactions": {
    get: { tags: ["Recurring Transactions"], summary: "List active recurring transactions", security: [{ bearerAuth: [] }], responses: { "200": { description: "Recurring transactions retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/RecurringTransactionListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
    post: { tags: ["Recurring Transactions"], summary: "Create a recurring transaction rule", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateRecurringTransactionRequest" } } } }, responses: { "201": { description: "Recurring rule created", content: { "application/json": { schema: response } } }, "400": { description: "Invalid request or related resource", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/recurring-transactions/{id}": {
    parameters: [id],
    get: { tags: ["Recurring Transactions"], summary: "Get a recurring transaction rule", security: [{ bearerAuth: [] }], responses: { "200": { description: "Recurring rule retrieved", content: { "application/json": { schema: response } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Recurring rule not found", content: { "application/json": { schema: error } } } } },
    patch: { tags: ["Recurring Transactions"], summary: "Update a recurring transaction rule", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateRecurringTransactionRequest" } } } }, responses: { "200": { description: "Recurring rule updated", content: { "application/json": { schema: response } } }, "400": { description: "Invalid request", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Recurring rule not found", content: { "application/json": { schema: error } } } } },
    delete: { tags: ["Recurring Transactions"], summary: "Deactivate a recurring transaction rule", security: [{ bearerAuth: [] }], responses: { "204": { description: "Recurring rule deactivated" }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Recurring rule not found", content: { "application/json": { schema: error } } } } },
  },
  "/recurring-transactions/{id}/generate": {
    parameters: [id],
    post: { tags: ["Recurring Transactions", "Planned Transactions"], summary: "Generate the next planned transaction", description: "Creates a transaction on nextRunDate and advances the recurring rule.", security: [{ bearerAuth: [] }], responses: { "201": { description: "Transaction generated", content: { "application/json": { schema: { $ref: "#/components/schemas/TransactionResponse" } } } }, "400": { description: "Inactive or completed rule", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Recurring rule not found", content: { "application/json": { schema: error } } } } },
  },
};