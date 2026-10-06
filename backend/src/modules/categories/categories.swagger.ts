import type { OpenAPIV3 } from "openapi-types";

const errorResponse = { $ref: "#/components/schemas/ErrorResponse" };
const categoryResponse = { $ref: "#/components/schemas/CategoryResponse" };
const subcategoryResponse = { $ref: "#/components/schemas/SubcategoryResponse" };
const idParameter: OpenAPIV3.ParameterObject = { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } };

export const categoriesPaths: OpenAPIV3.PathsObject = {
  "/categories": {
    get: { tags: ["Categories"], summary: "List categories", security: [{ bearerAuth: [] }], parameters: [{ name: "type", in: "query", schema: { type: "string", enum: ["EXPENSE", "INCOME", "SAVING", "INVESTMENT"] } }, { name: "includeInactive", in: "query", schema: { type: "boolean", default: false } }], responses: { "200": { description: "Categories retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } } } },
    post: { tags: ["Categories"], summary: "Create a category", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCategoryRequest" } } } }, responses: { "201": { description: "Category created", content: { "application/json": { schema: categoryResponse } } }, "400": { description: "Invalid request", content: { "application/json": { schema: errorResponse } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } } } },
  },
  "/categories/{id}": {
    parameters: [idParameter],
    get: { tags: ["Categories"], summary: "Get a category with subcategories", security: [{ bearerAuth: [] }], responses: { "200": { description: "Category retrieved", content: { "application/json": { schema: categoryResponse } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Category not found", content: { "application/json": { schema: errorResponse } } } } },
    patch: { tags: ["Categories"], summary: "Update a category", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateCategoryRequest" } } } }, responses: { "200": { description: "Category updated", content: { "application/json": { schema: categoryResponse } } }, "400": { description: "Invalid request", content: { "application/json": { schema: errorResponse } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Category not found", content: { "application/json": { schema: errorResponse } } } } },
    delete: { tags: ["Categories"], summary: "Deactivate a category", security: [{ bearerAuth: [] }], responses: { "204": { description: "Category deactivated" }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Category not found", content: { "application/json": { schema: errorResponse } } } } },
  },
  "/categories/{categoryId}/subcategories": {
    parameters: [{ name: "categoryId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
    get: { tags: ["Subcategories"], summary: "List subcategories", security: [{ bearerAuth: [] }], responses: { "200": { description: "Subcategories retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/SubcategoryListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Category not found", content: { "application/json": { schema: errorResponse } } } } },
    post: { tags: ["Subcategories"], summary: "Create a subcategory", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateSubcategoryRequest" } } } }, responses: { "201": { description: "Subcategory created", content: { "application/json": { schema: subcategoryResponse } } }, "400": { description: "Invalid request", content: { "application/json": { schema: errorResponse } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Category not found", content: { "application/json": { schema: errorResponse } } } } },
  },
};

export const subcategoriesPaths: OpenAPIV3.PathsObject = {
  "/subcategories/{id}": {
    parameters: [idParameter],
    get: { tags: ["Subcategories"], summary: "Get a subcategory", security: [{ bearerAuth: [] }], responses: { "200": { description: "Subcategory retrieved", content: { "application/json": { schema: subcategoryResponse } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Subcategory not found", content: { "application/json": { schema: errorResponse } } } } },
    patch: { tags: ["Subcategories"], summary: "Update a subcategory", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateSubcategoryRequest" } } } }, responses: { "200": { description: "Subcategory updated", content: { "application/json": { schema: subcategoryResponse } } }, "400": { description: "Invalid request", content: { "application/json": { schema: errorResponse } } }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Subcategory not found", content: { "application/json": { schema: errorResponse } } } } },
    delete: { tags: ["Subcategories"], summary: "Deactivate a subcategory", security: [{ bearerAuth: [] }], responses: { "204": { description: "Subcategory deactivated" }, "401": { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }, "404": { description: "Subcategory not found", content: { "application/json": { schema: errorResponse } } } } },
  },
};