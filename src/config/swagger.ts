import type { OpenAPIV3 } from "openapi-types";
import { accountsPaths } from "../modules/accounts/accounts.swagger.js";
import { authPaths } from "../modules/auth/auth.swagger.js";
import { categoriesPaths, subcategoriesPaths } from "../modules/categories/categories.swagger.js";
import { healthPaths } from "../modules/health/health.swagger.js";
import { incomePaths } from "../modules/income/income.swagger.js";
import { incomeSourcesPaths } from "../modules/income-sources/income-sources.swagger.js";
import { transactionsPaths } from "../modules/transactions/transactions.swagger.js";

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Personal Finance & Salary Tracker API",
    version: "0.1.0",
    description: "REST API for the personal finance tracker.",
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1",
    },
  ],
  paths: {
    ...accountsPaths,
    ...authPaths,
    ...categoriesPaths,
    ...healthPaths,
    ...incomePaths,
    ...incomeSourcesPaths,
    ...subcategoriesPaths,
    ...transactionsPaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", maxLength: 100, example: "Akash" },
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, format: "password", example: "password123" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", format: "password", example: "password123" },
        },
      },
      Account: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "HDFC Salary Account" },
          accountType: { type: "string", enum: ["BANK", "CASH", "OTHER"] },
          openingBalance: { type: "string", example: "50000.00" },
          balance: { type: "string", example: "50000.00" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateAccountRequest: {
        type: "object",
        required: ["name", "accountType"],
        properties: {
          name: { type: "string", maxLength: 100, example: "HDFC Salary Account" },
          accountType: { type: "string", enum: ["BANK", "CASH", "OTHER"] },
          openingBalance: { type: "number", minimum: 0, example: 50000 },
        },
      },
      UpdateAccountRequest: {
        allOf: [{ $ref: "#/components/schemas/CreateAccountRequest" }],
      },
      AccountResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { $ref: "#/components/schemas/Account" } } },
        ],
      },
      IncomeSource: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Salary" },
          isSalary: { type: "boolean", example: true },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateIncomeSourceRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", maxLength: 100, example: "Salary" },
          isSalary: { type: "boolean", default: false },
        },
      },
      UpdateIncomeSourceRequest: {
        allOf: [{ $ref: "#/components/schemas/CreateIncomeSourceRequest" }],
      },
      IncomeSourceResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { $ref: "#/components/schemas/IncomeSource" } } },
        ],
      },
      IncomeSourceListResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/IncomeSource" } } } },
        ],
      },
      CreateIncomeRequest: {
        type: "object",
        required: ["incomeSourceId", "accountId", "amount", "receivedDate"],
        properties: {
          incomeSourceId: { type: "string", format: "uuid" },
          accountId: { type: "string", format: "uuid" },
          amount: { type: "number", minimum: 0, exclusiveMinimum: true, example: 50000 },
          receivedDate: { type: "string", format: "date" },
          description: { type: "string", maxLength: 1000 },
          isRecurring: { type: "boolean", default: false },
          notes: { type: "string", maxLength: 2000 },
        },
      },
      UpdateIncomeRequest: {
        allOf: [{ $ref: "#/components/schemas/CreateIncomeRequest" }],
      },
      Income: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          incomeSourceId: { type: "string", format: "uuid" },
          accountId: { type: "string", format: "uuid" },
          amount: { type: "string", example: "50000.00" },
          receivedDate: { type: "string", format: "date-time" },
          description: { type: "string", nullable: true },
          isRecurring: { type: "boolean" },
          notes: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      IncomeResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { $ref: "#/components/schemas/Income" } } },
        ],
      },
      IncomeListResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Income" } }, pagination: { $ref: "#/components/schemas/Pagination" } } },
        ],
      },
      CreateCategoryRequest: {
        type: "object",
        required: ["name", "categoryType"],
        properties: {
          name: { type: "string", maxLength: 100, example: "Food" },
          categoryType: { type: "string", enum: ["EXPENSE", "INCOME", "SAVING", "INVESTMENT"] },
          description: { type: "string", maxLength: 1000 },
        },
      },
      UpdateCategoryRequest: { allOf: [{ $ref: "#/components/schemas/CreateCategoryRequest" }] },
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" }, userId: { type: "string", format: "uuid" },
          name: { type: "string" }, categoryType: { type: "string" }, description: { type: "string", nullable: true },
          isActive: { type: "boolean" }, subcategories: { type: "array", items: { $ref: "#/components/schemas/Subcategory" } },
          createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" },
        },
      },
      CategoryResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Category" } } }] },
      CategoryListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Category" } } } }] },
      CreateSubcategoryRequest: { type: "object", required: ["name"], properties: { name: { type: "string", maxLength: 100, example: "Groceries" }, description: { type: "string", maxLength: 1000 } } },
      UpdateSubcategoryRequest: { allOf: [{ $ref: "#/components/schemas/CreateSubcategoryRequest" }] },
      Subcategory: { type: "object", properties: { id: { type: "string", format: "uuid" }, categoryId: { type: "string", format: "uuid" }, name: { type: "string" }, description: { type: "string", nullable: true }, isActive: { type: "boolean" }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } } },
      SubcategoryResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Subcategory" } } }] },
      SubcategoryListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Subcategory" } } } }] },
      CreateTransactionRequest: {
        type: "object",
        required: ["transactionType", "amount", "accountId", "transactionDate"],
        properties: {
          transactionType: { type: "string", enum: ["EXPENSE", "TRANSFER", "SAVING", "INVESTMENT", "LOAN_PAYMENT"] },
          amount: { type: "number", minimum: 0, exclusiveMinimum: true }, categoryId: { type: "string", format: "uuid" }, subcategoryId: { type: "string", format: "uuid" },
          accountId: { type: "string", format: "uuid" }, transactionDate: { type: "string", format: "date" },
          paymentMethod: { type: "string", enum: ["CASH", "UPI", "DEBIT_CARD", "BANK_TRANSFER", "OTHER"] }, description: { type: "string" }, notes: { type: "string" },
        },
      },
      UpdateTransactionRequest: { allOf: [{ $ref: "#/components/schemas/CreateTransactionRequest" }] },
      Transaction: { type: "object", properties: { id: { type: "string", format: "uuid" }, userId: { type: "string", format: "uuid" }, transactionType: { type: "string" }, amount: { type: "string", example: "500.00" }, categoryId: { type: "string", format: "uuid", nullable: true }, subcategoryId: { type: "string", format: "uuid", nullable: true }, accountId: { type: "string", format: "uuid" }, transactionDate: { type: "string", format: "date-time" }, paymentMethod: { type: "string", nullable: true }, description: { type: "string", nullable: true }, notes: { type: "string", nullable: true }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } } },
      TransactionResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { $ref: "#/components/schemas/Transaction" } } }] },
      TransactionListResponse: { allOf: [{ $ref: "#/components/schemas/SuccessResponse" }, { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Transaction" } }, pagination: { $ref: "#/components/schemas/Pagination" } } }] },
      Pagination: { type: "object", properties: { page: { type: "integer" }, limit: { type: "integer" }, total: { type: "integer" }, totalPages: { type: "integer" } } },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Akash" },
          email: { type: "string", format: "email", example: "user@example.com" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          {
            type: "object",
            properties: {
              data: { $ref: "#/components/schemas/User" },
              message: { type: "string" },
            },
          },
        ],
      },
      LoginResponse: {
        allOf: [
          { $ref: "#/components/schemas/SuccessResponse" },
          {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                  user: { $ref: "#/components/schemas/User" },
                },
              },
              message: { type: "string" },
            },
          },
        ],
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
          message: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string" },
              details: { type: "array", items: { type: "object" } },
            },
          },
        },
      },
    },
  },
};
