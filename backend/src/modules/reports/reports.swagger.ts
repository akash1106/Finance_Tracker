import type { OpenAPIV3 } from "openapi-types";

const error = { $ref: "#/components/schemas/ErrorResponse" };
const filters: OpenAPIV3.ParameterObject[] = [
  { name: "from", in: "query", schema: { type: "string", format: "date" } },
  { name: "to", in: "query", schema: { type: "string", format: "date" } },
  { name: "year", in: "query", schema: { type: "integer", example: 2026 } },
  { name: "month", in: "query", schema: { type: "integer", minimum: 1, maximum: 12, example: 9 } },
  { name: "category", in: "query", schema: { type: "string", format: "uuid" } },
];

export const reportsPaths: OpenAPIV3.PathsObject = {
  "/reports/monthly": { get: { tags: ["Reports"], summary: "Get a monthly report", security: [{ bearerAuth: [] }], parameters: filters, responses: { "200": { description: "Monthly report retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/ReportResponse" } } } }, "400": { description: "Year and month are required", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
  "/reports/yearly": { get: { tags: ["Reports"], summary: "Get a yearly report", security: [{ bearerAuth: [] }], parameters: filters, responses: { "200": { description: "Yearly report retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/ReportResponse" } } } }, "400": { description: "Year is required", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
  "/reports/net-worth": { get: { tags: ["Reports"], summary: "Get a net worth report", security: [{ bearerAuth: [] }], parameters: filters, responses: { "200": { description: "Net worth report retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/NetWorthResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
  "/reports/category": { get: { tags: ["Reports"], summary: "Get category spending analytics", security: [{ bearerAuth: [] }], parameters: filters, responses: { "200": { description: "Category report retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryReportResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
  "/reports/cash-flow": { get: { tags: ["Reports"], summary: "Get a cash flow report", security: [{ bearerAuth: [] }], parameters: filters, responses: { "200": { description: "Cash flow report retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/CashFlowReportResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } } },
};