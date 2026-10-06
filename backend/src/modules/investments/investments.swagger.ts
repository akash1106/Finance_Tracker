import type { OpenAPIV3 } from "openapi-types";

const error = { $ref: "#/components/schemas/ErrorResponse" };
const investment = { $ref: "#/components/schemas/InvestmentResponse" };
const id: OpenAPIV3.ParameterObject = { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } };
const contributionId: OpenAPIV3.ParameterObject = { name: "contributionId", in: "path", required: true, schema: { type: "string", format: "uuid" } };

export const investmentsPaths: OpenAPIV3.PathsObject = {
  "/investments": {
    get: { tags: ["Investments"], summary: "List investments", security: [{ bearerAuth: [] }], responses: { "200": { description: "Investments retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/InvestmentListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
    post: { tags: ["Investments"], summary: "Create an investment", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateInvestmentRequest" } } } }, responses: { "201": { description: "Investment created", content: { "application/json": { schema: investment } } }, "400": { description: "Invalid request", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/investments/{id}": {
    parameters: [id],
    get: { tags: ["Investments"], summary: "Get an investment with contributions", security: [{ bearerAuth: [] }], responses: { "200": { description: "Investment retrieved", content: { "application/json": { schema: investment } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Investment not found", content: { "application/json": { schema: error } } } } },
    patch: { tags: ["Investments"], summary: "Update an investment", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateInvestmentRequest" } } } }, responses: { "200": { description: "Investment updated", content: { "application/json": { schema: investment } } }, "400": { description: "Invalid request", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Investment not found", content: { "application/json": { schema: error } } } } },
    delete: { tags: ["Investments"], summary: "Deactivate an investment", security: [{ bearerAuth: [] }], responses: { "204": { description: "Investment deactivated" }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Investment not found", content: { "application/json": { schema: error } } } } },
  },
  "/investments/{id}/contributions": {
    parameters: [id],
    get: { tags: ["Investment Contributions"], summary: "List investment contributions", security: [{ bearerAuth: [] }], responses: { "200": { description: "Contributions retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/InvestmentContributionListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Investment not found", content: { "application/json": { schema: error } } } } },
    post: { tags: ["Investment Contributions"], summary: "Add an investment contribution", description: "Creates a linked INVESTMENT transaction atomically.", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateInvestmentContributionRequest" } } } }, responses: { "201": { description: "Contribution added", content: { "application/json": { schema: { $ref: "#/components/schemas/InvestmentContributionResponse" } } } }, "400": { description: "Invalid account or investment", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Investment not found", content: { "application/json": { schema: error } } } } },
  },
  "/investments/{id}/contributions/{contributionId}": {
    parameters: [id, contributionId],
    delete: { tags: ["Investment Contributions"], summary: "Delete an investment contribution", description: "Removes the contribution and linked transaction.", security: [{ bearerAuth: [] }], responses: { "204": { description: "Contribution deleted" }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Contribution not found", content: { "application/json": { schema: error } } } } },
  },
};