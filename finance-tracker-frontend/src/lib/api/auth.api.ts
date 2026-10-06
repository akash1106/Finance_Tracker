import { apiGet, apiPost } from "./client";
import type { LoginInput, RegisterInput } from "@/schemas/auth.schema";
import type { User, AuthResponseData } from "@/types/auth";
import { setStoredToken, removeStoredToken } from "@/features/auth/auth.utils";

export const authApi = {
  login: async (input: LoginInput): Promise<{ user: User; accessToken: string }> => {
    const data = await apiPost<AuthResponseData>("/auth/login", {
      email: input.email,
      password: input.password,
    });

    if (data.accessToken) {
      setStoredToken(data.accessToken, Boolean(input.rememberMe));
    }

    const user: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { user, accessToken: data.accessToken };
  },

  register: async (input: RegisterInput): Promise<User> => {
    return apiPost<User>("/auth/register", {
      name: input.name,
      email: input.email,
      password: input.password,
    });
  },

  getMe: async (): Promise<User> => {
    return apiGet<User>("/auth/me");
  },

  logout: async (): Promise<void> => {
    try {
      await apiPost<void>("/auth/logout");
    } finally {
      removeStoredToken();
    }
  },
};
