/// <reference types="jest" />

import request from "supertest";
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

describe("GET /unknown", () => {
  it("returns the standard 404 envelope", async () => {
    const response = await request(app).get("/api/v1/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });
});
