import { z } from "zod";

export const notificationIdSchema = z.object({ id: z.string().uuid("Notification ID must be a valid UUID") });