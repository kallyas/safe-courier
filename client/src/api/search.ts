import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import type { ListResponse, Parcel, User } from "@/types/api";

const MIN_QUERY = 2;

export const searchApi = {
  users: (q: string) =>
    api
      .get<ListResponse<User>>("/users/search", { params: { q } })
      .then((r) => r.data),
  parcels: (q: string) =>
    api
      .get<ListResponse<Parcel>>("/parcels/search", { params: { q } })
      .then((r) => r.data),
};

export function useParcelSearch(q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: ["search", "parcels", term],
    queryFn: () => searchApi.parcels(term),
    enabled: term.length >= MIN_QUERY,
  });
}

export function useUserSearch(q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: ["search", "users", term],
    queryFn: () => searchApi.users(term),
    enabled: term.length >= MIN_QUERY,
  });
}
