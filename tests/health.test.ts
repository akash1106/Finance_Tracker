/// <reference types="jest" />

import request from "supertest";
import { jest } from "@jest/globals";
import { prisma } from "../src/config/database";
import { createApp } from "../src/app";

const app = createApp();

describe("GET /api/v1/health", () => {
  it("returns ok without checking the database", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { status: "ok" },
    });
  });
});

describe("GET /api/v1/health/ready", () => {
  it("returns ready when the database query succeeds", async () => {
    jest.spyOn(prisma, "$queryRaw").mockResolvedValue([{ result: 1 }] as never);

    const response = await request(app).get("/api/v1/health/ready");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { status: "ready" },
    });
  });

  it("returns service unavailable when the database query fails", async () => {
    jest.spyOn(prisma, "$queryRaw").mockRejectedValue(new Error("database unavailable"));

    const response = await request(app).get("/api/v1/health/ready");

    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe("SERVICE_UNAVAILABLE");
  });
});

describe("GET /unknown", () => {
  it("returns the standard 404 envelope", async () => {
    const response = await request(app).get("/api/v1/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });
});
