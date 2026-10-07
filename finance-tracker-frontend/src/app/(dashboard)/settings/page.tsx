"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  Shield,
  Palette,
  Bell,
  Wallet,
  PieChart,
  Tags,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/formatters/date";

export default function SettingsHubPage() {
  const { user } = useAuth();

  const settingsCards = [
    {
      title: "Profile & Identity",
      description: "Manage your legal name, registered email address, and account identity details.",
      href: "/settings/profile",
      icon: User,
      color: "text-primary",
      bg: "bg-primary/10",
      badge: "Account",
    },
    {
      title: "Security & Passwords",
      description: "Update your login password, view encryption status, and review security sessions.",
      href: "/settings/security",
      icon: Shield,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      badge: "Protected",
    },
    {
      title: "Appearance & Localization",
      description: "Customize theme mode (light/dark), Indian Rupee (INR) formatting, and decimal precision.",
      href: "/settings/appearance",
      icon: Palette,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      badge: "Preferences",
    },
    {
      title: "Notification Preferences",
      description: "Configure alert thresholds for budget limit warnings, bill due dates, and anomaly triggers.",
      href: "/settings/notifications",
      icon: Bell,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      badge: "Alerts",
    },
    {
      title: "Ledger Accounts",
      description: "Review and configure your bank accounts, credit cards, digital wallets, and cash reserves.",
      href: "/accounts",
      icon: Wallet,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      badge: "Ledger",
    },
    {
      title: "Category Master Taxonomies",
      description: "Organize spending and income hierarchies, customized icon tags, and subcategories.",
      href: "/categories",
      icon: Tags,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      badge: "Taxonomy",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & System Preferences"
        description="Configure your personal profile, security credentials, visual appearance, and automated alerts"
      />

      {/* User Status Banner */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/20">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((p) => p[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">{user?.name || "User Account"}</h3>
                <Badge variant="default" className="text-[10px]">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Account registered: {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>

          <Link href="/settings/profile">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs px-3 py-1.5 gap-1.5">
              Edit Profile <ArrowRight className="h-3 w-3" />
            </Badge>
          </Link>
        </CardContent>
      </Card>

      {/* Settings Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href} className="block group">
              <Card className="bg-card border-border hover:border-primary/50 transition-all h-full flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {card.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex items-center justify-between text-xs text-muted-foreground font-medium group-hover:text-primary">
                  <span>Open Configuration</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
