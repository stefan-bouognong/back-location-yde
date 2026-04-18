import type { Request, Response } from "express";
import type { favoriteService } from "../services/favoriteService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

type FavSvc = ReturnType<typeof favoriteService>;

export function createFavoriteController(svc: FavSvc) {
  return {
    list: asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw new HttpError(401, "Unauthorized");
      res.json(await svc.listIds(req.user.id));
    }),

    listFull: asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw new HttpError(401, "Unauthorized");
      res.json(await svc.listProperties(req.user.id));
    }),

    add: asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw new HttpError(401, "Unauthorized");
      await svc.add(req.user.id, String(req.params.propertyId));
      res.status(204).send();
    }),

    remove: asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw new HttpError(401, "Unauthorized");
      await svc.remove(req.user.id, String(req.params.propertyId));
      res.status(204).send();
    }),
  };
}
