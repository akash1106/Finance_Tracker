import type { OpenAPIV3 } from "openapi-types";

const errorResponse = { $ref: "#/components/schemas/ErrorResponse" };
const incomeResponse = { $ref: "#/components/schemas/IncomeResponse" };

export const incomePaths: OpenAPIV3.PathsObject = {
  "/income": {
    get: {
      tags: ["Income"], summary: "List income transactions", security: [{ bearerAuth: [] }],
      parameters: [
        { name: "from", in: "query", schema: { type: "string", format: "date" } },
        { name: "to", in: "query", schema: { type: "string", format: "date" } },
        { name: "incomeSource", in: "query", schema: { type: "string", format: "uuid" } },
        { name: "account", in: "query", schema: { type: "string", format: "uuid" } },
        { name: "isSalary", in: "query", schema: { type: "boolean" } },
        { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
      ],
      responses: {
        "200": { description: "Income transactions retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/IncomeListResponse" } } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } },
      },
    },
    post: {
      tags: ["Income"], summary: "Record income", security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateIncomeRequest" } } } },
      responses: {
        "201": { description: "Income recorded", content: { "application/json": { schema: incomeResponse } } },
        "400": { description: "Invalid request or related resource", content: { "application/json": { schema: errorResponse } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } },
      },
    },
  },
  "/income/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
    get: { tags: ["Income"], summary: "Get an income transaction", security: [{ bearerAuth: [] }], responses: { "200": { description: "Income retrieved", content: { "application/json": { schema: incomeResponse } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Income not found", content: { "application/json": { schema: errorResponse } } } } },
    patch: { tags: ["Income"], summary: "Update an income transaction", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateIncomeRequest" } } } }, responses: { "200": { description: "Income updated", content: { "application/json": { schema: incomeResponse } } }, "400": { description: "Invalid request", content: { "application/json": { schema: errorResponse } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Income not found", content: { "application/json": { schema: errorResponse } } } } },
    delete: { tags: ["Income"], summary: "Delete an income transaction", security: [{ bearerAuth: [] }], responses: { "204": { description: "Income deleted" }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Income not found", content: { "application/json": { schema: errorResponse } } } } },
  },
};