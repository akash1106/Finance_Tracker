"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth.schema";
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

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async () => {
    setIsLoading(true);
    // Simulate recovery email dispatch
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <Card className="border-border shadow-xl">
      <CardHeader className="space-y-1 text-center pb-4">
        <CardTitle className="text-xl font-bold">Reset your password</CardTitle>
        <CardDescription>
          Enter your account email to receive a password recovery link
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isSubmitted ? (
          <div className="space-y-4">
            <Alert variant="success">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>
                  If an account exists for that email, a password reset link has been dispatched.
                </span>
              </div>
            </Alert>
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="name@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Button
              type="submit"
              className="w-full h-10"
              isLoading={isLoading}
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-border">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
