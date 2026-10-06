import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateTemplateInput, CreateTemplateItemInput, UpdateTemplateInput, UpdateTemplateItemInput } from "./budget-templates.schemas.js";

function owner(req: Request): string {
  if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  return req.auth.userId;
}

function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") throw new AppError(400, "VALIDATION_ERROR", `${name} is required`);
  return value;
}

async function getOwnedTemplate(req: Request) {
  const template = await prisma.budgetTemplate.findFirst({
    where: { id: param(req, "id"), userId: owner(req) },
  });
  if (!template) throw new AppError(404, "BUDGET_TEMPLATE_NOT_FOUND", "Budget template was not found");
  return template;
}

async function totalPercentage(templateId: string): Promise<Prisma.Decimal> {
  const items = await prisma.budgetTemplateItem.findMany({ where: { budgetTemplateId: templateId } });
  return items.reduce((total, item) => total.add(item.percentage), new Prisma.Decimal(0));
}

function assertOneHundred(total: Prisma.Decimal): void {
  if (!total.eq(100)) {
    throw new AppError(400, "INVALID_ALLOCATION", `Template allocation must total 100%. Current total: ${total.toFixed(2)}%`);
  }
}

async function assertCategory(ownerId: string, categoryId: string): Promise<void> {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId: ownerId, isActive: true } });
  if (!category) throw new AppError(400, "INVALID_CATEGORY", "Category was not found");
}

export async function listTemplates(req: Request, res: Response): Promise<void> {
  const templates = await prisma.budgetTemplate.findMany({
    where: { userId: owner(req), isActive: true },
    include: { items: true },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: templates });
}

export async function getTemplate(req: Request, res: Response): Promise<void> {
  const template = await prisma.budgetTemplate.findFirst({
    where: { id: param(req, "id"), userId: owner(req) },
    include: { items: { include: { category: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!template) throw new AppError(404, "BUDGET_TEMPLATE_NOT_FOUND", "Budget template was not found");
  res.json({ success: true, data: template });
}

export async function createTemplate(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateTemplateInput;
  if (input.isActive) throw new AppError(400, "INVALID_ALLOCATION", "Add allocation items totaling 100% before activating the template");
  const template = await prisma.budgetTemplate.create({ data: { ...input, userId: owner(req) } });
  res.status(201).json({ success: true, data: template, message: "Budget template created successfully" });
}

export async function updateTemplate(req: Request, res: Response): Promise<void> {
  const template = await getOwnedTemplate(req);
  const input = req.body as UpdateTemplateInput;
  if (input.isActive === true) assertOneHundred(await totalPercentage(template.id));
  const updated = await prisma.budgetTemplate.update({ where: { id: template.id }, data: input });
  res.json({ success: true, data: updated, message: "Budget template updated successfully" });
}

export async function deactivateTemplate(req: Request, res: Response): Promise<void> {
  const template = await getOwnedTemplate(req);
  await prisma.budgetTemplate.update({ where: { id: template.id }, data: { isActive: false } });
  res.status(204).send();
}

export async function addTemplateItem(req: Request, res: Response): Promise<void> {
  const template = await getOwnedTemplate(req);
  const input = req.body as CreateTemplateItemInput;
  await assertCategory(owner(req), input.categoryId);
  const item = await prisma.budgetTemplateItem.create({ data: { ...input, budgetTemplateId: template.id } });
  res.status(201).json({ success: true, data: item, message: "Budget template item added successfully" });
}

export async function updateTemplateItem(req: Request, res: Response): Promise<void> {
  const template = await getOwnedTemplate(req);
  const itemId = param(req, "itemId");
  const item = await prisma.budgetTemplateItem.findFirst({ where: { id: itemId, budgetTemplateId: template.id } });
  if (!item) throw new AppError(404, "BUDGET_TEMPLATE_ITEM_NOT_FOUND", "Budget template item was not found");
  const updated = await prisma.budgetTemplateItem.update({ where: { id: item.id }, data: req.body as UpdateTemplateItemInput });
  res.json({ success: true, data: updated, message: "Budget template item updated successfully" });
}

export async function deleteTemplateItem(req: Request, res: Response): Promise<void> {
  const template = await getOwnedTemplate(req);
  const itemId = param(req, "itemId");
  const item = await prisma.budgetTemplateItem.findFirst({ where: { id: itemId, budgetTemplateId: template.id } });
  if (!item) throw new AppError(404, "BUDGET_TEMPLATE_ITEM_NOT_FOUND", "Budget template item was not found");
  await prisma.budgetTemplateItem.delete({ where: { id: item.id } });
  res.status(204).send();
}

export async function validateTemplate(req: Request, res: Response): Promise<void> {
  const template = await getOwnedTemplate(req);
  const total = await totalPercentage(template.id);
  res.json({ success: true, data: { valid: total.eq(100), totalPercentage: total.toFixed(2) } });
}