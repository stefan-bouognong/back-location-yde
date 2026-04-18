import { Router } from "express";
import type { createPropertyController } from "../controllers/propertyController.js";
import { authenticate } from "../middleware/authenticate.js";
import type { Env } from "../config/env.js";

type PropCtrl = ReturnType<typeof createPropertyController>;

export function propertiesRoutes(env: Env, ctrl: PropCtrl) {
  const r = Router();
  r.get("/stats", ctrl.stats);
  r.get("/mine", authenticate(env), ctrl.mine);
  r.get("/", ctrl.list);
  r.get("/:id", ctrl.getById);
  r.post("/", authenticate(env), ctrl.create);
  r.patch("/:id", authenticate(env), ctrl.update);
  r.delete("/:id", authenticate(env), ctrl.remove);
  return r;
}
