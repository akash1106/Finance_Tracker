"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoriesApi } from "@/lib/api/categories.api";
import { queryKeys } from "@/lib/query/query-keys";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateSubcategoryInput,
} from "@/types/category";

export function useCategories(type?: string) {
  return useQuery({
    queryKey: queryKeys.categories.all(type),
    queryFn: () => categoriesApi.list(type),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoriesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useSubcategories(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.categories.subcategories(categoryId),
    queryFn: () => categoriesApi.listSubcategories(categoryId),
    enabled: Boolean(categoryId),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      toast.success("Category updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
}

export function useCreateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: CreateSubcategoryInput;
    }) => categoriesApi.createSubcategory(categoryId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.subcategories(variables.categoryId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      toast.success("Subcategory added");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add subcategory");
    },
  });
}
