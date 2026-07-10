import axios, { AxiosError } from "axios";
import type { ApiErrorBody } from "@/types/api";
import { tokenStore, UNAUTHORIZED_EVENT } from "./token";

const baseURL = import.meta.env.VITE_API_URL ?? "/api/v1";

export const api = axios.create({ baseURL });

// Attach the bearer token to every request.
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 on an *authenticated* request means the session is no longer valid —
// clear it and let the app react (redirect to login). A 401 without a stored
// token (e.g. a failed login attempt) is left for the caller to handle.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && tokenStore.get()) {
      tokenStore.clear();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);

/** Extract a human-readable message from any thrown API error. */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.errors?.length) return body.errors[0].message;
    if (body?.message) return body.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
