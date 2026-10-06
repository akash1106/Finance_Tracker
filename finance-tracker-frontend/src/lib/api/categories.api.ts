import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type {
  Category,
  Subcategory,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateSubcategoryInput,
  UpdateSubcategoryInput,
} from "@/types/category";

export const categoriesApi = {
  list: (type?: string) => apiGet<Category[]>("/categories", { params: { type } }),
  getById: (id: string) => apiGet<Category>(`/categories/${id}`),
  create: (data: CreateCategoryInput) => apiPost<Category>("/categories", data),
  update: (id: string, data: UpdateCategoryInput) => apiPatch<Category>(`/categories/${id}`, data),
  deactivate: (id: string) => apiDelete<void>(`/categories/${id}`),

  // Subcategories
  listSubcategories: (categoryId: string) =>
    apiGet<Subcategory[]>(`/categories/${categoryId}/subcategories`),
  createSubcategory: (categoryId: string, data: CreateSubcategoryInput) =>
    apiPost<Subcategory>(`/categories/${categoryId}/subcategories`, data),
  updateSubcategory: (subcategoryId: string, data: UpdateSubcategoryInput) =>
    apiPatch<Subcategory>(`/subcategories/${subcategoryId}`, data),
  deactivateSubcategory: (subcategoryId: string) =>
    apiDelete<void>(`/subcategories/${subcategoryId}`),
};
