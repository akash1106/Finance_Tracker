import type { OpenAPIV3 } from "openapi-types";

const error = { $ref: "#/components/schemas/ErrorResponse" };
const template = { $ref: "#/components/schemas/BudgetTemplateResponse" };
const item = { $ref: "#/components/schemas/BudgetTemplateItemResponse" };
const id: OpenAPIV3.ParameterObject = { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } };
const itemId: OpenAPIV3.ParameterObject = { name: "itemId", in: "path", required: true, schema: { type: "string", format: "uuid" } };

export const budgetTemplatesPaths: OpenAPIV3.PathsObject = {
  "/budget-templates": {
    get: { tags: ["Budget Templates"], summary: "List active budget templates", security: [{ bearerAuth: [] }], responses: { "200": { description: "Templates retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/BudgetTemplateListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
    post: { tags: ["Budget Templates"], summary: "Create a budget template", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateBudgetTemplateRequest" } } } }, responses: { "201": { description: "Template created", content: { "application/json": { schema: template } } }, "400": { description: "Invalid request", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/budget-templates/{id}": {
    parameters: [id],
    get: { tags: ["Budget Templates"], summary: "Get a budget template with items", security: [{ bearerAuth: [] }], responses: { "200": { description: "Template retrieved", content: { "application/json": { schema: template } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Template not found", content: { "application/json": { schema: error } } } } },
    patch: { tags: ["Budget Templates"], summary: "Update or activate a budget template", description: "Activation is allowed only when item percentages total 100%.", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateBudgetTemplateRequest" } } } }, responses: { "200": { description: "Template updated", content: { "application/json": { schema: template } } }, "400": { description: "Invalid allocation", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Template not found", content: { "application/json": { schema: error } } } } },
    delete: { tags: ["Budget Templates"], summary: "Deactivate a budget template", security: [{ bearerAuth: [] }], responses: { "204": { description: "Template deactivated" }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Template not found", content: { "application/json": { schema: error } } } } },
  },
  "/budget-templates/{id}/items": {
    parameters: [id],
    post: { tags: ["Budget Template Items"], summary: "Add an allocation item", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateBudgetTemplateItemRequest" } } } }, responses: { "201": { description: "Item added", content: { "application/json": { schema: item } } }, "400": { description: "Invalid category or percentage", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Template not found", content: { "application/json": { schema: error } } } } },
  },
  "/budget-templates/{id}/items/{itemId}": {
    parameters: [id, itemId],
    patch: { tags: ["Budget Template Items"], summary: "Update an allocation percentage", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateBudgetTemplateItemRequest" } } } }, responses: { "200": { description: "Item updated", content: { "application/json": { schema: item } } }, "400": { description: "Invalid percentage", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Item not found", content: { "application/json": { schema: error } } } } },
    delete: { tags: ["Budget Template Items"], summary: "Remove an allocation item", security: [{ bearerAuth: [] }], responses: { "204": { description: "Item removed" }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Item not found", content: { "application/json": { schema: error } } } } },
  },
  "/budget-templates/{id}/validate": {
    parameters: [id],
    post: { tags: ["Budget Template Items"], summary: "Validate allocation total", security: [{ bearerAuth: [] }], responses: { "200": { description: "Allocation validation result", content: { "application/json": { schema: { $ref: "#/components/schemas/BudgetValidationResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Template not found", content: { "application/json": { schema: error } } } } },
  },
};