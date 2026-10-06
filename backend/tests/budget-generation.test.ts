/// <reference types="jest" />

import { describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/config/database";
import { generateBudget } from "../src/modules/budgets/budgets.controller";

const id = "11111111-1111-4111-8111-111111111111";
const req = { auth: { userId: "user-id", email: "user@example.com" }, body: { incomeTransactionId: id, budgetTemplateId: id } } as unknown as Request;
const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;

describe("budget generation", () => {
  it("allocates salary across a valid active template", async () => {
    jest.spyOn(prisma.incomeTransaction, "findFirst").mockResolvedValue({ id, userId: "user-id", amount: new Prisma.Decimal("1000"), receivedDate: new Date("2026-09-15") } as never);
    jest.spyOn(prisma.budgetTemplate, "findFirst").mockResolvedValue({ id, userId: "user-id", isActive: true, items: [{ id, budgetTemplateId: id, categoryId: id, percentage: new Prisma.Decimal("100"), createdAt: new Date(), updatedAt: new Date() }] } as never);
    jest.spyOn(prisma.monthlyBudget, "findFirst").mockResolvedValue(null as never);
    jest.spyOn(prisma.monthlyBudget, "create").mockResolvedValue({ id, allocatedAmount: new Prisma.Decimal("1000"), items: [] } as never);

    await generateBudget(req, res);

    expect(prisma.monthlyBudget.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});