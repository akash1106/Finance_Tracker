"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FolderTree,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  ExternalLink,
  Layers,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Skeleton,
  EmptyState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeactivateCategory,
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeactivateSubcategory,
} from "@/hooks/use-categories";
import {
  categorySchema,
  subcategorySchema,
  type CategoryFormData,
  type SubcategoryFormData,
} from "@/schemas/category.schema";
import type { Category, Subcategory, CategoryType } from "@/types/category";

const TYPE_CONFIG: Record<
  string,
  { label: string; badgeVariant: "default" | "secondary" | "destructive" | "outline"; colorClass: string; icon: React.ElementType }
> = {
  EXPENSE: {
    label: "Expense",
    badgeVariant: "destructive",
    colorClass: "text-rose-500 bg-rose-500/10 border-rose-200 dark:border-rose-900",
    icon: ArrowDownRight,
  },
  INCOME: {
    label: "Income",
    badgeVariant: "default",
    colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-200 dark:border-emerald-900",
    icon: ArrowUpRight,
  },
  SAVING: {
    label: "Savings",
    badgeVariant: "secondary",
    colorClass: "text-blue-500 bg-blue-500/10 border-blue-200 dark:border-blue-900",
    icon: PiggyBank,
  },
  SAVINGS: {
    label: "Savings",
    badgeVariant: "secondary",
    colorClass: "text-blue-500 bg-blue-500/10 border-blue-200 dark:border-blue-900",
    icon: PiggyBank,
  },
  INVESTMENT: {
    label: "Investment",
    badgeVariant: "outline",
    colorClass: "text-purple-500 bg-purple-500/10 border-purple-200 dark:border-purple-900",
    icon: TrendingUp,
  },
};

export default function CategoriesPage() {
  const [selectedTypeTab, setSelectedTypeTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Dialog State: Category
  const [categoryModalState, setCategoryModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    category?: Category;
  }>({ isOpen: false, mode: "create" });

  // Dialog State: Subcategory
  const [subcategoryModalState, setSubcategoryModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    parentCategory?: Category;
    subcategory?: Subcategory;
  }>({ isOpen: false, mode: "create" });

  // Deactivate confirmation states
  const [deactivatingCategory, setDeactivatingCategory] = useState<Category | null>(null);
  const [deactivatingSubcategory, setDeactivatingSubcategory] = useState<Subcategory | null>(null);

  // Queries & Mutations
  const { data: categories = [], isLoading, isError } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deactivateCategoryMutation = useDeactivateCategory();

  const createSubcategoryMutation = useCreateSubcategory();
  const updateSubcategoryMutation = useUpdateSubcategory();
  const deactivateSubcategoryMutation = useDeactivateSubcategory();

  // Category Form
  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      categoryType: "EXPENSE",
      description: "",
    },
  });

  // Subcategory Form
  const subcategoryForm = useForm<SubcategoryFormData>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Expand / collapse toggle
  const toggleExpand = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    categories.forEach((cat) => {
      allExpanded[cat.id] = true;
    });
    setExpandedCategories(allExpanded);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  // Open Category Modal
  const openCreateCategory = () => {
    const defaultType: "EXPENSE" | "INCOME" | "SAVING" | "INVESTMENT" =
      selectedTypeTab === "INCOME"
        ? "INCOME"
        : selectedTypeTab === "SAVING" || selectedTypeTab === "SAVINGS"
        ? "SAVING"
        : selectedTypeTab === "INVESTMENT"
        ? "INVESTMENT"
        : "EXPENSE";

    categoryForm.reset({
      name: "",
      categoryType: defaultType,
      description: "",
    });
    setCategoryModalState({ isOpen: true, mode: "create" });
  };

  const openEditCategory = (cat: Category) => {
    const editType: "EXPENSE" | "INCOME" | "SAVING" | "INVESTMENT" =
      cat.categoryType === "INCOME"
        ? "INCOME"
        : cat.categoryType === "SAVING" || cat.categoryType === "SAVINGS"
        ? "SAVING"
        : cat.categoryType === "INVESTMENT"
        ? "INVESTMENT"
        : "EXPENSE";

    categoryForm.reset({
      name: cat.name,
      categoryType: editType,
      description: cat.description || "",
    });
    setCategoryModalState({ isOpen: true, mode: "edit", category: cat });
  };

  // Open Subcategory Modal
  const openCreateSubcategory = (parent: Category) => {
    subcategoryForm.reset({
      name: "",
      description: "",
    });
    setSubcategoryModalState({
      isOpen: true,
      mode: "create",
      parentCategory: parent,
    });
  };

  const openEditSubcategory = (parent: Category, sub: Subcategory) => {
    subcategoryForm.reset({
      name: sub.name,
      description: sub.description || "",
    });
    setSubcategoryModalState({
      isOpen: true,
      mode: "edit",
      parentCategory: parent,
      subcategory: sub,
    });
  };

  // Submit Category Form
  const onCategorySubmit = async (values: CategoryFormData) => {
    if (categoryModalState.mode === "create") {
      await createCategoryMutation.mutateAsync({
        name: values.name,
        categoryType: values.categoryType,
        description: values.description || undefined,
      });
    } else if (categoryModalState.category) {
      await updateCategoryMutation.mutateAsync({
        id: categoryModalState.category.id,
        data: {
          name: values.name,
          categoryType: values.categoryType,
          description: values.description || undefined,
        },
      });
    }
    setCategoryModalState({ isOpen: false, mode: "create" });
  };

  // Submit Subcategory Form
  const onSubcategorySubmit = async (values: SubcategoryFormData) => {
    if (subcategoryModalState.mode === "create" && subcategoryModalState.parentCategory) {
      await createSubcategoryMutation.mutateAsync({
        categoryId: subcategoryModalState.parentCategory.id,
        data: {
          name: values.name,
          description: values.description || undefined,
        },
      });
      // Auto expand parent
      setExpandedCategories((prev) => ({
        ...prev,
        [subcategoryModalState.parentCategory!.id]: true,
      }));
    } else if (subcategoryModalState.subcategory) {
      await updateSubcategoryMutation.mutateAsync({
        subcategoryId: subcategoryModalState.subcategory.id,
        data: {
          name: values.name,
          description: values.description || undefined,
        },
      });
    }
    setSubcategoryModalState({ isOpen: false, mode: "create" });
  };

  // Confirm Deactivations
  const handleConfirmDeactivateCategory = async () => {
    if (!deactivatingCategory) return;
    await deactivateCategoryMutation.mutateAsync(deactivatingCategory.id);
    setDeactivatingCategory(null);
  };

  const handleConfirmDeactivateSubcategory = async () => {
    if (!deactivatingSubcategory) return;
    await deactivateSubcategoryMutation.mutateAsync(deactivatingSubcategory.id);
    setDeactivatingSubcategory(null);
  };

  // Filtering
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Filter by type
      if (selectedTypeTab !== "ALL") {
        const normalizedCatType = cat.categoryType === "SAVINGS" ? "SAVING" : cat.categoryType;
        const normalizedTab = selectedTypeTab === "SAVINGS" ? "SAVING" : selectedTypeTab;
        if (normalizedCatType !== normalizedTab) return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesCat =
          cat.name.toLowerCase().includes(query) ||
          Boolean(cat.description?.toLowerCase().includes(query));
        const matchesSub = cat.subcategories?.some((s) =>
          s.name.toLowerCase().includes(query)
        );
        return matchesCat || matchesSub;
      }

      return true;
    });
  }, [categories, selectedTypeTab, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalSubcategories = 0;
    let expenseCount = 0;
    let incomeCount = 0;
    let savingsCount = 0;
    let investmentCount = 0;

    categories.forEach((c) => {
      totalSubcategories += c.subcategories?.length || 0;
      const type = c.categoryType === "SAVINGS" ? "SAVING" : c.categoryType;
      if (type === "EXPENSE") expenseCount++;
      if (type === "INCOME") incomeCount++;
      if (type === "SAVING") savingsCount++;
      if (type === "INVESTMENT") investmentCount++;
    });

    return {
      totalCategories: categories.length,
      totalSubcategories,
      expenseCount,
      incomeCount,
      savingsCount,
      investmentCount,
    };
  }, [categories]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Hierarchy"
        description="Structure and manage two-tier categories and subcategories for granular tracking"
      >
        <Button onClick={openCreateCategory} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Root Categories</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <FolderTree className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {metrics.totalCategories}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Top-level buckets</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Subcategories</span>
            <div className="h-8 w-8 rounded-full bg-secondary/30 text-secondary-foreground flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {metrics.totalSubcategories}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Granular sub-labels</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Expense Categories</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {metrics.expenseCount}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Budgeted expense groups</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Income & Wealth</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {metrics.incomeCount + metrics.savingsCount + metrics.investmentCount}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Income, saving & investment</p>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 border-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "All Categories" },
              { id: "EXPENSE", label: "Expenses" },
              { id: "INCOME", label: "Income" },
              { id: "SAVING", label: "Savings" },
              { id: "INVESTMENT", label: "Investments" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTypeTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
                  selectedTypeTab === tab.id
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-background text-muted-foreground border-input hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="text-xs h-9 px-3"
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="text-xs h-9 px-3"
            >
              Collapse All
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Input
          placeholder="Search categories or subcategories by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
          className="h-9 text-xs"
        />
      </Card>

      {/* Categories Hierarchy List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center text-sm text-destructive border-destructive/20">
          Failed to load category hierarchy. Please check your backend connection.
        </Card>
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories found"
          description={
            searchQuery.trim() || selectedTypeTab !== "ALL"
              ? "No categories match the current filter or search criteria."
              : "Organize your transactions into structured groups. Create your first category to begin."
          }
          action={
            <Button onClick={openCreateCategory} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredCategories.map((category) => {
            const isExpanded = Boolean(expandedCategories[category.id]);
            const config = TYPE_CONFIG[category.categoryType] || TYPE_CONFIG.EXPENSE;
            const IconComponent = config.icon;
            const subcategories = category.subcategories || [];

            return (
              <Card
                key={category.id}
                className="border-border overflow-hidden transition-all duration-200"
              >
                {/* Category Header Row */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card hover:bg-muted/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleExpand(category.id)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors cursor-pointer"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center border shrink-0 ${config.colorClass}`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/categories/${category.id}`}
                          className="font-semibold text-foreground text-sm hover:underline hover:text-primary transition-colors truncate"
                        >
                          {category.name}
                        </Link>
                        <Badge variant={config.badgeVariant} className="text-[10px] uppercase">
                          {config.label}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {subcategories.length}{" "}
                          {subcategories.length === 1 ? "subcategory" : "subcategories"}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCreateSubcategory(category)}
                      className="text-xs h-8 px-2.5 gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Subcategory
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditCategory(category)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Edit Category"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    <Link href={`/categories/${category.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        title="View Category Details"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeactivatingCategory(category)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      title="Deactivate Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Subcategories Accordion Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-muted/15 border-t border-border space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pt-2">
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        Subcategories for {category.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => openCreateSubcategory(category)}
                        className="text-primary hover:underline font-medium text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Add subcategory
                      </button>
                    </div>

                    {subcategories.length === 0 ? (
                      <div className="p-4 rounded-lg border border-dashed border-border bg-card/40 text-center">
                        <p className="text-xs text-muted-foreground mb-2">
                          No subcategories configured for {category.name}.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCreateSubcategory(category)}
                          className="text-xs h-7 gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add First Subcategory
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between gap-2 hover:border-primary/40 transition-colors"
                          >
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-foreground truncate block">
                                {sub.name}
                              </span>
                              {sub.description && (
                                <span className="text-[11px] text-muted-foreground truncate block">
                                  {sub.description}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditSubcategory(category, sub)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                title="Edit Subcategory"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeactivatingSubcategory(sub)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                title="Deactivate Subcategory"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Category Creation / Edit Dialog */}
      <Dialog
        open={categoryModalState.isOpen}
        onOpenChange={(open) =>
          !open && setCategoryModalState({ isOpen: false, mode: "create" })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {categoryModalState.mode === "create" ? "Create Category" : "Edit Category"}
            </DialogTitle>
            <DialogDescription>
              {categoryModalState.mode === "create"
                ? "Add a new top-level classification bucket."
                : "Update your category details and attributes."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={categoryForm.handleSubmit(onCategorySubmit)}
            className="space-y-4 py-2"
          >
            <Input
              label="Category Name"
              placeholder="e.g. Food & Dining, Utilities, Freelance"
              error={categoryForm.formState.errors.name?.message}
              {...categoryForm.register("name")}
            />

            <Select
              label="Category Type"
              value={categoryForm.watch("categoryType")}
              onChange={(e) =>
                categoryForm.setValue(
                  "categoryType",
                  e.target.value as "EXPENSE" | "INCOME" | "SAVING" | "INVESTMENT"
                )
              }
              error={categoryForm.formState.errors.categoryType?.message}
              options={[
                { value: "EXPENSE", label: "Expense (Spending & Outflows)" },
                { value: "INCOME", label: "Income (Earnings & Inflows)" },
                { value: "SAVING", label: "Savings (Emergency Fund, Liquid Reserves)" },
                { value: "INVESTMENT", label: "Investment (Stocks, MF, Real Estate)" },
              ]}
            />

            <Textarea
              label="Description (Optional)"
              placeholder="Brief description of transactions classified under this category..."
              rows={3}
              error={categoryForm.formState.errors.description?.message}
              {...categoryForm.register("description")}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryModalState({ isOpen: false, mode: "create" })}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createCategoryMutation.isPending || updateCategoryMutation.isPending
                }
              >
                {categoryModalState.mode === "create" ? "Create Category" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Subcategory Creation / Edit Dialog */}
      <Dialog
        open={subcategoryModalState.isOpen}
        onOpenChange={(open) =>
          !open && setSubcategoryModalState({ isOpen: false, mode: "create" })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {subcategoryModalState.mode === "create"
                ? "Add Subcategory"
                : "Edit Subcategory"}
            </DialogTitle>
            <DialogDescription>
              {subcategoryModalState.parentCategory
                ? `Parent Category: ${subcategoryModalState.parentCategory.name}`
                : "Configure subcategory specifics."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={subcategoryForm.handleSubmit(onSubcategorySubmit)}
            className="space-y-4 py-2"
          >
            <Input
              label="Subcategory Name"
              placeholder="e.g. Groceries, Coffee, Fast Food"
              error={subcategoryForm.formState.errors.name?.message}
              {...subcategoryForm.register("name")}
            />

            <Input
              label="Description (Optional)"
              placeholder="Optional detail or merchant examples"
              error={subcategoryForm.formState.errors.description?.message}
              {...subcategoryForm.register("description")}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setSubcategoryModalState({ isOpen: false, mode: "create" })
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createSubcategoryMutation.isPending ||
                  updateSubcategoryMutation.isPending
                }
              >
                {subcategoryModalState.mode === "create"
                  ? "Add Subcategory"
                  : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Deactivate Category Dialog */}
      <Dialog
        open={Boolean(deactivatingCategory)}
        onOpenChange={(open) => !open && setDeactivatingCategory(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-destructive">Deactivate Category</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to deactivate{" "}
              <strong className="text-foreground">{deactivatingCategory?.name}</strong>?
              This will also deactivate all its subcategories and hide them from selection menus.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeactivatingCategory(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeactivateCategory}
              disabled={deactivateCategoryMutation.isPending}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Deactivate Subcategory Dialog */}
      <Dialog
        open={Boolean(deactivatingSubcategory)}
        onOpenChange={(open) => !open && setDeactivatingSubcategory(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-destructive">Deactivate Subcategory</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to deactivate{" "}
              <strong className="text-foreground">
                {deactivatingSubcategory?.name}
              </strong>
              ? It will no longer appear as an active subcategory option.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeactivatingSubcategory(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeactivateSubcategory}
              disabled={deactivateSubcategoryMutation.isPending}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
