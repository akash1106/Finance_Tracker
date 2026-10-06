"use client";

import React, { createContext, useEffect, useState, useCallback } from "react";
import type { LoginInput, RegisterInput } from "@/schemas/auth.schema";
import type { User } from "@/types/auth";
import type { AuthContextValue } from "./auth.types";
import { loginApi, registerApi, logoutApi, getMeApi } from "./auth.service";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await getMeApi();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (credentials: LoginInput) => {
    const { user: loggedInUser } = await loginApi(credentials);
    setUser(loggedInUser);
  };

  const register = async (data: RegisterInput) => {
    await registerApi(data);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
