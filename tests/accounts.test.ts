/// <reference types="jest" />

import { Prisma } from "@prisma/client";
import { describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import { prisma } from "../src/config/database";
import { createAccessToken } from "../src/modules/auth/auth.tokens";
import { createApp } from "../src/app";

const app = createApp();
const accessToken = createAccessToken("user-id", "user@example.com");
const account = {
  id: "11111111-1111-4111-8111-111111111111",
  userId: "user-id",
  name: "HDFC Salary Account",
  accountType: "BANK",
  openingBalance: new Prisma.Decimal("50000.00"),
  isActive: true,
  createdAt: new Date("2026-09-28T00:00:00.000Z"),
  updatedAt: new Date("2026-09-28T00:00:00.000Z"),
};

describe("Account APIs", () => {
  it("requires authentication", async () => {
    const response = await request(app).get("/api/v1/accounts");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("lists only the authenticated user's active accounts", async () => {
    const findMany = jest.spyOn(prisma.account, "findMany").mockResolvedValue([account]);

    const response = await request(app)
      .get("/api/v1/accounts")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(findMany).toHaveBeenCalledWith({
      where: { userId: "user-id", isActive: true },
      orderBy: { name: "asc" },
    });
    expect(response.body.data[0]).toMatchObject({
      id: account.id,
      name: account.name,
      accountType: "BANK",
      openingBalance: "50000.00",
      balance: "50000.00",
    });
  });

  it("creates an account for the authenticated user", async () => {
    const create = jest.spyOn(prisma.account, "create").mockResolvedValue(account);

    const response = await request(app)
      .post("/api/v1/accounts")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "HDFC Salary Account",
        accountType: "BANK",
        openingBalance: 50000,
      });

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({
      data: {
        name: "HDFC Salary Account",
        accountType: "BANK",
        openingBalance: 50000,
        userId: "user-id",
      },
    });
  });

  it("deactivates an account instead of deleting it", async () => {
    const findFirst = jest.spyOn(prisma.account, "findFirst").mockResolvedValue(account);
    const update = jest.spyOn(prisma.account, "update").mockResolvedValue({
      ...account,
      isActive: false,
    });

    const response = await request(app)
      .delete(`/api/v1/accounts/${account.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(204);
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: account.id, userId: "user-id" },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: account.id },
      data: { isActive: false },
    });
  });
});