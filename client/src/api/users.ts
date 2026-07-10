import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { authApi } from "@/auth/authApi";
import type {
  ItemResponse,
  ListResponse,
  MessageResponse,
  User,
  UserRole,
  UserStatus,
} from "@/types/api";

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userKeys = {
  all: ["users"] as const,
  list: (params: UserListParams) => ["users", "list", params] as const,
  detail: (id: string) => ["users", "detail", id] as const,
  profile: ["profile"] as const,
};

export const usersApi = {
  list: (params: UserListParams) =>
    api.get<ListResponse<User>>("/users", { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<ItemResponse<User>>(`/user/${id}`).then((r) => r.data.data),
  update: (id: string, body: UpdateUserPayload) =>
    api.put<ItemResponse<User>>(`/user/${id}`, body).then((r) => r.data.data),
  remove: (id: string) =>
    api.delete<MessageResponse>(`/user/${id}`).then((r) => r.data),
  changePassword: (id: string, body: ChangePasswordPayload) =>
    api
      .put<MessageResponse>(`/user/${id}/password`, body)
      .then((r) => r.data),
};

export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile,
    queryFn: authApi.profile,
  });
}

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUserPayload) => usersApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.profile });
      qc.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

export function useChangePassword(id: string) {
  return useMutation({
    mutationFn: (body: ChangePasswordPayload) =>
      usersApi.changePassword(id, body),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}
