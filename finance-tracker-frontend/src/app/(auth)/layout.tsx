import React from "react";
import Link from "next/link";
import { Wallet, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center text-center space-y-2 z-10">
        <Link href="/login" className="flex items-center gap-2.5">
          <div className="h-11 w-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/20">
            <Wallet className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Money Tracker
          </span>
        </Link>
        <p className="text-xs text-muted-foreground max-w-xs">
          Personal Finance & Salary Allocation Management
        </p>
      </div>

      {/* Main Auth Form Container */}
      <div className="w-full max-w-md z-10">
        {children}
      </div>

      {/* Trust Footer */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground z-10">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        <span>End-to-End Secure Session & Encrypted Authentication</span>
      </div>
    </div>
  );
}
