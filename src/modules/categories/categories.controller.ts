import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { CategoryQuery, CreateCategoryInput, CreateSubcategoryInput, UpdateCategoryInput, UpdateSubcategoryInput } from "./categories.schemas.js";

function owner(req: Request): string {
  if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  return req.auth.userId;
}
function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") throw new AppError(400, "VALIDATION_ERROR", `${name} is required`);
  return value;
}

export async function listCategories(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as CategoryQuery;
  const categories = await prisma.category.findMany({
    where: { userId: owner(req), ...(query.type ? { categoryType: query.type } : {}), ...(query.includeInactive ? {} : { isActive: true }) },
    include: { subcategories: { where: query.includeInactive ? undefined : { isActive: true }, orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: categories });
}

export async function getCategory(req: Request, res: Response): Promise<void> {
  const category = await prisma.category.findFirst({
    where: { id: param(req, "id"), userId: owner(req) },
    include: { subcategories: { where: { isActive: true }, orderBy: { name: "asc" } } },
  });
  if (!category) throw new AppError(404, "CATEGORY_NOT_FOUND", "Category was not found");
  res.json({ success: true, data: category });
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const category = await prisma.category.create({ data: { ...(req.body as CreateCategoryInput), userId: owner(req) } });
  res.status(201).json({ success: true, data: category, message: "Category created successfully" });
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  const categoryId = param(req, "id");
  const existing = await prisma.category.findFirst({ where: { id: categoryId, userId: owner(req) } });
  if (!existing) throw new AppError(404, "CATEGORY_NOT_FOUND", "Category was not found");
  const category = await prisma.category.update({ where: { id: categoryId }, data: req.body as UpdateCategoryInput });
  res.json({ success: true, data: category, message: "Category updated successfully" });
}

export async function deactivateCategory(req: Request, res: Response): Promise<void> {
  const categoryId = param(req, "id");
  const existing = await prisma.category.findFirst({ where: { id: categoryId, userId: owner(req) } });
  if (!existing) throw new AppError(404, "CATEGORY_NOT_FOUND", "Category was not found");
  await prisma.category.update({ where: { id: categoryId }, data: { isActive: false } });
  await prisma.subcategory.updateMany({ where: { categoryId }, data: { isActive: false } });
  res.status(204).send();
}

async function assertCategory(categoryId: string, userId: string): Promise<void> {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId, isActive: true } });
  if (!category) throw new AppError(404, "CATEGORY_NOT_FOUND", "Category was not found");
}

export async function listSubcategories(req: Request, res: Response): Promise<void> {
  const categoryId = param(req, "categoryId");
  await assertCategory(categoryId, owner(req));
  const subcategories = await prisma.subcategory.findMany({ where: { categoryId, isActive: true }, orderBy: { name: "asc" } });
  res.json({ success: true, data: subcategories });
}

export async function getSubcategory(req: Request, res: Response): Promise<void> {
  const subcategory = await prisma.subcategory.findFirst({ where: { id: param(req, "id"), category: { userId: owner(req) } } });
  if (!subcategory) throw new AppError(404, "SUBCATEGORY_NOT_FOUND", "Subcategory was not found");
  res.json({ success: true, data: subcategory });
}

export async function createSubcategory(req: Request, res: Response): Promise<void> {
  const categoryId = param(req, "categoryId");
  await assertCategory(categoryId, owner(req));
  const subcategory = await prisma.subcategory.create({ data: { ...(req.body as CreateSubcategoryInput), categoryId } });
  res.status(201).json({ success: true, data: subcategory, message: "Subcategory created successfully" });
}

export async function updateSubcategory(req: Request, res: Response): Promise<void> {
  const subcategoryId = param(req, "id");
  const existing = await prisma.subcategory.findFirst({ where: { id: subcategoryId, category: { userId: owner(req) } } });
  if (!existing) throw new AppError(404, "SUBCATEGORY_NOT_FOUND", "Subcategory was not found");
  const subcategory = await prisma.subcategory.update({ where: { id: subcategoryId }, data: req.body as UpdateSubcategoryInput });
  res.json({ success: true, data: subcategory, message: "Subcategory updated successfully" });
}

export async function deactivateSubcategory(req: Request, res: Response): Promise<void> {
  const subcategoryId = param(req, "id");
  const existing = await prisma.subcategory.findFirst({ where: { id: subcategoryId, category: { userId: owner(req) } } });
  if (!existing) throw new AppError(404, "SUBCATEGORY_NOT_FOUND", "Subcategory was not found");
  await prisma.subcategory.update({ where: { id: subcategoryId }, data: { isActive: false } });
  res.status(204).send();
}