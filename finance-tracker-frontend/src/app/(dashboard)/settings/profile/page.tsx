"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, ShieldCheck, Calendar, Save, Check } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/formatters/date";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const [name, setName] = useState("");

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfileMutation.mutate({ name: name.trim() });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Profile & Identity"
        description="Manage your account profile details and authentication identity credentials"
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
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
                <CardDescription className="text-xs">
                  Your legal display name used in audit exports and application greetings.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Display Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="max-w-md h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Registered Email</label>
              <div className="flex items-center gap-2 max-w-md">
                <Input
                  value={user?.email || ""}
                  disabled
                  className="h-9 text-xs bg-muted/50 cursor-not-allowed text-muted-foreground"
                />
                <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Email address is linked to your cryptographic login credentials.
              </p>
            </div>

            <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">User Identifier (UUID)</span>
                <span className="font-mono text-[11px] text-foreground">{user?.id || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Account Created</span>
                <span className="text-foreground">{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border bg-muted/10 flex justify-end p-4">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={updateProfileMutation.isPending || !name.trim() || name === user?.name}
              className="gap-2 text-xs"
            >
              <Save className="h-4 w-4" />
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
