import { api } from "@/lib/apiClient";
import type {
  AuthResponse,
  ItemResponse,
  MessageResponse,
  User,
} from "@/types/api";

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export const authApi = {
  signup: (payload: SignupPayload) =>
    api.post<AuthResponse>("/auth/signup", payload).then((r) => r.data),
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload).then((r) => r.data),
  logout: () => api.post<MessageResponse>("/auth/logout").then((r) => r.data),
  profile: () =>
    api.get<ItemResponse<User>>("/profile").then((r) => r.data.data),
};
