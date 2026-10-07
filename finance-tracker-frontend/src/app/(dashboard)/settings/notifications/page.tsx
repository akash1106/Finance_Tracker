"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, AlertTriangle, CalendarClock, Award, TrendingUp, Save, ExternalLink } from "lucide-react";
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

export default function NotificationSettingsPage() {
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [budgetThreshold, setBudgetThreshold] = useState("85");
  const [billReminders, setBillReminders] = useState(true);
  const [billAdvanceDays, setBillAdvanceDays] = useState("3");
  const [anomalyAlerts, setAnomalyAlerts] = useState(true);
  const [goalMilestones, setGoalMilestones] = useState(true);

  const handleSave = () => {
    toast.success("Notification preferences saved successfully");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Notification Preferences"
        description="Configure automated alert triggers for budget envelopes, bill due dates, and anomaly spikes"
      >
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Settings Hub
            </Button>
          </Link>
          <Link href="/notifications">
            <Button variant="outline" size="sm" className="gap-2 text-xs border-primary/30 text-primary hover:bg-primary/10">
              <Bell className="h-4 w-4" /> Open Center
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Automated Financial Triggers</CardTitle>
              <CardDescription className="text-xs">
                Fine-tune how and when the system alerts you regarding critical financial events.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trigger 1: Budget Alert */}
          <div className="p-4 rounded-xl border border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Budget Limit Approaching Alert</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Receive warnings when a category expense reaches a percentage of its monthly cap.
                </p>
                {budgetAlerts && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-muted-foreground">Trigger threshold:</span>
                    <div className="w-28">
                      <Select
                        value={budgetThreshold}
                        onChange={(e) => setBudgetThreshold(e.target.value)}
                        className="h-7 text-[11px]"
                      >
                        <option value="75">75% of limit</option>
                        <option value="85">85% of limit</option>
                        <option value="90">90% of limit</option>
                        <option value="100">100% (Breach)</option>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBudgetAlerts(!budgetAlerts)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors self-end sm:self-center shrink-0 ${
                budgetAlerts ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  budgetAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Trigger 2: Bill & Loan Payment Reminders */}
          <div className="p-4 rounded-xl border border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 shrink-0">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Upcoming Bills & EMI Due Reminders</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Early warning notifications for scheduled loan repayments and recurring bills.
                </p>
                {billReminders && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-muted-foreground">Remind in advance:</span>
                    <div className="w-32">
                      <Select
                        value={billAdvanceDays}
                        onChange={(e) => setBillAdvanceDays(e.target.value)}
                        className="h-7 text-[11px]"
                      >
                        <option value="1">1 Day Prior</option>
                        <option value="3">3 Days Prior</option>
                        <option value="5">5 Days Prior</option>
                        <option value="7">7 Days Prior</option>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBillReminders(!billReminders)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors self-end sm:self-center shrink-0 ${
                billReminders ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  billReminders ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Trigger 3: Spending Spike Anomalies */}
          <div className="p-4 rounded-xl border border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Algorithmic Spending Spike Detection</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Flag unusual expenditures exceeding 150% of your historical multi-month average.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAnomalyAlerts(!anomalyAlerts)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors self-end sm:self-center shrink-0 ${
                anomalyAlerts ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  anomalyAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Trigger 4: Goal Milestones */}
          <div className="p-4 rounded-xl border border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Goal Milestone Celebrations</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Celebrate reaching 25%, 50%, 75%, and 100% savings goal milestones.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setGoalMilestones(!goalMilestones)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors self-end sm:self-center shrink-0 ${
                goalMilestones ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  goalMilestones ? "translate-x-5" : "translate-x-0"
                }`}
              />
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
