import type { Request, Response } from "express";
import type { propertyService } from "../services/propertyService.js";
import {
  createPropertySchema,
  listPropertiesQuerySchema,
  updatePropertySchema,
} from "../validation/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

type PropSvc = ReturnType<typeof propertyService>;

export function createPropertyController(svc: PropSvc) {
  return {
    list: asyncHandler(async (req: Request, res: Response) => {
      const q = listPropertiesQuerySchema.parse(req.query);
      const list = await svc.list({
        neighborhood: q.neighborhood,
        location: q.location,
        type: q.type,
        furnished: q.furnished,
        priceMin: q.priceMin,
        priceMax: q.priceMax,
        sortBy: q.sortBy,
      });
      res.json(list);
    }),

    stats: asyncHandler(async (_req: Request, res: Response) => {
      res.json(await svc.stats());
    }),

    mine: asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw new HttpError(401, "Unauthorized");
      res.json(await svc.listMine(req.user.id));
    }),

    getById: asyncHandler(async (req: Request, res: Response) => {
      const id = String(req.params.id);
      res.json(await svc.getById(id));
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw new HttpError(401, "Unauthorized");
      const body = createPropertySchema.parse(req.body);
      const created = await svc.create(req.user.id, req.user.role, {
        ...body,
        isFeatured: body.isFeatured,
      });
      res.status(201).json(created);
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw new HttpError(401, "Unauthorized");
      const body = updatePropertySchema.parse(req.body);
      if (Object.keys(body).length === 0) {
        throw new HttpError(400, "No fields to update");
      }
      const updated = await svc.update(String(req.params.id), req.user.id, req.user.role, body);
      res.json(updated);
    }),

    remove: asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw new HttpError(401, "Unauthorized");
      await svc.remove(String(req.params.id), req.user.id, req.user.role);
      res.status(204).send();
    }),
  };
}
