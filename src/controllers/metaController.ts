import type { Request, Response } from "express";
import type { metaService } from "../services/metaService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

type MetaSvc = ReturnType<typeof metaService>;

export function createMetaController(svc: MetaSvc) {
  return {
    neighborhoods: asyncHandler(async (_req: Request, res: Response) => {
      res.json(await svc.neighborhoods());
    }),
  };
}
