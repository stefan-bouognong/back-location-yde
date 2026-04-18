import { Router } from "express";
import type { createAuthController } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";
import type { Env } from "../config/env.js";

type AuthCtrl = ReturnType<typeof createAuthController>;

export function authRoutes(env: Env, ctrl: AuthCtrl) {
  const r = Router();
  r.post("/register", ctrl.register);
  r.post("/login", ctrl.login);
  r.get("/me", authenticate(env), ctrl.me);
  return r;
}
