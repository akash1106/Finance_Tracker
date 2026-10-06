import type { OpenAPIV3 } from "openapi-types";

const errorResponse = { $ref: "#/components/schemas/ErrorResponse" };
const sourceResponse = { $ref: "#/components/schemas/IncomeSourceResponse" };

export const incomeSourcesPaths: OpenAPIV3.PathsObject = {
  "/income-sources": {
    get: {
      tags: ["Income Sources"],
      summary: "List active income sources",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Income sources retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/IncomeSourceListResponse" } } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } },
      },
    },
    post: {
      tags: ["Income Sources"],
      summary: "Create an income source",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateIncomeSourceRequest" } } } },
      responses: {
        "201": { description: "Income source created", content: { "application/json": { schema: sourceResponse } } },
        "400": { description: "Invalid request", content: { "application/json": { schema: errorResponse } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } },
      },
    },
  },
  "/income-sources/{id}": {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
    get: {
      tags: ["Income Sources"], summary: "Get an income source", security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Income source retrieved", content: { "application/json": { schema: sourceResponse } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } },
        "404": { description: "Income source not found", content: { "application/json": { schema: errorResponse } } },
      },
    },
    patch: {
      tags: ["Income Sources"], summary: "Update an income source", security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateIncomeSourceRequest" } } } },
      responses: {
        "200": { description: "Income source updated", content: { "application/json": { schema: sourceResponse } } },
        "400": { description: "Invalid request", content: { "application/json": { schema: errorResponse } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } },
        "404": { description: "Income source not found", content: { "application/json": { schema: errorResponse } } },
      },
    },
    delete: {
      tags: ["Income Sources"], summary: "Deactivate an income source", security: [{ bearerAuth: [] }],
      responses: {
        "204": { description: "Income source deactivated" },
        "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } },
        "404": { description: "Income source not found", content: { "application/json": { schema: errorResponse } } },
      },
    },
  },
};