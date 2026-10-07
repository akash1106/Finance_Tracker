import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type { NotificationItem } from "@/types";

export type { NotificationItem };

export interface CreateNotificationDto {
  title: string;
  message: string;
  notificationType?: string;
  referenceId?: string | null;
}

export const notificationsApi = {
  list: () => apiGet<NotificationItem[]>("/notifications"),
  listUnread: () => apiGet<NotificationItem[]>("/notifications/unread"),
  create: (data: CreateNotificationDto) =>
    apiPost<NotificationItem>("/notifications", data),
  markAsRead: (id: string) =>
    apiPatch<NotificationItem>(`/notifications/${id}/read`),
  markAllAsRead: () => apiPatch<{ message: string }>("/notifications/read-all"),
  delete: (id: string) => apiDelete<{ message: string }>(`/notifications/${id}`),
};
