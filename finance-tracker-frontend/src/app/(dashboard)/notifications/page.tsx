"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  AlertTriangle,
  CalendarClock,
  PiggyBank,
  TrendingUp,
  Award,
  Info,
  Search,
  Filter,
  Plus,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Skeleton,
  Input,
  Select,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  EmptyState,
} from "@/components/ui";
import {
  useNotifications,
  useUnreadNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useCreateNotification,
} from "@/hooks/use-notifications";
import { formatDate } from "@/lib/formatters/date";
import type { NotificationItem, NotificationType } from "@/types";

function getNotificationVisuals(type: NotificationType) {
  const t = (type || "").toUpperCase();
  if (t.includes("BUDGET")) {
    return {
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      badgeVariant: "destructive" as const,
      label: "Budget Alert",
    };
  }
  if (t.includes("BILL") || t.includes("LOAN")) {
    return {
      icon: CalendarClock,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      border: "border-sky-500/30",
      badgeVariant: "secondary" as const,
      label: "Bill & Due Date",
    };
  }
  if (t.includes("GOAL") || t.includes("SAVING")) {
    return {
      icon: Award,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      badgeVariant: "default" as const,
      label: "Goal Milestone",
    };
  }
  if (t.includes("ANOMALY")) {
    return {
      icon: TrendingUp,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      badgeVariant: "destructive" as const,
      label: "Spending Spike",
    };
  }
  return {
    icon: Info,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    badgeVariant: "outline" as const,
    label: "System Message",
  };
}

function getActionUrl(type: NotificationType): string | null {
  const t = (type || "").toUpperCase();
  if (t.includes("BUDGET")) return "/budget";
  if (t.includes("LOAN")) return "/loans";
  if (t.includes("GOAL") || t.includes("SAVING")) return "/savings";
  if (t.includes("ANOMALY")) return "/analytics/spending";
  return null;
}

export default function NotificationsCenterPage() {
  const { data: rawNotifications, isLoading } = useNotifications();
  const { data: unreadItems } = useUnreadNotifications();

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();
  const createMutation = useCreateNotification();

  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [selectedTypeGroup, setSelectedTypeGroup] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Test notification modal form state
  const [testTitle, setTestTitle] = useState("Budget Limit Approaching");
  const [testMessage, setTestMessage] = useState(
    "Your Food & Dining category has reached 88% of this month's budget cap."
  );
  const [testType, setTestType] = useState("BUDGET_WARNING");

  const notifications = useMemo(() => rawNotifications || [], [rawNotifications]);
  const unreadCount = unreadItems?.length ?? 0;
  const readCount = Math.max(0, notifications.length - unreadCount);

  // Counts by category
  const counts = useMemo(() => {
    let budgetCount = 0;
    let billCount = 0;
    let goalCount = 0;

    notifications.forEach((n) => {
      const t = (n.notificationType || "").toUpperCase();
      if (t.includes("BUDGET") || t.includes("ANOMALY")) budgetCount += 1;
      else if (t.includes("BILL") || t.includes("LOAN")) billCount += 1;
      else if (t.includes("GOAL") || t.includes("SAVING")) goalCount += 1;
    });

    return { budgetCount, billCount, goalCount };
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Tab filter
      if (activeTab === "UNREAD" && n.isRead) return false;
      if (activeTab === "READ" && !n.isRead) return false;

      // Group filter
      if (selectedTypeGroup !== "ALL") {
        const t = (n.notificationType || "").toUpperCase();
        if (selectedTypeGroup === "BUDGET" && !t.includes("BUDGET") && !t.includes("ANOMALY")) {
          return false;
        }
        if (selectedTypeGroup === "BILL" && !t.includes("BILL") && !t.includes("LOAN")) {
          return false;
        }
        if (selectedTypeGroup === "GOAL" && !t.includes("GOAL") && !t.includes("SAVING")) {
          return false;
        }
        if (
          selectedTypeGroup === "SYSTEM" &&
          (t.includes("BUDGET") || t.includes("BILL") || t.includes("LOAN") || t.includes("GOAL") || t.includes("SAVING"))
        ) {
          return false;
        }
      }

      // Search filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesMessage = n.message.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage) return false;
      }

      return true;
    });
  }, [notifications, activeTab, selectedTypeGroup, searchTerm]);

  const handleCreateTestNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim() || !testMessage.trim()) return;

    await createMutation.mutateAsync({
      title: testTitle.trim(),
      message: testMessage.trim(),
      notificationType: testType,
    });

    setIsTestModalOpen(false);
  };

  const handleApplyPreset = (preset: "budget" | "bill" | "goal" | "anomaly") => {
    if (preset === "budget") {
      setTestTitle("Budget Alert: Dining Category at 92%");
      setTestMessage("Dining & Entertainment has reached ₹18,400 of the ₹20,000 monthly allocated envelope.");
      setTestType("BUDGET_WARNING");
    } else if (preset === "bill") {
      setTestTitle("Upcoming Bill: Electricity & Utilities");
      setTestMessage("Payment for Electricity Bill of ₹3,450 is scheduled in 3 days.");
      setTestType("BILL_DUE");
    } else if (preset === "goal") {
      setTestTitle("Goal Milestone: Emergency Reserve 75%");
      setTestMessage("Congratulations! Your Emergency Fund has reached ₹1,50,000 (75% of your target).");
      setTestType("GOAL_MILESTONE");
    } else if (preset === "anomaly") {
      setTestTitle("Spending Spike Detected: Shopping Outflow");
      setTestMessage("Unusually high transaction volume detected in Shopping compared to your 3-month baseline.");
      setTestType("ANOMALY_ALERT");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Alerts Center"
        description="Monitor real-time budget thresholds, bills due, savings milestones, and financial system messages"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={() => setIsTestModalOpen(true)}
          >
            <Sparkles className="h-4 w-4 text-primary" /> Simulate Alert
          </Button>

          <Button
            size="sm"
            variant="primary"
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
            className="gap-2 text-xs"
          >
            <CheckCheck className="h-4 w-4" /> Mark All as Read
          </Button>
        </div>
      </PageHeader>

      {/* KPI Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Received
              </span>
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Bell className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {notifications.length}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                All logged system and account notifications
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Unread Alerts
              </span>
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  unreadCount > 0 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                }`}
              >
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold tracking-tight ${
                  unreadCount > 0 ? "text-amber-500" : "text-emerald-500"
                }`}
              >
                {unreadCount}
              </span>
              <Badge
                variant={unreadCount > 0 ? "secondary" : "default"}
                className="text-[10px] px-1.5 py-0"
              >
                {unreadCount > 0 ? "Pending Action" : "Up to date"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {unreadCount > 0 ? "Unread notices requiring your attention" : "No pending unread alerts"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Budget & Spikes
              </span>
              <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {counts.budgetCount}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Threshold warnings and expenditure anomalies
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Goals & Milestones
              </span>
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-emerald-500">
                {counts.goalCount}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Completed targets and savings achievements
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Tab Navigation Toolbar */}
      <Card className="p-3 bg-card border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "ALL"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("UNREAD")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "UNREAD"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab("READ")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "READ"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Read ({readCount})
            </button>
          </div>

          {/* Type Category Dropdown */}
          <div className="w-48">
            <Select
              value={selectedTypeGroup}
              onChange={(e) => setSelectedTypeGroup(e.target.value)}
              className="h-8 text-xs"
            >
              <option value="ALL">All Categories</option>
              <option value="BUDGET">Budget & Anomaly Alerts</option>
              <option value="BILL">Bills & Due Dates</option>
              <option value="GOAL">Goals & Milestones</option>
              <option value="SYSTEM">System Notices</option>
            </Select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <EmptyState
                title={
                  activeTab === "UNREAD"
                    ? "You're all caught up!"
                    : "No notifications found"
                }
                description={
                  activeTab === "UNREAD"
                    ? "You have no unread notifications. New alerts for budgets, bills, and goals will appear here."
                    : "No notifications match your active search and category filters."
                }
              />
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((item) => {
            const visual = getNotificationVisuals(item.notificationType);
            const Icon = visual.icon;
            const actionUrl = item.actionUrl || getActionUrl(item.notificationType);

            return (
              <Card
                key={item.id}
                className={`transition-all bg-card ${
                  !item.isRead
                    ? "border-primary/40 shadow-sm bg-primary/[0.02]"
                    : "border-border/80 opacity-90 hover:opacity-100"
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Left: Icon & Notification Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${visual.bg} ${visual.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`text-sm tracking-tight ${
                            !item.isRead
                              ? "font-bold text-foreground"
                              : "font-medium text-foreground/80"
                          }`}
                        >
                          {item.title}
                        </h4>

                        {!item.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}

                        <Badge
                          variant={visual.badgeVariant}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {visual.label}
                        </Badge>

                        <span className="text-[11px] text-muted-foreground ml-auto sm:ml-0">
                          {formatDate(item.createdAt, "dd MMM yyyy, hh:mm a")}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {actionUrl && (
                      <Link href={actionUrl}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-primary gap-1 px-2.5"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}

                    {!item.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={markReadMutation.isPending}
                        onClick={() => markReadMutation.mutate(item.id)}
                        className="h-8 text-xs gap-1 border-border px-2.5 hover:bg-accent"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5 text-muted-foreground" /> Mark Read
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Dismiss notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Simulation / Test Alert Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> Simulate Financial Alert
            </DialogTitle>
            <DialogDescription className="text-xs">
              Generate a test notification to preview how system warnings and milestone alerts render.
            </DialogDescription>
          </DialogHeader>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-muted-foreground">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleApplyPreset("budget")}
                className="text-[11px] h-7 px-2"
              >
                Budget Warning
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleApplyPreset("bill")}
                className="text-[11px] h-7 px-2"
              >
                Upcoming Bill
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleApplyPreset("goal")}
                className="text-[11px] h-7 px-2"
              >
                Goal Milestone
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleApplyPreset("anomaly")}
                className="text-[11px] h-7 px-2"
              >
                Spending Spike
              </Button>
            </div>
          </div>

          <form onSubmit={handleCreateTestNotification} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Alert Type</label>
              <Select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="BUDGET_WARNING">Budget Warning</option>
                <option value="BILL_DUE">Bill Due Date</option>
                <option value="GOAL_MILESTONE">Goal Milestone</option>
                <option value="ANOMALY_ALERT">Spending Spike Anomaly</option>
                <option value="SYSTEM">System Notice</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Title</label>
              <Input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Alert title..."
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Message</label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Alert message description..."
                className="w-full text-xs rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[75px]"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTestModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="text-xs"
              >
                Send Notification
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
