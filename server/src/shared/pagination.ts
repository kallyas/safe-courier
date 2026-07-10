import type { PaginationMeta } from "./types";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parse `page` / `limit` query parameters into safe, bounded values.
 */
export function getPagination(query: {
  page?: unknown;
  limit?: unknown;
}): PaginationParams {
  const page = Math.max(DEFAULT_PAGE, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(query.limit) || DEFAULT_LIMIT),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginationMeta(
  total: number,
  { page, limit }: PaginationParams,
): PaginationMeta {
  return {
    total,
    page,
    pages: Math.ceil(total / limit) || 0,
    limit,
  };
}
