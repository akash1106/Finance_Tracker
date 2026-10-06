import type { OpenAPIV3 } from "openapi-types";
const error = { $ref: "#/components/schemas/ErrorResponse" };
export const netWorthPaths: OpenAPIV3.PathsObject = {
  "/net-worth": { get: { tags: ["Net Worth"], summary: "Get current net worth", security: [{ bearerAuth: [] }], responses: { "200": { description: "Net worth retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/NetWorthResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
  "/net-worth/history": { get: { tags: ["Net Worth"], summary: "Get net worth history", security: [{ bearerAuth: [] }], responses: { "200": { description: "Net worth history retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/NetWorthHistoryResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
};