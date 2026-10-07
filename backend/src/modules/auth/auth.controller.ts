import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import { env } from "../../config/env.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import { createAccessToken } from "./auth.tokens.js";

const BCRYPT_ROUNDS = 12;

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as RegisterInput;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(201).json({
      success: true,
      data: safeUser,
      message: "User registered successfully",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists");
    }

    throw error;
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }

  const accessToken = createAccessToken(user.id, user.email);
  const isProduction = env.NODE_ENV === "production";

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
    message: "Login successful",
  });
}

export function logout(_req: Request, res: Response): void {
  const isProduction = env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    data: null,
    message: "Logout successful",
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const auth = req.auth;

  if (!auth) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || !user.isActive) {
    throw new AppError(401, "UNAUTHORIZED", "User account is not available");
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.status(200).json({
    success: true,
    data: safeUser,
    message: "Authenticated user retrieved successfully",
  });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const auth = req.auth;
  if (!auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  const { name } = req.body;
  if (!name || typeof name !== "string") throw new AppError(400, "VALIDATION_ERROR", "Name is required");

  const updated = await prisma.user.update({
    where: { id: auth.userId },
    data: { name: name.trim() },
    select: { id: true, name: true, email: true, isActive: true, createdAt: true, updatedAt: true },
  });

  res.status(200).json({ success: true, data: updated, message: "Profile updated successfully" });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const auth = req.auth;
  if (!auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new AppError(400, "VALIDATION_ERROR", "Current and new password are required");

  const user = await prisma.user.findUnique({ where: { id: auth.userId } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError(400, "INVALID_CREDENTIALS", "Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({ where: { id: auth.userId }, data: { passwordHash } });

  res.status(200).json({ success: true, data: null, message: "Password updated successfully" });
}