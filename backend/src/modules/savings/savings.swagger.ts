import type { OpenAPIV3 } from "openapi-types";

const error = { $ref: "#/components/schemas/ErrorResponse" };
const goal = { $ref: "#/components/schemas/SavingsGoalResponse" };
const id: OpenAPIV3.ParameterObject = { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } };
const contributionId: OpenAPIV3.ParameterObject = { name: "contributionId", in: "path", required: true, schema: { type: "string", format: "uuid" } };

export const savingsPaths: OpenAPIV3.PathsObject = {
  "/savings-goals": {
    get: { tags: ["Savings Goals"], summary: "List savings goals", security: [{ bearerAuth: [] }], responses: { "200": { description: "Savings goals retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/SavingsGoalListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
    post: { tags: ["Savings Goals"], summary: "Create a savings goal", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateSavingsGoalRequest" } } } }, responses: { "201": { description: "Savings goal created", content: { "application/json": { schema: goal } } }, "400": { description: "Invalid request", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/savings-goals/{id}": {
    parameters: [id],
    get: { tags: ["Savings Goals"], summary: "Get a savings goal with contributions", security: [{ bearerAuth: [] }], responses: { "200": { description: "Savings goal retrieved", content: { "application/json": { schema: goal } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Savings goal not found", content: { "application/json": { schema: error } } } } },
    patch: { tags: ["Savings Goals"], summary: "Update a savings goal", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateSavingsGoalRequest" } } } }, responses: { "200": { description: "Savings goal updated", content: { "application/json": { schema: goal } } }, "400": { description: "Invalid request", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Savings goal not found", content: { "application/json": { schema: error } } } } },
    delete: { tags: ["Savings Goals"], summary: "Cancel a savings goal", security: [{ bearerAuth: [] }], responses: { "204": { description: "Savings goal cancelled" }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Savings goal not found", content: { "application/json": { schema: error } } } } },
  },
  "/savings-goals/{id}/contributions": {
    parameters: [id],
    get: { tags: ["Savings Contributions"], summary: "List goal contributions", security: [{ bearerAuth: [] }], responses: { "200": { description: "Contributions retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/SavingsContributionListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Savings goal not found", content: { "application/json": { schema: error } } } } },
    post: { tags: ["Savings Contributions"], summary: "Add a savings contribution", description: "Creates a linked SAVING transaction and updates the goal balance atomically.", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateSavingsContributionRequest" } } } }, responses: { "201": { description: "Contribution added", content: { "application/json": { schema: { $ref: "#/components/schemas/SavingsContributionResponse" } } } }, "400": { description: "Invalid account or goal", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Savings goal not found", content: { "application/json": { schema: error } } } } },
  },
  "/savings-goals/{id}/contributions/{contributionId}": {
    parameters: [id, contributionId],
    delete: { tags: ["Savings Contributions"], summary: "Delete a savings contribution", description: "Removes the contribution, linked transaction, and amount from the goal total.", security: [{ bearerAuth: [] }], responses: { "204": { description: "Contribution deleted" }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Contribution not found", content: { "application/json": { schema: error } } } } },
  },
};