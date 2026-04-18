import { Router } from "express";
import type { createFavoriteController } from "../controllers/favoriteController.js";
import { authenticate } from "../middleware/authenticate.js";
import type { Env } from "../config/env.js";

type FavCtrl = ReturnType<typeof createFavoriteController>;

export function favoritesRoutes(env: Env, ctrl: FavCtrl) {
  const r = Router();
  r.use(authenticate(env));
  r.get("/", ctrl.listFull);
  r.post("/:propertyId", ctrl.add);
  r.delete("/:propertyId", ctrl.remove);
  return r;
}
