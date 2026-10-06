import type { OpenAPIV3 } from "openapi-types";

const error = { $ref: "#/components/schemas/ErrorResponse" };
const goal = { $ref: "#/components/schemas/FinancialGoalResponse" };
const id: OpenAPIV3.ParameterObject = { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } };
const contributionId: OpenAPIV3.ParameterObject = { name: "contributionId", in: "path", required: true, schema: { type: "string", format: "uuid" } };

export const financialGoalsPaths: OpenAPIV3.PathsObject = {
  "/financial-goals": {
    get: { tags: ["Financial Goals"], summary: "List financial goals", security: [{ bearerAuth: [] }], responses: { "200": { description: "Financial goals retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/FinancialGoalListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
    post: { tags: ["Financial Goals"], summary: "Create a financial goal", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateFinancialGoalRequest" } } } }, responses: { "201": { description: "Financial goal created", content: { "application/json": { schema: goal } } }, "400": { description: "Invalid request", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/financial-goals/{id}": {
    parameters: [id],
    get: { tags: ["Financial Goals"], summary: "Get a financial goal with contributions", security: [{ bearerAuth: [] }], responses: { "200": { description: "Financial goal retrieved", content: { "application/json": { schema: goal } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Financial goal not found", content: { "application/json": { schema: error } } } } },
    patch: { tags: ["Financial Goals"], summary: "Update a financial goal", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateFinancialGoalRequest" } } } }, responses: { "200": { description: "Financial goal updated", content: { "application/json": { schema: goal } } }, "400": { description: "Invalid request", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Financial goal not found", content: { "application/json": { schema: error } } } } },
    delete: { tags: ["Financial Goals"], summary: "Cancel a financial goal", security: [{ bearerAuth: [] }], responses: { "204": { description: "Financial goal cancelled" }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Financial goal not found", content: { "application/json": { schema: error } } } } },
  },
  "/financial-goals/{id}/contributions": {
    parameters: [id],
    get: { tags: ["Financial Goal Contributions"], summary: "List financial goal contributions", security: [{ bearerAuth: [] }], responses: { "200": { description: "Contributions retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/FinancialGoalContributionListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Financial goal not found", content: { "application/json": { schema: error } } } } },
    post: { tags: ["Financial Goal Contributions"], summary: "Add a financial goal contribution", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateFinancialGoalContributionRequest" } } } }, responses: { "201": { description: "Contribution added", content: { "application/json": { schema: { $ref: "#/components/schemas/FinancialGoalContributionResponse" } } } }, "400": { description: "Invalid request or inactive goal", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Financial goal not found", content: { "application/json": { schema: error } } } } },
  },
  "/financial-goals/{id}/contributions/{contributionId}": {
    parameters: [id, contributionId],
    delete: { tags: ["Financial Goal Contributions"], summary: "Delete a financial goal contribution", security: [{ bearerAuth: [] }], responses: { "204": { description: "Contribution deleted" }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Contribution not found", content: { "application/json": { schema: error } } } } },
  },
};