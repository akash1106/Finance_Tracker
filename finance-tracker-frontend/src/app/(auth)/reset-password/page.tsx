"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas/auth.schema";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const passwordValue = watch("password") || "";

  const rules = [
    { label: "8 to 72 characters", valid: passwordValue.length >= 8 && passwordValue.length <= 72 },
    { label: "At least 1 uppercase letter (A-Z)", valid: /[A-Z]/.test(passwordValue) },
    { label: "At least 1 lowercase letter (a-z)", valid: /[a-z]/.test(passwordValue) },
    { label: "At least 1 number (0-9)", valid: /[0-9]/.test(passwordValue) },
    { label: "At least 1 special character (!@#$%...)", valid: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

  const onSubmit = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/login?reset=true");
    }, 600);
  };

  return (
    <Card className="border-border shadow-xl">
      <CardHeader className="space-y-1 text-center pb-4">
        <CardTitle className="text-xl font-bold">Set new password</CardTitle>
        <CardDescription>
          Enter and confirm your new secure account password
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <Input
            label="New password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register("password")}
          />

          {passwordValue.length > 0 && (
            <div className="p-3 rounded-lg bg-muted/60 border border-border/80 space-y-1.5 text-[11px]">
              <p className="font-semibold text-foreground/80 mb-1">
                Password requirements:
              </p>
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    rule.valid ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"
                  )}
                >
                  {rule.valid ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0 opacity-60" />}
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          )}

          <Input
            label="Confirm new password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            className="w-full h-10 mt-2"
            isLoading={isLoading}
          >
            Update Password
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-border">
          <Link
            href="/login"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
