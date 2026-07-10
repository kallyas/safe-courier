export type UserRole = "user" | "admin" | "courier";

/**
 * Shape of the decoded JWT attached to authenticated requests.
 */
export interface AuthPayload {
  id: string;
  username: string;
  role: UserRole;
  isAdmin: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pages: number;
  limit: number;
}
