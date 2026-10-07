"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  notificationsApi,
  type CreateNotificationDto,
} from "@/lib/api/notifications.api";
import { queryKeys } from "@/lib/query/query-keys";

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.all(),
    queryFn: () => notificationsApi.list(),
  });
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: () => notificationsApi.listUnread(),
    refetchInterval: 30 * 1000, // Background poll unread count every 30s
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationDto) => notificationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() });
      toast.success("Notification created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create notification");
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update notification");
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() });
      toast.success("All notifications marked as read");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update notifications");
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() });
      toast.success("Notification dismissed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete notification");
    },
  });
}
