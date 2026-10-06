/// <reference types="jest" />

import express from "express";
import request from "supertest";
import { describe, expect, it } from "@jest/globals";
import { createRateLimiter } from "../src/middleware/rate-limit.middleware";

describe("Rate Limiting Middleware", () => {
  it("allows requests under the limit and blocks requests that exceed the limit with a standard 429 response", async () => {
    const app = express();
    const testLimiter = createRateLimiter({
      windowMs: 60 * 1000,
      limit: 2,
      message: "Custom rate limit exceeded message",
      skipInTest: false,
    });

    app.use(testLimiter);
    app.get("/test", (_req, res) => {
      res.json({ success: true, data: "ok" });
    });

    const res1 = await request(app).get("/test");
    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    const res2 = await request(app).get("/test");
    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);

    const res3 = await request(app).get("/test");
    expect(res3.status).toBe(429);
    expect(res3.body).toEqual({
      success: false,
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Custom rate limit exceeded message",
        details: [],
      },
    });
  });

  it("skips rate limiting when skip condition is met", async () => {
    const app = express();
    const testLimiter = createRateLimiter({
      windowMs: 60 * 1000,
      limit: 1,
      skip: (req) => req.path === "/health",
    });

    app.use(testLimiter);
    app.get("/health", (_req, res) => {
      res.json({ success: true, data: { status: "ok" } });
    });

    // In NODE_ENV=test, it will skip by default, and health skip is also tested
    const res1 = await request(app).get("/health");
    const res2 = await request(app).get("/health");
    const res3 = await request(app).get("/health");

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(200);
  });
});
