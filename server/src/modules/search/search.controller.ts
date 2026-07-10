import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/asyncHandler";
import { getPagination } from "../../shared/pagination";
import { requireUser } from "../../middlewares/authorize";
import * as searchService from "./search.service";
import type { AdvancedSearchInput } from "./search.validation";

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const requester = requireUser(req);
  const { users, meta } = await searchService.searchUsers({
    q: asString(req.query.q) ?? "",
    requester,
    pagination: getPagination(req.query),
  });
  res.status(200).json({ status: "success", data: users, pagination: meta });
});

export const searchParcels = asyncHandler(
  async (req: Request, res: Response) => {
    const requester = requireUser(req);
    const { parcels, meta } = await searchService.searchParcels({
      q: asString(req.query.q) ?? "",
      requester,
      pagination: getPagination(req.query),
    });
    res.status(200).json({ status: "success", data: parcels, pagination: meta });
  },
);

export const advancedSearch = asyncHandler(
  async (req: Request, res: Response) => {
    const requester = requireUser(req);
    const { results, meta } = await searchService.advancedSearch(
      req.body as AdvancedSearchInput,
      requester,
    );
    res.status(200).json({ status: "success", data: results, pagination: meta });
  },
);
