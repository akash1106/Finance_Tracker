"use client";

import React from "react";
import Link from "next/link";
import {
  FolderTree,
  ArrowLeft,
  Plus,
  Sliders,
  CheckCircle2,
  Percent,
  Calendar,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Skeleton,
  EmptyState,
} from "@/components/ui";
import { useBudgetTemplates } from "@/hooks/use-budget";

export default function BudgetTemplatesPage() {
  const { data: templates, isLoading } = useBudgetTemplates();
  const templateList = templates || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/budget">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Budget Allocation Templates
            </h1>
            <p className="text-xs text-muted-foreground">
              Predefined zero-based percentage allocation models for your monthly salary
            </p>
          </div>
        </div>

        <Link href="/budget/allocation">
          <Button size="sm" className="gap-2">
            <Sliders className="h-4 w-4" /> Open Configurator
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-xl" />
          ))}
        </div>
      ) : templateList.length === 0 ? (
        <Card className="p-8 border-border">
          <EmptyState
            icon={FolderTree}
            title="No allocation templates saved"
            description="Create zero-based salary distribution rules that automatically divide your salary each month."
            action={
              <Link href="/budget/allocation">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Create First Template
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templateList.map((tpl) => {
            const items = tpl.items || [];
            const totalPct = items.reduce(
              (acc, item) => acc + (Number(item.percentage) || 0),
              0
            );

            return (
              <Card
                key={tpl.id}
                className="border-border flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold text-foreground">
                      {tpl.name}
                    </CardTitle>
                    <Badge variant={tpl.isActive ? "success" : "secondary"} className="text-[10px]">
                      {tpl.isActive ? "Active" : "Archived"}
                    </Badge>
                  </div>
                  {tpl.description && (
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {tpl.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Categories configured:</span>
                    <span className="font-semibold text-foreground">{items.length}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Total allocation:</span>
                    <span
                      className={`font-bold ${
                        Math.round(totalPct) === 100 ? "text-emerald-500" : "text-amber-500"
                      }`}
                    >
                      {totalPct.toFixed(0)}%
                    </span>
                  </div>

                  {/* Category Breakdown Chips */}
                  <div className="pt-2 border-t border-border/60">
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                      Category Distribution:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {items.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 text-[11px] font-medium text-foreground"
                        >
                          <span>{item.category?.name || "Category"}</span>
                          <span className="text-primary font-mono font-semibold">
                            {Number(item.percentage)}%
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/60">
                  <Link href="/budget/allocation" className="w-full">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      <Sliders className="h-3.5 w-3.5" /> Edit in Configurator
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
