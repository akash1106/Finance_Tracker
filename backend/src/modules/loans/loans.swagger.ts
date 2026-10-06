import type { OpenAPIV3 } from "openapi-types";

const error = { $ref: "#/components/schemas/ErrorResponse" };
const loan = { $ref: "#/components/schemas/LoanResponse" };
const id: OpenAPIV3.ParameterObject = { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } };
const paymentId: OpenAPIV3.ParameterObject = { name: "paymentId", in: "path", required: true, schema: { type: "string", format: "uuid" } };

export const loansPaths: OpenAPIV3.PathsObject = {
  "/loans": {
    get: { tags: ["Loans"], summary: "List loans", security: [{ bearerAuth: [] }], responses: { "200": { description: "Loans retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/LoanListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
    post: { tags: ["Loans"], summary: "Create a loan", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateLoanRequest" } } } }, responses: { "201": { description: "Loan created", content: { "application/json": { schema: loan } } }, "400": { description: "Invalid request", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } } } },
  },
  "/loans/{id}": {
    parameters: [id],
    get: { tags: ["Loans"], summary: "Get loan details and EMI tracking", security: [{ bearerAuth: [] }], responses: { "200": { description: "Loan retrieved", content: { "application/json": { schema: loan } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Loan not found", content: { "application/json": { schema: error } } } } },
    patch: { tags: ["Loans"], summary: "Update a loan", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateLoanRequest" } } } }, responses: { "200": { description: "Loan updated", content: { "application/json": { schema: loan } } }, "400": { description: "Invalid request", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Loan not found", content: { "application/json": { schema: error } } } } },
    delete: { tags: ["Loans"], summary: "Cancel a loan", security: [{ bearerAuth: [] }], responses: { "204": { description: "Loan cancelled" }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Loan not found", content: { "application/json": { schema: error } } } } },
  },
  "/loans/{id}/payments": {
    parameters: [id],
    get: { tags: ["Loan Payments"], summary: "List loan payments", security: [{ bearerAuth: [] }], responses: { "200": { description: "Loan payments retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/LoanPaymentListResponse" } } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Loan not found", content: { "application/json": { schema: error } } } } },
    post: { tags: ["Loan Payments"], summary: "Record an EMI payment", description: "Creates a linked LOAN_PAYMENT transaction and updates loan status when principal is reached.", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateLoanPaymentRequest" } } } }, responses: { "201": { description: "Loan payment recorded", content: { "application/json": { schema: { $ref: "#/components/schemas/LoanPaymentResponse" } } } }, "400": { description: "Invalid account or inactive loan", content: { "application/json": { schema: error } } }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Loan not found", content: { "application/json": { schema: error } } } } },
  },
  "/loans/{id}/payments/{paymentId}": {
    parameters: [id, paymentId],
    delete: { tags: ["Loan Payments"], summary: "Delete an EMI payment", description: "Removes the payment and linked LOAN_PAYMENT transaction.", security: [{ bearerAuth: [] }], responses: { "204": { description: "Loan payment deleted" }, "401": { description: "Authentication required", content: { "application/json": { schema: error } } }, "404": { description: "Loan payment not found", content: { "application/json": { schema: error } } } } },
  },
};