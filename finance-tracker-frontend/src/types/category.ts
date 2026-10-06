export type CategoryType = "EXPENSE" | "INCOME" | "SAVINGS" | "INVESTMENT";

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  categoryType: CategoryType | string;
  description?: string | null;
  isActive: boolean;
  subcategories?: Subcategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  categoryType: CategoryType | string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  categoryType?: CategoryType | string;
  description?: string;
  isActive?: boolean;
}

export interface CreateSubcategoryInput {
  name: string;
  description?: string;
}

export interface UpdateSubcategoryInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}
