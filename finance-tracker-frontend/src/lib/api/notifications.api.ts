import { apiGet, apiPatch } from "./client";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

export const notificationsApi = {
  list: () => apiGet<NotificationItem[]>("/notifications"),
  listUnread: () => apiGet<NotificationItem[]>("/notifications/unread"),
  markAsRead: (id: string) => apiPatch<NotificationItem>(`/notifications/${id}/read`),
  markAllAsRead: () => apiPatch<{ message: string }>("/notifications/read-all"),
};
