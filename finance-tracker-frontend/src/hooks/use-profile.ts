"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth.api";
import { useAuth } from "./use-auth";

export function useUpdateProfile() {
  const { refreshSession } = useAuth();

  return useMutation({
    mutationFn: (data: { name: string }) => authApi.updateProfile(data),
    onSuccess: async () => {
      await refreshSession();
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });
}
