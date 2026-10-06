import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Wallet,
  Tags,
  PieChart,
  Percent,
  CalendarClock,
  Repeat,
  PiggyBank,
  Target,
  LineChart,
  Landmark,
  FileText,
  BarChart3,
  Bell,
  Download,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Daily Ledgers",
    items: [
      { title: "Transactions", href: "/transactions", icon: ArrowLeftRight },
      { title: "Income", href: "/income", icon: TrendingUp },
      { title: "Accounts", href: "/accounts", icon: Wallet },
      { title: "Categories", href: "/categories", icon: Tags },
    ],
  },
  {
    group: "Budgeting",
    items: [
      { title: "Monthly Budget", href: "/budget", icon: PieChart },
      { title: "Salary Allocation", href: "/budget/allocation", icon: Percent },
      { title: "Fixed Expenses", href: "/fixed-expenses", icon: CalendarClock },
      { title: "Recurring Rules", href: "/recurring", icon: Repeat },
    ],
  },
  {
    group: "Wealth & Liabilities",
    items: [
      { title: "Savings & Goals", href: "/savings", icon: PiggyBank },
      { title: "Investments", href: "/investments", icon: LineChart },
      { title: "Financial Goals", href: "/goals", icon: Target },
      { title: "Loans & EMI", href: "/loans", icon: Landmark },
    ],
  },
  {
    group: "Insights & Tools",
    items: [
      { title: "Reports", href: "/reports", icon: FileText },
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
      { title: "Notifications", href: "/notifications", icon: Bell },
      { title: "Export Center", href: "/exports", icon: Download },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
