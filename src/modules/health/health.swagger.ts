import type { OpenAPIV3 } from "openapi-types";

export const healthPaths: OpenAPIV3.PathsObject = {
  "/health": {
    get: {
      tags: ["Health"],
      summary: "Liveness check",
      description: "Returns ok when the process is running. Does not check the database.",
      responses: {
        "200": {
          description: "Service is alive",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/health/ready": {
    get: {
      tags: ["Health"],
      summary: "Readiness check",
      description: "Pings PostgreSQL with SELECT 1.",
      responses: {
        "200": {
          description: "Database is reachable",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ready" },
                    },
                  },
                },
              },
            },
          },
        },
        "503": {
          description: "Database is unavailable",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
};
