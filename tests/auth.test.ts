/// <reference types="jest" />

import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";
import { prisma } from "../src/config/database";
import { env } from "../src/config/env";
import { createApp } from "../src/app";
import { createAccessToken } from "../src/modules/auth/auth.tokens";

const app = createApp();

describe("POST /api/v1/auth/register", () => {
  it("creates a user and never returns the password hash", async () => {
    const passwordHash = await bcrypt.hash("password123", 4);
    const createUser = jest.spyOn(prisma.user, "create").mockResolvedValue({
      id: "user-id",
      name: "Akash",
      email: "user@example.com",
      passwordHash,
      isActive: true,
      createdAt: new Date("2026-09-28T00:00:00.000Z"),
      updatedAt: new Date("2026-09-28T00:00:00.000Z"),
    });

    const response = await request(app).post("/api/v1/auth/register").send({
      name: " Akash ",
      email: "User@Example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      id: "user-id",
      name: "Akash",
      email: "user@example.com",
      isActive: true,
      createdAt: "2026-09-28T00:00:00.000Z",
      updatedAt: "2026-09-28T00:00:00.000Z",
    });
    expect(response.body.data.passwordHash).toBeUndefined();
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Akash",
          email: "user@example.com",
          passwordHash: expect.not.stringMatching(/^password123$/),
        }),
      }),
    );
  });

  it("rejects an invalid registration body", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Akash",
      email: "not-an-email",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns a conflict when the registration email already exists", async () => {
    jest.spyOn(prisma.user, "create").mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("duplicate email", {
        code: "P2002",
        clientVersion: "6.19.3",
      }),
    );

    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Akash",
      email: "existing@example.com",
      password: "password123",
    });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("returns a JWT for valid credentials", async () => {
    const passwordHash = await bcrypt.hash("password123", 4);
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue({
      id: "user-id",
      name: "Akash",
      email: "user@example.com",
      passwordHash,
      isActive: true,
      createdAt: new Date("2026-09-28T00:00:00.000Z"),
      updatedAt: new Date("2026-09-28T00:00:00.000Z"),
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "User@Example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toEqual({
      id: "user-id",
      name: "Akash",
      email: "user@example.com",
    });

    const decoded = jwt.verify(response.body.data.accessToken, env.JWT_SECRET) as jwt.JwtPayload;
    expect(decoded.sub).toBe("user-id");
    expect(decoded.email).toBe("user@example.com");
    expect(response.body.data.refreshToken).toBeUndefined();
  });

  it("rejects incorrect credentials without revealing whether the email exists", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "missing@example.com",
      password: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Email or password is incorrect",
        details: [],
      },
    });
  });

  it("acknowledges logout without requiring a refresh token", async () => {
    const response = await request(app).post("/api/v1/auth/logout");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: null,
      message: "Logout successful",
    });
  });

  it("rejects /me when the access token is missing", async () => {
    const response = await request(app).get("/api/v1/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual({
      code: "UNAUTHORIZED",
      message: "Authentication token is required",
      details: [],
    });
  });

  it("rejects /me when the access token is invalid", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
    expect(response.body.error.message).toBe("Authentication token is invalid or expired");
  });

  it("returns the authenticated user for a valid access token", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue({
      id: "user-id",
      name: "Akash",
      email: "user@example.com",
      passwordHash: "not-used-by-me",
      isActive: true,
      createdAt: new Date("2026-09-28T00:00:00.000Z"),
      updatedAt: new Date("2026-09-28T00:00:00.000Z"),
    });

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${createAccessToken("user-id", "user@example.com")}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      id: "user-id",
      name: "Akash",
      email: "user@example.com",
      isActive: true,
      createdAt: "2026-09-28T00:00:00.000Z",
      updatedAt: "2026-09-28T00:00:00.000Z",
    });
  });

  it("rejects /me when the authenticated user no longer exists", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${responseToken()}`);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});

function responseToken(): string {
  return jwt.sign({ sub: "user-id", email: "user@example.com" }, env.JWT_SECRET, { expiresIn: "1h" });
}