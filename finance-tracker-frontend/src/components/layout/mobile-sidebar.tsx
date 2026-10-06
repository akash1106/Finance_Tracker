"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, X } from "lucide-react";
import { NAVIGATION_GROUPS } from "@/lib/constants/navigation";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function MobileSidebar() {
  const pathname = usePathname();
  const { isMobileSidebarOpen, closeMobileSidebar } = useUiStore();

  if (!isMobileSidebarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={closeMobileSidebar}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-card border-r border-border h-full flex flex-col z-10 shadow-2xl">
        {/* Brand & Close Button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link
            href="/dashboard"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-foreground truncate">
                Money Tracker
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Personal Finance
              </span>
            </div>
          </Link>
          <button
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.group} className="space-y-1">
              <h3 className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.group}
              </h3>
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
                        onClick={closeMobileSidebar}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
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
      </div>
    </div>
  );
}
