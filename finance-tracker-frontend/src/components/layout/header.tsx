"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Menu, User as UserIcon, LogOut } from "lucide-react";
import { Breadcrumbs } from "./breadcrumbs";
import { useUiStore } from "@/store/ui-store";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadNotifications } from "@/hooks/use-notifications";

export function Header() {
  const router = useRouter();
  const { toggleMobileSidebar } = useUiStore();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: unreadNotifications } = useUnreadNotifications();
  const unreadCount = unreadNotifications?.length ?? 0;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          aria-label="Open mobile menu"
          className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right: Notifications, User Profile & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Info */}
        <Link
          href="/settings/profile"
          className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
            {userInitials || <UserIcon className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="hidden lg:flex flex-col text-left max-w-[120px]">
            <span className="text-xs font-semibold text-foreground truncate leading-none">
              {user?.name || "Account"}
            </span>
            <span className="text-[10px] text-muted-foreground truncate leading-tight">
              {user?.email || "Personal"}
            </span>
          </div>
        </Link>

        {/* Quick Logout Action */}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
}
