"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { useAuth } from "@/hooks/use-auth";
import {
  Button,
  Input,
  Checkbox,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
} from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
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
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setServerError(null);
      await login(data);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Invalid credentials. Please check your email and password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-xl">
      <CardHeader className="space-y-1 text-center pb-4">
        <CardTitle className="text-xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Enter your email and password to access your dashboard
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {serverError && (
          <Alert variant="destructive">
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="name@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="space-y-1">
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
          </div>

          <div className="flex items-center justify-between text-xs">
            <Checkbox
              label="Remember me"
              {...register("rememberMe")}
            />
            <Link
              href="/forgot-password"
              className="font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-10"
            isLoading={isLoading}
          >
            Log In
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-border text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
