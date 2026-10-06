"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building, IndianRupee, Layers } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui";
import { useCreateAccount } from "@/hooks/use-accounts";
import { accountSchema, type AccountFormData } from "@/schemas/account.schema";

export default function NewAccountPage() {
  const router = useRouter();
  const createMutation = useCreateAccount();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      accountType: "BANK",
      openingBalance: 0,
    },
  });

  const onSubmit = async (values: AccountFormData) => {
    await createMutation.mutateAsync(values);
    router.push("/accounts");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/accounts"
          className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to accounts
        </Link>
      </div>

      <PageHeader
        title="Add Account"
        description="Register a new bank account, cash wallet, or credit payment channel"
      />

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Account Profile</CardTitle>
          <CardDescription>
            Configure the account identifier and initial opening balance
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Account Name */}
            <Input
              label="Account Name"
              placeholder="e.g. HDFC Salary Account, SBI Savings, Cash Wallet"
              leftIcon={<Building className="h-4 w-4 text-muted-foreground" />}
              error={errors.name?.message}
              {...register("name")}
            />

            {/* Account Type */}
            <div className="space-y-1.5">
              <Controller
                name="accountType"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Account Type"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.accountType?.message}
                    options={[
                      { value: "BANK", label: "Bank Account (Checking / Savings)" },
                      { value: "CASH", label: "Physical Cash in Hand" },
                      { value: "OTHER", label: "Digital Wallet / Credit / Other" },
                    ]}
                  />
                )}
              />
            </div>

            {/* Opening Balance */}
            <Input
              label="Opening Balance (₹)"
              type="number"
              step="0.01"
              placeholder="0.00"
              leftIcon={<IndianRupee className="h-4 w-4 text-muted-foreground" />}
              error={errors.openingBalance?.message}
              {...register("openingBalance", { valueAsNumber: true })}
            />
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link href="/accounts">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
