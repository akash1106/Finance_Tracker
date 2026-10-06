import { authApi } from "@/lib/api/auth.api";
import type { LoginInput, RegisterInput } from "@/schemas/auth.schema";
import type { User } from "@/types/auth";

export async function loginApi(input: LoginInput): Promise<{ user: User; accessToken: string }> {
  return authApi.login(input);
}

export async function registerApi(input: RegisterInput): Promise<User> {
  return authApi.register(input);
}

export async function getMeApi(): Promise<User> {
  return authApi.getMe();
}

export async function logoutApi(): Promise<void> {
  return authApi.logout();
}
