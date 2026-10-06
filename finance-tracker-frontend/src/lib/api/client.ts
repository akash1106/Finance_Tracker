import axios, { type AxiosRequestConfig, type AxiosError } from "axios";
import { getStoredToken } from "@/features/auth/auth.utils";
import type { ApiResponse, ApiErrorResponse, PaginationMeta } from "@/types/api";

/**
 * Custom error class for API errors with backend status and code information.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown[];

  constructor(statusCode: number, code: string, message: string, details?: unknown[]) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Base Axios client configured for both HttpOnly cookie authentication and token fallbacks.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach bearer token fallback if available
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = getStoredToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Transform errors into unified ApiError
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;
      const errorCode = data?.error?.code || `HTTP_${status}`;
      const errorMessage =
        data?.error?.message || error.message || "An unexpected error occurred";
      const details = data?.error?.details;

      return Promise.reject(new ApiError(status, errorCode, errorMessage, details));
    }

    if (error.request) {
      return Promise.reject(
        new ApiError(
          0,
          "NETWORK_ERROR",
          "Unable to connect to the server. Please check your internet connection."
        )
      );
    }

    return Promise.reject(
      new ApiError(500, "REQUEST_SETUP_ERROR", error.message || "An unknown error occurred")
    );
  }
);

/**
 * Standard typed GET request unwrapping response.data.data
 */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, config);
  return response.data.data;
}

/**
 * Typed paginated GET request returning both items and pagination metadata
 */
export async function apiGetPaginated<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<{ items: T[]; pagination: PaginationMeta }> {
  const response = await apiClient.get<ApiResponse<T[]>>(url, config);
  return {
    items: response.data.data,
    pagination: response.data.pagination || {
      page: 1,
      limit: response.data.data?.length || 0,
      total: response.data.data?.length || 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}

/**
 * Standard typed POST request unwrapping response.data.data
 */
export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

/**
 * Standard typed PUT request unwrapping response.data.data
 */
export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

/**
 * Standard typed PATCH request unwrapping response.data.data
 */
export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

/**
 * Standard typed DELETE request unwrapping response.data.data
 */
export async function apiDelete<T = void>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url, config);
  return response.data.data;
}
