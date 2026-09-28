import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  accountIdSchema,
  createAccountSchema,
  updateAccountSchema,
} from "./accounts.schemas.js";
import {
  createAccount,
  deactivateAccount,
  getAccount,
  listAccounts,
  updateAccount,
} from "./accounts.controller.js";

export const accountsRouter = Router();

accountsRouter.use(authenticate);
accountsRouter.get("/", asyncHandler(listAccounts));
accountsRouter.get("/:id", validate(accountIdSchema, "params"), asyncHandler(getAccount));
accountsRouter.post("/", validate(createAccountSchema), asyncHandler(createAccount));
accountsRouter.patch(
  "/:id",
  validate(accountIdSchema, "params"),
  validate(updateAccountSchema),
  asyncHandler(updateAccount),
);
accountsRouter.delete(
  "/:id",
  validate(accountIdSchema, "params"),
  asyncHandler(deactivateAccount),
);