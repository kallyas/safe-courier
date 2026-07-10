import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/asyncHandler";
import { extractToken } from "../../middlewares/authenticate";
import { loginUser, registerUser, revokeToken } from "./auth.service";
import type { LoginInput, SignupInput } from "./auth.validation";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { token } = await registerUser(req.body as SignupInput);
  res.status(201).json({
    status: "success",
    message: "User created successfully",
    token,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body as LoginInput;
  const { token } = await loginUser(username, password);
  res.status(200).json({
    status: "success",
    message: "Logged in successfully",
    token,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = extractToken(req.headers.authorization);
  if (token) await revokeToken(token);
  res.status(200).json({ message: "Logged out successfully" });
});

export const verify = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Token is valid",
    user: req.user,
  });
});
