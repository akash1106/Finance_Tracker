"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Check, X } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/schemas/auth.schema";
import { useAuth } from "@/hooks/use-auth";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const passwordValue = watch("password") || "";

  // Password complexity checks
  const rules = [
    { label: "8 to 72 characters", valid: passwordValue.length >= 8 && passwordValue.length <= 72 },
    { label: "At least 1 uppercase letter (A-Z)", valid: /[A-Z]/.test(passwordValue) },
    { label: "At least 1 lowercase letter (a-z)", valid: /[a-z]/.test(passwordValue) },
    { label: "At least 1 number (0-9)", valid: /[0-9]/.test(passwordValue) },
    { label: "At least 1 special character (!@#$%...)", valid: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setServerError(null);
      await registerUser(data);
      // Automatically redirect to login upon successful registration
      router.push("/login?registered=true");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Registration failed. Please check your information.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-xl">
      <CardHeader className="space-y-1 text-center pb-4">
        <CardTitle className="text-xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your details below to start your personal finance journey
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {serverError && (
          <Alert variant="destructive">
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <Input
            label="Full name"
            placeholder="John Doe"
            leftIcon={<UserIcon className="h-4 w-4" />}
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="name@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            error={errors.password?.message}
            {...register("password")}
          />

          {/* Real-time Password Rules Checklist */}
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
                  {rule.valid ? (
                    <Check className="h-3 w-3 shrink-0" />
                  ) : (
                    <X className="h-3 w-3 shrink-0 opacity-60" />
                  )}
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          )}

          <Input
            label="Confirm password"
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
            Create Account
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-border text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
