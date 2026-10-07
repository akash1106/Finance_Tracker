import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  createNotification,
  deleteNotification,
  listNotifications,
  listUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications.controller.js";
import { createNotificationSchema, notificationIdSchema } from "./notifications.schemas.js";

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);
notificationsRouter.get("/", asyncHandler(listNotifications));
notificationsRouter.get("/unread", asyncHandler(listUnreadNotifications));
notificationsRouter.post("/", validate(createNotificationSchema), asyncHandler(createNotification));
notificationsRouter.patch("/:id/read", validate(notificationIdSchema, "params"), asyncHandler(markNotificationRead));
notificationsRouter.patch("/read-all", asyncHandler(markAllNotificationsRead));
notificationsRouter.delete("/:id", validate(notificationIdSchema, "params"), asyncHandler(deleteNotification));