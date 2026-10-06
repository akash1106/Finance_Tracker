import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Progress,
} from "@/components/ui";
import { Plus, ArrowUpRight, ArrowDownRight, Wallet, PieChart } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to your personal finance and salary overview."
      >
        <Link href="/transactions/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Add Transaction
          </Button>
        </Link>
      </PageHeader>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Total Balance</span>
              <Wallet className="h-4 w-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">₹0.00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">Across all active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Monthly Income</span>
              <ArrowDownRight className="h-4 w-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹0.00
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success">Current Month</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Monthly Expenses</span>
              <ArrowUpRight className="h-4 w-4 text-rose-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ₹0.00
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">0% of Income</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Budget Utilization</span>
              <PieChart className="h-4 w-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">0%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <Progress value={0} />
            <p className="text-[11px] text-muted-foreground">No active budget</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
