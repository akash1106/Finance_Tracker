import { z } from "zod";

export const notificationIdSchema = z.object({ id: z.string().uuid("Notification ID must be a valid UUID") });

export const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required"),
  notificationType: z.string().default("SYSTEM"),
  referenceId: z.string().uuid().optional().nullable(),
});