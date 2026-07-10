import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/asyncHandler";
import { getPagination } from "../../shared/pagination";
import { requireUser } from "../../middlewares/authorize";
import type { ChangePasswordInput, UpdateUserInput } from "./user.validation";
import * as userService from "./user.service";

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req.query);
  const { users, meta } = await userService.listUsers({
    pagination,
    status: asString(req.query.status),
    role: asString(req.query.role),
    includeParcels: Boolean(req.query.includeParcels),
  });

  res.status(200).json({ status: "success", data: users, pagination: meta });
});

export const findUserById = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ status: "success", data: user });
  },
);

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(
    req.params.id,
    req.body as UpdateUserInput,
  );
  res.status(200).json({ status: "success", data: user });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id);
  res
    .status(200)
    .json({ status: "success", message: "User deleted successfully" });
});

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body as ChangePasswordInput;
    await userService.changePassword(req.params.id, currentPassword, newPassword);
    res
      .status(200)
      .json({ status: "success", message: "Password changed successfully" });
  },
);

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = requireUser(req);
  const user = await userService.getProfile(id);
  res.status(200).json({ status: "success", data: user });
});
