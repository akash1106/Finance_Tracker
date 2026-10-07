export type NotificationType =
  | "SYSTEM"
  | "BUDGET_WARNING"
  | "BUDGET_EXCEEDED"
  | "BILL_DUE"
  | "BILL_OVERDUE"
  | "GOAL_ACHIEVED"
  | "GOAL_MILESTONE"
  | "LOAN_DUE"
  | "ANOMALY_ALERT"
  | "SAVINGS_UPDATE"
  | "INFO"
  | string;

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  referenceId?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}
