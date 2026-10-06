/// <reference types="jest" />

import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { createApp } from "../src/app";
import { createAccessToken } from "../src/modules/auth/auth.tokens";

const app = createApp();
const accessToken = createAccessToken("user-id", "user@example.com");

describe("protected finance modules", () => {
  const protectedRequests = [
    ["accounts", () => request(app).get("/api/v1/accounts")],
    ["income sources", () => request(app).get("/api/v1/income-sources")],
    ["income", () => request(app).get("/api/v1/income")],
    ["categories", () => request(app).get("/api/v1/categories")],
    ["subcategories", () => request(app).get("/api/v1/subcategories/not-a-uuid")],
    ["transactions", () => request(app).get("/api/v1/transactions")],
    ["budget templates", () => request(app).get("/api/v1/budget-templates")],
    ["budgets", () => request(app).get("/api/v1/budgets")],
    ["fixed expenses", () => request(app).get("/api/v1/fixed-expenses")],
    ["recurring transactions", () => request(app).get("/api/v1/recurring-transactions")],
    ["savings goals", () => request(app).get("/api/v1/savings-goals")],
    ["investments", () => request(app).get("/api/v1/investments")],
  ] as const;

  it.each(protectedRequests)("requires authentication for %s", async (_name, makeRequest) => {
    const response = await makeRequest();

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});

describe("finance validation boundaries", () => {
  it("rejects an invalid account UUID before querying the database", async () => {
    const response = await request(app)
      .get("/api/v1/accounts/not-a-uuid")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects an invalid transaction filter", async () => {
    const response = await request(app)
      .get("/api/v1/transactions?limit=0")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("does not allow activating an empty budget template", async () => {
    const response = await request(app)
      .post("/api/v1/budget-templates")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Incomplete template", isActive: true });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_ALLOCATION");
  });

  it("validates savings contribution input", async () => {
    const response = await request(app)
      .post("/api/v1/savings-goals/not-a-uuid/contributions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: -10 });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("validates investment contribution input", async () => {
    const response = await request(app)
      .post("/api/v1/investments/not-a-uuid/contributions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 0 });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});