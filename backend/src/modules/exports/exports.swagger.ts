import type { OpenAPIV3 } from "openapi-types";

const error = { $ref: "#/components/schemas/ErrorResponse" };
const formatParameter: OpenAPIV3.ParameterObject = { name: "format", in: "query", schema: { type: "string", enum: ["CSV", "XLSX"], default: "CSV" } };
const year: OpenAPIV3.ParameterObject = { name: "year", in: "query", required: true, schema: { type: "integer", example: 2026 } };
const month: OpenAPIV3.ParameterObject = { name: "month", in: "query", required: true, schema: { type: "integer", minimum: 1, maximum: 12, example: 9 } };

export const exportsPaths: OpenAPIV3.PathsObject = {
  "/exports/transactions": {
    get: { tags: ["Exports"], summary: "Export transactions as CSV or XLSX", security: [{ bearerAuth: [] }], parameters: [formatParameter, { name: "from", in: "query", schema: { type: "string", format: "date" } }, { name: "to", in: "query", schema: { type: "string", format: "date" } }], responses: { "200": { description: "Transaction file download", content: { "text/csv": {}, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {} } }, "400": { description: "Invalid export options", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/exports/monthly-report": {
    get: { tags: ["Exports"], summary: "Export a monthly PDF report", security: [{ bearerAuth: [] }], parameters: [year, month], responses: { "200": { description: "Monthly PDF download", content: { "application/pdf": {} } }, "400": { description: "Invalid report period", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/exports/yearly-report": {
    get: { tags: ["Exports"], summary: "Export a yearly PDF report", security: [{ bearerAuth: [] }], parameters: [year], responses: { "200": { description: "Yearly PDF download", content: { "application/pdf": {} } }, "400": { description: "Invalid report year", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
};