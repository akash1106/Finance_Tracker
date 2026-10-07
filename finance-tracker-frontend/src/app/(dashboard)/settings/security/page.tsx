"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, KeyRound, Lock, CheckCircle2, AlertCircle } from "lucide-react";
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
  Input,
} from "@/components/ui";
import { useChangePassword } from "@/hooks/use-profile";

export default function SecuritySettingsPage() {
  const changePasswordMutation = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Security & Authentication"
        description="Manage your login credentials, password policies, and security protections"
      >
        <Link href="/settings">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Settings Hub
          </Button>
        </Link>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Change Password</CardTitle>
                <CardDescription className="text-xs">
                  Ensure your account uses a secure password with at least 8 characters.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5 max-w-md">
              <label className="text-xs font-semibold text-foreground">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5 max-w-md">
              <label className="text-xs font-semibold text-foreground">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5 max-w-md">
              <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="p-3.5 bg-muted/40 rounded-lg text-xs space-y-1.5 max-w-md border border-border">
              <span className="font-semibold text-foreground block text-[11px]">Security Safeguards:</span>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Encrypted using BCrypt 12-round cryptographic salting</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Protected against cross-site scripting via HttpOnly tokens</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border bg-muted/10 flex justify-end p-4">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={changePasswordMutation.isPending || !currentPassword || !newPassword}
              className="gap-2 text-xs"
            >
              <Lock className="h-4 w-4" />
              {changePasswordMutation.isPending ? "Updating Password..." : "Update Password"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
