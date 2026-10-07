"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Palette, DollarSign, Check, Moon, Sun, Monitor, Save } from "lucide-react";
import { toast } from "sonner";
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
  Select,
} from "@/components/ui";

export default function AppearanceSettingsPage() {
  const [currency, setCurrency] = useState("INR");
  const [numberFormat, setNumberFormat] = useState("INDIAN");
  const [showDecimals, setShowDecimals] = useState(false);
  const [theme, setTheme] = useState("system");

  const handleSave = () => {
    toast.success("Appearance and localization preferences saved");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Appearance & Localization"
        description="Configure display currency formatting, number systems, and visual themes"
      >
        <Link href="/settings">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Settings Hub
          </Button>
        </Link>
      </PageHeader>

      {/* Currency & Number Format Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Currency & Number Formatting</CardTitle>
              <CardDescription className="text-xs">
                Control currency symbol representation and Indian numeric groupings (Lakhs & Crores).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5 max-w-md">
            <label className="text-xs font-semibold text-foreground">Base Currency</label>
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-9 text-xs"
            >
              <option value="INR">Indian Rupee (INR — ₹)</option>
              <option value="USD">US Dollar (USD — $)</option>
              <option value="EUR">Euro (EUR — €)</option>
              <option value="GBP">British Pound (GBP — £)</option>
            </Select>
          </div>

          <div className="space-y-1.5 max-w-md">
            <label className="text-xs font-semibold text-foreground">Number Grouping System</label>
            <Select
              value={numberFormat}
              onChange={(e) => setNumberFormat(e.target.value)}
              className="h-9 text-xs"
            >
              <option value="INDIAN">Indian Vedic (₹1,00,000 — Lakhs & Crores)</option>
              <option value="INTERNATIONAL">International (₹100,000 — Millions & Billions)</option>
            </Select>
          </div>

          <div className="pt-2 flex items-center justify-between max-w-md p-3 rounded-lg border border-border bg-muted/20">
            <div>
              <span className="text-xs font-semibold text-foreground block">Display Decimal Paisa (.00)</span>
              <span className="text-[11px] text-muted-foreground">Show two decimal places for all amounts</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDecimals(!showDecimals)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                showDecimals ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  showDecimals ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Preference Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Visual Theme</CardTitle>
              <CardDescription className="text-xs">
                Choose light, dark, or automatic system appearance mode.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Sun className="h-5 w-5" />
              <span className="text-xs font-semibold">Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs font-semibold">Dark</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === "system"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Monitor className="h-5 w-5" />
              <span className="text-xs font-semibold">System</span>
            </button>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border bg-muted/10 flex justify-end p-4">
          <Button variant="primary" size="sm" onClick={handleSave} className="gap-2 text-xs">
            <Save className="h-4 w-4" /> Save Preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
