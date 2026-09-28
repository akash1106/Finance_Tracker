import type { OpenAPIV3 } from "openapi-types";

const accountIdParameter: OpenAPIV3.ParameterObject = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" },
};

export const accountsPaths: OpenAPIV3.PathsObject = {
  "/accounts": {
    get: {
      tags: ["Accounts"],
      summary: "List active accounts",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Accounts retrieved successfully",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { type: "array", items: { $ref: "#/components/schemas/Account" } },
                    },
                  },
                ],
              },
            },
          },
        },
        "401": { description: "Authentication required", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    post: {
      tags: ["Accounts"],
      summary: "Create an account",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/CreateAccountRequest" } } },
      },
      responses: {
        "201": { description: "Account created", content: { "application/json": { schema: { $ref: "#/components/schemas/AccountResponse" } } } },
        "400": { description: "Invalid request", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/accounts/{id}": {
    parameters: [accountIdParameter],
    get: {
      tags: ["Accounts"],
      summary: "Get an account and its balance",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Account retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/AccountResponse" } } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "404": { description: "Account not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    patch: {
      tags: ["Accounts"],
      summary: "Update an account",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateAccountRequest" } } },
      },
      responses: {
        "200": { description: "Account updated", content: { "application/json": { schema: { $ref: "#/components/schemas/AccountResponse" } } } },
        "400": { description: "Invalid request", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Authentication required", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "404": { description: "Account not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    delete: {
      tags: ["Accounts"],
      summary: "Deactivate an account",
      description: "Soft-deactivates the account instead of physically deleting it.",
      security: [{ bearerAuth: [] }],
      responses: {
        "204": { description: "Account deactivated" },
        "401": { description: "Authentication required", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "404": { description: "Account not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
};