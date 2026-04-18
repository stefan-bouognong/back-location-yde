import { Router } from "express";
import type { createMetaController } from "../controllers/metaController.js";

type MetaCtrl = ReturnType<typeof createMetaController>;

export function metaRoutes(ctrl: MetaCtrl) {
  const r = Router();
  r.get("/neighborhoods", ctrl.neighborhoods);
  return r;
}
