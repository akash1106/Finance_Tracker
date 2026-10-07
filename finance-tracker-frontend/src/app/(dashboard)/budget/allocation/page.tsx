"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  PieChart,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  IndianRupee,
  Sparkles,
  RotateCcw,
  Save,
  Sliders,
  FolderTree,
  ShieldCheck,
  TrendingUp,
  PiggyBank,
  ArrowDownRight,
  HelpCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Input,
  Select,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Skeleton,
  EmptyState,
} from "@/components/ui";
import { useCategories } from "@/hooks/use-categories";
import { useBudgetTemplates } from "@/hooks/use-budget";
import { budgetApi } from "@/lib/api/budget.api";
import { queryKeys } from "@/lib/query/query-keys";
import { formatCurrency } from "@/lib/formatters/currency";
import { toast } from "sonner";
import type { Category } from "@/types/category";

interface AllocationRow {
  id: string; // local temp key or item id
  categoryId: string;
  percentage: number;
  amount?: number | string;
}

const TYPE_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  EXPENSE: { label: "Expense", variant: "destructive" },
  INCOME: { label: "Income", variant: "default" },
  SAVING: { label: "Savings", variant: "secondary" },
  SAVINGS: { label: "Savings", variant: "secondary" },
  INVESTMENT: { label: "Investment", variant: "outline" },
};

export default function SalaryAllocationPage() {
  const queryClient = useQueryClient();

  // Queries
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: templates = [], isLoading: isLoadingTemplates } = useBudgetTemplates();

  // Active / Selected Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("NEW");
  const [templateName, setTemplateName] = useState<string>("Primary Salary Allocation");
  const [templateDescription, setTemplateDescription] = useState<string>(
    "Monthly zero-based budget distribution across core living, savings, and investment categories"
  );

  // Simulation Monthly Salary
  const [simulationSalary, setSimulationSalary] = useState<number>(75000);

  // Allocation Rows State
  const [rows, setRows] = useState<AllocationRow[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initial sensible default setup
  const initializeDefaultRows = (cats: Category[]) => {
    if (cats.length === 0) return;

    const makeRow = (id: string, categoryId: string, percentage: number): AllocationRow => ({
      id,
      categoryId,
      percentage,
      amount: simulationSalary > 0 ? Math.round((percentage / 100) * simulationSalary) : 0,
    });

    // Pick up to 5 categories and distribute percentages
    const sampleCats = cats.slice(0, Math.min(cats.length, 5));
    if (sampleCats.length === 1) {
      setRows([makeRow("row-1", sampleCats[0].id, 100)]);
    } else if (sampleCats.length === 2) {
      setRows([
        makeRow("row-1", sampleCats[0].id, 60),
        makeRow("row-2", sampleCats[1].id, 40),
      ]);
    } else if (sampleCats.length === 3) {
      setRows([
        makeRow("row-1", sampleCats[0].id, 50),
        makeRow("row-2", sampleCats[1].id, 30),
        makeRow("row-3", sampleCats[2].id, 20),
      ]);
    } else if (sampleCats.length === 4) {
      setRows([
        makeRow("row-1", sampleCats[0].id, 40),
        makeRow("row-2", sampleCats[1].id, 30),
        makeRow("row-3", sampleCats[2].id, 20),
        makeRow("row-4", sampleCats[3].id, 10),
      ]);
    } else {
      setRows([
        makeRow("row-1", sampleCats[0].id, 35),
        makeRow("row-2", sampleCats[1].id, 25),
        makeRow("row-3", sampleCats[2].id, 20),
        makeRow("row-4", sampleCats[3].id, 10),
        makeRow("row-5", sampleCats[4].id, 10),
      ]);
    }
  };

  // Populate rows when templates load or user selects an existing template
  useEffect(() => {
    if (selectedTemplateId === "NEW") {
      // If categories are available and rows are empty, set initial sensible defaults
      if (categories.length > 0 && rows.length === 0) {
        initializeDefaultRows(categories);
      }
    } else {
      const found = templates.find((t) => t.id === selectedTemplateId);
      if (found) {
        setTemplateName(found.name);
        setTemplateDescription(found.description || "");
        if (found.items && found.items.length > 0) {
          setRows(
            found.items.map((item) => {
              const pct = Number(item.percentage) || 0;
              return {
                id: item.id,
                categoryId: item.categoryId,
                percentage: pct,
                amount: simulationSalary > 0 ? Math.round((pct / 100) * simulationSalary) : 0,
              };
            })
          );
        } else {
          setRows([]);
        }
      }
    }
  }, [selectedTemplateId, templates, categories]);

  // Preset Handlers
  const applyPreset = (presetName: "50-30-20" | "balanced" | "fire") => {
    if (categories.length === 0) return;

    // Separate categories by type
    const expenses = categories.filter((c) => c.categoryType === "EXPENSE");
    const savings = categories.filter(
      (c) => c.categoryType === "SAVING" || c.categoryType === "SAVINGS"
    );
    const investments = categories.filter((c) => c.categoryType === "INVESTMENT");

    if (presetName === "50-30-20") {
      // 50% Needs, 30% Wants, 20% Savings
      const rowsToSet: AllocationRow[] = [];
      if (expenses[0]) rowsToSet.push({ id: `preset-1`, categoryId: expenses[0].id, percentage: 50 });
      if (expenses[1]) {
        rowsToSet.push({ id: `preset-2`, categoryId: expenses[1].id, percentage: 30 });
      }
      if (savings[0]) {
        rowsToSet.push({ id: `preset-3`, categoryId: savings[0].id, percentage: 20 });
      } else if (investments[0]) {
        rowsToSet.push({ id: `preset-3`, categoryId: investments[0].id, percentage: 20 });
      } else if (categories[2]) {
        rowsToSet.push({ id: `preset-3`, categoryId: categories[2].id, percentage: 20 });
      }

      // If rows don't sum to 100 due to missing categories, fallback to generic
      const sum = rowsToSet.reduce((acc, r) => acc + r.percentage, 0);
      if (sum !== 100 && categories.length > 0) {
        initializeDefaultRows(categories);
        toast.info("Applied balanced allocation based on your available categories");
        return;
      }

      setRows(
        rowsToSet.map((r) => ({
          ...r,
          amount: simulationSalary > 0 ? Math.round((r.percentage / 100) * simulationSalary) : 0,
        }))
      );
      toast.success("Applied 50/30/20 Rule blueprint");
    } else if (presetName === "fire") {
      // 30% Living, 50% Wealth (Savings/Investments), 20% Flexible
      const rowsToSet: AllocationRow[] = [];
      if (expenses[0]) rowsToSet.push({ id: `fire-1`, categoryId: expenses[0].id, percentage: 30 });
      if (investments[0]) {
        rowsToSet.push({ id: `fire-2`, categoryId: investments[0].id, percentage: 30 });
      } else if (savings[0]) {
        rowsToSet.push({ id: `fire-2`, categoryId: savings[0].id, percentage: 30 });
      }
      if (savings[0] && investments[0]) {
        rowsToSet.push({ id: `fire-3`, categoryId: savings[0].id, percentage: 20 });
      } else if (expenses[1]) {
        rowsToSet.push({ id: `fire-3`, categoryId: expenses[1].id, percentage: 20 });
      }
      if (expenses[1] && expenses[1].id !== rowsToSet[2]?.categoryId) {
        rowsToSet.push({ id: `fire-4`, categoryId: expenses[1].id, percentage: 20 });
      } else if (expenses[2]) {
        rowsToSet.push({ id: `fire-4`, categoryId: expenses[2].id, percentage: 20 });
      }

      const sum = rowsToSet.reduce((acc, r) => acc + r.percentage, 0);
      if (sum !== 100 && categories.length > 0) {
        initializeDefaultRows(categories);
        return;
      }
      setRows(
        rowsToSet.map((r) => ({
          ...r,
          amount: simulationSalary > 0 ? Math.round((r.percentage / 100) * simulationSalary) : 0,
        }))
      );
      toast.success("Applied Aggressive FIRE Growth blueprint");
    } else {
      initializeDefaultRows(categories);
      toast.success("Applied Balanced Zero-Based blueprint");
    }
  };

  // Add Row
  const handleAddRow = () => {
    // Pick first category that is not yet selected, or default to first category
    const usedCatIds = new Set(rows.map((r) => r.categoryId));
    const availableCat = categories.find((c) => !usedCatIds.has(c.id)) || categories[0];
    if (!availableCat) return;

    const remaining = Math.max(0, 100 - totalPercentage);
    const newPercentage = remaining > 0 ? remaining : 5;

    setRows([
      ...rows,
      {
        id: `row-${Date.now()}`,
        categoryId: availableCat.id,
        percentage: newPercentage,
        amount: simulationSalary > 0 ? Math.round((newPercentage / 100) * simulationSalary) : 0,
      },
    ]);
  };

  // Remove Row
  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // Update Category in Row
  const handleCategoryChange = (index: number, newCategoryId: string) => {
    const updated = [...rows];
    updated[index].categoryId = newCategoryId;
    setRows(updated);
  };

  // Update Percentage in Row (vice versa: automatically syncs money amount)
  const handlePercentageChange = (index: number, val: number | string) => {
    const updated = [...rows];
    if (val === "" || val === undefined) {
      updated[index].percentage = 0;
      updated[index].amount = 0;
    } else {
      const num = typeof val === "string" ? parseFloat(val) : val;
      const clamped = Math.max(0, Math.min(100, Math.round(num * 100) / 100));
      const finalPct = isNaN(clamped) ? 0 : clamped;
      updated[index].percentage = finalPct;
      updated[index].amount =
        simulationSalary > 0 ? Math.round((finalPct / 100) * simulationSalary) : 0;
    }
    setRows(updated);
  };

  // Update Amount in Row (vice versa: automatically syncs percentage)
  const handleAmountChange = (index: number, val: string) => {
    if (simulationSalary <= 0) {
      toast.error("Please enter a valid simulated monthly income first");
      return;
    }
    const updated = [...rows];
    if (val === "") {
      updated[index].amount = "";
      updated[index].percentage = 0;
    } else {
      const num = parseFloat(val);
      const amt = Math.max(0, isNaN(num) ? 0 : num);
      updated[index].amount = val;
      const rawPct = (amt / simulationSalary) * 100;
      const roundedPct = Math.min(100, Math.round(rawPct * 100) / 100);
      updated[index].percentage = roundedPct;
    }
    setRows(updated);
  };

  // Auto-fill remaining percentage into the last or specified row
  const handleFillRemaining = (index?: number) => {
    const currentSum = rows.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0);
    const remaining = Math.max(0, Math.round((100 - currentSum) * 100) / 100);
    if (remaining <= 0) return;

    const targetIdx = index !== undefined ? index : rows.length - 1;
    if (targetIdx >= 0 && targetIdx < rows.length) {
      const updated = [...rows];
      const newPct = Math.round((Number(updated[targetIdx].percentage) + remaining) * 100) / 100;
      updated[targetIdx].percentage = newPct;
      updated[targetIdx].amount =
        simulationSalary > 0 ? Math.round((newPct / 100) * simulationSalary) : 0;
      setRows(updated);
      toast.success(
        `Allocated remaining ${remaining}% to ${categoryMap.get(updated[targetIdx].categoryId)?.name || "category"}`
      );
    }
  };

  // Update Simulated Salary & sync all amounts
  const handleSimulationSalaryChange = (newSalary: number) => {
    const s = Math.max(0, newSalary);
    setSimulationSalary(s);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        amount: s > 0 ? Math.round((Number(r.percentage) / 100) * s) : 0,
      }))
    );
  };

  // Calculations
  const totalPercentage = useMemo(() => {
    const sum = rows.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0);
    return Math.round(sum * 100) / 100;
  }, [rows]);

  const totalAllocatedAmount = useMemo(() => {
    return Math.round((totalPercentage / 100) * simulationSalary);
  }, [totalPercentage, simulationSalary]);

  const remainingPercentage = Math.max(0, Math.round((100 - totalPercentage) * 100) / 100);
  const remainingAmount = Math.max(0, simulationSalary - totalAllocatedAmount);

  const isValidAllocation = Math.abs(totalPercentage - 100) < 0.01;
  const isUnderAllocated = totalPercentage < 100 && !isValidAllocation;
  const isOverAllocated = totalPercentage > 100 && !isValidAllocation;

  // Category Map for fast lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Breakdown metrics based on simulated salary
  const breakdownStats = useMemo(() => {
    let expenseSum = 0;
    let savingsSum = 0;
    let investmentSum = 0;

    rows.forEach((r) => {
      const cat = categoryMap.get(r.categoryId);
      const allocatedAmount = (r.percentage / 100) * simulationSalary;
      const type = cat?.categoryType === "SAVINGS" ? "SAVING" : cat?.categoryType;
      if (type === "SAVING") savingsSum += allocatedAmount;
      else if (type === "INVESTMENT") investmentSum += allocatedAmount;
      else expenseSum += allocatedAmount;
    });

    return {
      expenseSum,
      savingsSum,
      investmentSum,
      wealthTotal: savingsSum + investmentSum,
    };
  }, [rows, simulationSalary, categoryMap]);

  // Save Template Action
  const handleSaveTemplate = async () => {
    if (!isValidAllocation) {
      toast.error(`Allocation must total exactly 100%. Current total: ${totalPercentage}%`);
      return;
    }

    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    // Check for duplicate categories in rows
    const catIdSet = new Set<string>();
    for (const r of rows) {
      if (catIdSet.has(r.categoryId)) {
        const catName = categoryMap.get(r.categoryId)?.name || "a category";
        toast.error(`Duplicate category: ${catName} is selected multiple times. Combine them into one row.`);
        return;
      }
      catIdSet.add(r.categoryId);
    }

    setIsSaving(true);
    try {
      let targetTemplateId = selectedTemplateId;

      if (selectedTemplateId === "NEW") {
        // 1. Create the template container
        const created = await budgetApi.createTemplate({
          name: templateName.trim(),
          description: templateDescription.trim() || undefined,
          isActive: false,
          items: [],
        });
        targetTemplateId = created.id;

        // 2. Add each item
        for (const r of rows) {
          await budgetApi.addTemplateItem(targetTemplateId, {
            categoryId: r.categoryId,
            percentage: r.percentage,
          });
        }

        // 3. Activate the template
        await budgetApi.updateTemplate(targetTemplateId, {
          isActive: true,
        });

        toast.success("Budget template created and activated successfully!");
      } else {
        // Update existing template:
        // Update name and description
        await budgetApi.updateTemplate(targetTemplateId, {
          name: templateName.trim(),
          description: templateDescription.trim() || undefined,
        });

        // Fetch current template to compare items
        const currentTemplate = await budgetApi.getTemplateById(targetTemplateId);
        const existingItems = currentTemplate.items || [];

        // Delete existing items to cleanly replace with new set
        for (const item of existingItems) {
          await budgetApi.deleteTemplateItem(targetTemplateId, item.id);
        }

        // Add current items
        for (const r of rows) {
          await budgetApi.addTemplateItem(targetTemplateId, {
            categoryId: r.categoryId,
            percentage: r.percentage,
          });
        }

        // Ensure active
        await budgetApi.updateTemplate(targetTemplateId, {
          isActive: true,
        });

        toast.success("Budget template updated and activated successfully!");
      }

      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.templates() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });

      setSelectedTemplateId(targetTemplateId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save budget template";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingCategories || isLoadingTemplates) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <EmptyState
          icon={FolderTree}
          title="No Categories Configured"
          description="You need categories to set up a zero-based budget allocation template. Create your primary expense and savings categories first."
          action={
            <Link href="/categories">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Categories
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Salary Allocation Configurator"
        description="Implement zero-based budgeting by pre-allocating 100% of your incoming income across categories"
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveTemplate}
            disabled={!isValidAllocation || isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save & Activate Template"}
          </Button>
        </div>
      </PageHeader>

      {/* Blueprint Selector & Quick Presets Bar */}
      <Card className="p-4 border-border space-y-4 bg-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-sm">
            <Select
              label="Select Template"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              options={[
                { value: "NEW", label: "Create New Allocation Template" },
                ...templates.map((t) => ({
                  value: t.id,
                  label: `${t.name}${t.isActive ? " (Active)" : ""}`,
                })),
              ]}
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Quick Allocation Blueprints
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("50-30-20")}
                className="text-xs h-8"
              >
                50/30/20 Rule
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("balanced")}
                className="text-xs h-8"
              >
                Zero-Based Balanced
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("fire")}
                className="text-xs h-8"
              >
                Aggressive FIRE (50% Wealth)
              </Button>
            </div>
          </div>
        </div>

        {/* Template Metadata Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
          <Input
            label="Template Name"
            placeholder="e.g. Standard Salary Allocation"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
          <Input
            label="Description (Optional)"
            placeholder="e.g. Applied automatically to monthly salary deposits"
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
          />
        </div>
      </Card>

      {/* Main Grid: Allocator Table & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Allocation Configurator Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border overflow-hidden">
            <CardHeader className="py-4 px-5 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  Category Allocation Weights
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Set target percentage shares. All rows combined must sum to exactly 100%.
                </CardDescription>
              </div>

              {/* Live Status Badge */}
              <div className="flex items-center gap-2">
                {isValidAllocation ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 gap-1 px-3 py-1 font-semibold text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    100% Valid ({formatCurrency(simulationSalary)})
                  </Badge>
                ) : isUnderAllocated ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 gap-1 px-3 py-1 font-semibold text-xs">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {totalPercentage}% (Remaining: {remainingPercentage}% • {formatCurrency(remainingAmount)})
                    </Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleFillRemaining()}
                      className="h-7 text-[11px] px-2 text-primary border-primary/30 hover:bg-primary/10"
                      title="Auto-fill remaining percentage into the last category"
                    >
                      Fill Remaining
                    </Button>
                  </div>
                ) : (
                  <Badge variant="destructive" className="gap-1 px-3 py-1 font-semibold text-xs">
                    <XCircle className="h-3.5 w-3.5" />
                    {totalPercentage}% (Over by {Math.round((totalPercentage - 100) * 100) / 100}% • +{formatCurrency(totalAllocatedAmount - simulationSalary)})
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Visual Multi-Segment Bar */}
              <div className="p-4 bg-muted/30 border-b border-border">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-muted-foreground">Allocation Distribution Progress</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[11px] font-normal">
                      Allocated: <strong className="text-foreground">{formatCurrency(totalAllocatedAmount)}</strong> of {formatCurrency(simulationSalary)}
                    </span>
                    <span
                      className={
                        isValidAllocation
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : isOverAllocated
                          ? "text-rose-600 dark:text-rose-400 font-bold"
                          : "text-amber-600 dark:text-amber-400 font-bold"
                      }
                    >
                      {totalPercentage}% / 100%
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                  {rows.map((row, idx) => {
                    const cat = categoryMap.get(row.categoryId);
                    const type = cat?.categoryType;
                    const color =
                      type === "SAVING" || type === "SAVINGS"
                        ? "bg-blue-500"
                        : type === "INVESTMENT"
                        ? "bg-purple-500"
                        : type === "INCOME"
                        ? "bg-emerald-500"
                        : "bg-rose-500";
                    return (
                      <div
                        key={row.id || idx}
                        style={{ width: `${Math.min(100, row.percentage)}%` }}
                        className={`${color} h-full border-r border-background/20 transition-all duration-300`}
                        title={`${cat?.name || "Category"}: ${row.percentage}% (${formatCurrency((row.percentage / 100) * simulationSalary)})`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Table of Rows */}
              <div className="p-4 space-y-3">
                {rows.map((row, idx) => {
                  const selectedCat = categoryMap.get(row.categoryId);
                  const typeConfig = selectedCat
                    ? TYPE_BADGES[selectedCat.categoryType] || TYPE_BADGES.EXPENSE
                    : TYPE_BADGES.EXPENSE;
                  const estimatedAmount = Math.round((row.percentage / 100) * simulationSalary);

                  return (
                    <div
                      key={row.id || idx}
                      className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Category Selection */}
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-xs font-semibold text-foreground">
                            Category {idx + 1}
                          </label>
                          {selectedCat && (
                            <Badge
                              variant={typeConfig.variant}
                              className="text-[10px] uppercase font-normal"
                            >
                              {typeConfig.label}
                            </Badge>
                          )}
                        </div>

                        <select
                          value={row.categoryId}
                          onChange={(e) => handleCategoryChange(idx, e.target.value)}
                          className="h-9 w-full px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.categoryType})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Percentage Input + Step buttons */}
                      <div className="w-full sm:w-48 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Weight</span>
                          <div className="flex items-center gap-0.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={row.percentage === 0 ? "" : row.percentage}
                              onChange={(e) =>
                                handlePercentageChange(
                                  idx,
                                  e.target.value === "" ? 0 : parseFloat(e.target.value)
                                )
                              }
                              placeholder="0"
                              className="w-14 h-6 text-right text-xs font-bold bg-background rounded px-1.5 border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <span className="font-bold text-foreground text-xs">%</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePercentageChange(idx, row.percentage - 5)}
                            className="h-8 w-8 rounded-md border border-input bg-muted/40 hover:bg-muted text-xs font-semibold flex items-center justify-center cursor-pointer shrink-0"
                            title="-5%"
                          >
                            -5
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={row.percentage}
                            onChange={(e) =>
                              handlePercentageChange(idx, Number(e.target.value))
                            }
                            className="flex-1 accent-primary h-2 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => handlePercentageChange(idx, row.percentage + 5)}
                            className="h-8 w-8 rounded-md border border-input bg-muted/40 hover:bg-muted text-xs font-semibold flex items-center justify-center cursor-pointer shrink-0"
                            title="+5%"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      {/* Money / Amount Input for this row (Vice Versa Sync) */}
                      <div className="w-full sm:w-36 space-y-1 shrink-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Amount (₹)</span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs font-semibold text-muted-foreground pointer-events-none">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={
                              row.amount !== undefined
                                ? row.amount
                                : simulationSalary > 0
                                ? estimatedAmount || ""
                                : ""
                            }
                            onChange={(e) => handleAmountChange(idx, e.target.value)}
                            placeholder="0"
                            className="h-8 w-full pl-6 pr-2 rounded-lg border border-input bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>

                      {/* Delete Row */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRow(idx)}
                        disabled={rows.length <= 1}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0 self-end sm:self-center"
                        title="Remove category row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}

                {/* Add Row Button */}
                <div className="pt-2 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                    className="gap-2 text-xs"
                  >
                    <Plus className="h-4 w-4" /> Add Category Row
                  </Button>

                  <span className="text-xs text-muted-foreground">
                    {rows.length} {rows.length === 1 ? "category row" : "category rows"} configured
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 border-t border-border bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Zero-based budgeting enforces that every rupee has an assigned purpose before spending occurs.
                </span>
              </div>

              <Button
                onClick={handleSaveTemplate}
                disabled={!isValidAllocation || isSaving}
                className="gap-2 shrink-0 w-full sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save & Activate Template"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right 1 Col: Live Monthly Take-Home Simulation Card */}
        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader className="py-4 px-5 border-b border-border bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-emerald-500" />
                Salary Impact Simulator
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Simulate monthly earnings and preview the automatic rupee split
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              {/* Monthly Salary Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Simulated Monthly Income (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-xs font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={simulationSalary}
                    onChange={(e) => handleSimulationSalaryChange(Number(e.target.value))}
                    className="h-10 w-full pl-7 pr-3 rounded-lg border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[50000, 75000, 100000, 150000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSimulationSalaryChange(amt)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        simulationSalary === amt
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 text-muted-foreground border-input hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {formatCurrency(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-200 dark:border-rose-900/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                      <ArrowDownRight className="h-3.5 w-3.5" />
                      Living Expenses
                    </span>
                    <span className="text-sm font-bold text-rose-700 dark:text-rose-300">
                      {formatCurrency(breakdownStats.expenseSum)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {simulationSalary > 0
                      ? `${Math.round((breakdownStats.expenseSum / simulationSalary) * 100)}% of total salary`
                      : "0%"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-200 dark:border-blue-900/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <PiggyBank className="h-3.5 w-3.5" />
                      Savings Allocation
                    </span>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(breakdownStats.savingsSum)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {simulationSalary > 0
                      ? `${Math.round((breakdownStats.savingsSum / simulationSalary) * 100)}% emergency & liquid`
                      : "0%"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-200 dark:border-purple-900/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Investments Allocation
                    </span>
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                      {formatCurrency(breakdownStats.investmentSum)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {simulationSalary > 0
                      ? `${Math.round((breakdownStats.investmentSum / simulationSalary) * 100)}% long-term compounding`
                      : "0%"}
                  </p>
                </div>
              </div>

              {/* Total Wealth Creation Rate */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 text-center space-y-1">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Total Wealth Accumulation
                </span>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(breakdownStats.wealthTotal)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">/ month</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Savings + Investments retention rate:{" "}
                  <strong>
                    {simulationSalary > 0
                      ? `${Math.round((breakdownStats.wealthTotal / simulationSalary) * 100)}%`
                      : "0%"}
                  </strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Help Tip */}
          <Card className="p-4 border-border bg-card/60 space-y-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              How Template Activation Works
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When this template is saved as active, recording an income transaction marked as <strong>Salary</strong> (at <Link href="/income/new" className="text-primary hover:underline">/income/new</Link>) will allow you to generate that entire month&apos;s budget allocations in 1-click.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
