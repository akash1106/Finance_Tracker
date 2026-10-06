"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { NAVIGATION_GROUPS } from "@/lib/constants/navigation";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 relative select-none",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-foreground truncate">
                Money Tracker
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Personal Finance
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAVIGATION_GROUPS.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isSidebarCollapsed && (
              <h3 className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.group}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={isSidebarCollapsed ? item.title : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative group",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        isSidebarCollapsed && "justify-center px-2"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                      {!isSidebarCollapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                      {item.badge && !isSidebarCollapsed && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-border flex items-center justify-end">
        <button
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
