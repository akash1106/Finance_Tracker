import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

const ACCESS_TOKEN_TTL = "15m";

export function createAccessToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL },
  );
}
