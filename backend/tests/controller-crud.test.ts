/// <reference types="jest" />

import { afterEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import { prisma } from "../src/config/database";
import { listIncomeSources, getIncomeSource, createIncomeSource, updateIncomeSource, deactivateIncomeSource } from "../src/modules/income-sources/income-sources.controller";
import { createCategory, getCategory, updateCategory, deactivateCategory, listSubcategories, createSubcategory, getSubcategory, updateSubcategory, deactivateSubcategory } from "../src/modules/categories/categories.controller";
import { createTransaction, getTransaction, updateTransaction, deleteTransaction } from "../src/modules/transactions/transactions.controller";

const userId = "user-id";
const uuid = "11111111-1111-4111-8111-111111111111";
const request = (body: unknown = {}, params: Record<string, string> = {}): Request => ({ auth: { userId, email: "user@example.com" }, body, params, query: {} } as unknown as Request);
const response = (): Response => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() } as unknown as Response);
const dates = { createdAt: new Date(), updatedAt: new Date() };
const source = { id: uuid, userId, name: "Salary", isSalary: true, isActive: true, ...dates };
const category = { id: uuid, userId, name: "Food", categoryType: "EXPENSE", description: null, isActive: true, ...dates };
const subcategory = { id: uuid, categoryId: uuid, name: "Groceries", description: null, isActive: true, ...dates };
const account = { id: uuid, userId, isActive: true };
const transaction = { id: uuid, userId, transactionType: "EXPENSE", amount: { toFixed: () => "100.00" }, categoryId: uuid, subcategoryId: uuid, accountId: uuid, transactionDate: new Date(), paymentMethod: null, description: null, notes: null, ...dates };

afterEach(() => jest.restoreAllMocks());

describe("income source controller CRUD", () => {
  it("covers list, get, create, update, and deactivate", async () => {
    jest.spyOn(prisma.incomeSource, "findMany").mockResolvedValue([source]);
    jest.spyOn(prisma.incomeSource, "findFirst").mockResolvedValue(source);
    jest.spyOn(prisma.incomeSource, "create").mockResolvedValue(source);
    jest.spyOn(prisma.incomeSource, "update").mockResolvedValue(source);
    const res = response();
    await listIncomeSources(request(), res); await getIncomeSource(request({}, { id: uuid }), res); await createIncomeSource(request({ name: "Salary", isSalary: true }), res); await updateIncomeSource(request({ name: "Pay" }, { id: uuid }), res); await deactivateIncomeSource(request({}, { id: uuid }), res);
    expect(res.json).toHaveBeenCalled();
  });
});

describe("category and subcategory controller CRUD", () => {
  it("covers category CRUD", async () => {
    jest.spyOn(prisma.category, "findMany").mockResolvedValue([category]);
    jest.spyOn(prisma.category, "findFirst").mockResolvedValue(category);
    jest.spyOn(prisma.category, "create").mockResolvedValue(category);
    jest.spyOn(prisma.category, "update").mockResolvedValue(category);
    jest.spyOn(prisma.subcategory, "updateMany").mockResolvedValue({ count: 1 });
    const res = response();
    await createCategory(request({ name: "Food", categoryType: "EXPENSE" }), res); await getCategory(request({}, { id: uuid }), res); await updateCategory(request({ name: "Meals" }, { id: uuid }), res); await deactivateCategory(request({}, { id: uuid }), res);
    expect(res.status).toHaveBeenCalled();
  });

  it("covers subcategory CRUD", async () => {
    jest.spyOn(prisma.category, "findFirst").mockResolvedValue(category);
    jest.spyOn(prisma.subcategory, "findMany").mockResolvedValue([subcategory]);
    jest.spyOn(prisma.subcategory, "findFirst").mockResolvedValue(subcategory);
    jest.spyOn(prisma.subcategory, "create").mockResolvedValue(subcategory);
    jest.spyOn(prisma.subcategory, "update").mockResolvedValue(subcategory);
    const res = response();
    await listSubcategories(request({}, { categoryId: uuid }), res); await createSubcategory(request({ name: "Groceries" }, { categoryId: uuid }), res); await getSubcategory(request({}, { id: uuid }), res); await updateSubcategory(request({ name: "Food" }, { id: uuid }), res); await deactivateSubcategory(request({}, { id: uuid }), res);
    expect(res.json).toHaveBeenCalled();
  });
});

describe("transaction controller CRUD", () => {
  it("covers create, get, update, and delete", async () => {
    jest.spyOn(prisma.account, "findFirst").mockResolvedValue(account as never);
    jest.spyOn(prisma.category, "findFirst").mockResolvedValue(category);
    jest.spyOn(prisma.subcategory, "findFirst").mockResolvedValue(subcategory);
    jest.spyOn(prisma.transaction, "create").mockResolvedValue(transaction as never);
    jest.spyOn(prisma.transaction, "findFirst").mockResolvedValue(transaction as never);
    jest.spyOn(prisma.transaction, "update").mockResolvedValue(transaction as never);
    jest.spyOn(prisma.transaction, "delete").mockResolvedValue(transaction as never);
    const res = response();
    const body = { transactionType: "EXPENSE", amount: 100, categoryId: uuid, subcategoryId: uuid, accountId: uuid, transactionDate: new Date() };
    await createTransaction(request(body), res); await getTransaction(request({}, { id: uuid }), res); await updateTransaction(request({ description: "Lunch" }, { id: uuid }), res); await deleteTransaction(request({}, { id: uuid }), res);
    expect(res.status).toHaveBeenCalled();
  });
});