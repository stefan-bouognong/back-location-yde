import type { Request, Response } from "express";
import type { authService } from "../services/authService.js";
import { loginBodySchema, registerBodySchema } from "../validation/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";

type AuthSvc = ReturnType<typeof authService>;

export function createAuthController(auth: AuthSvc) {
  return {
    register: asyncHandler(async (req: Request, res: Response) => {
      const body = registerBodySchema.parse(req.body);
      const result = await auth.register(body);
      res.status(201).json(result);
    }),

    login: asyncHandler(async (req: Request, res: Response) => {
      const body = loginBodySchema.parse(req.body);
      const result = await auth.login(body);
      res.json(result);
    }),

    me: asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const user = await auth.me(req.user.id);
      res.json(user);
    }),
  };
}
