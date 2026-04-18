import type { DbPool } from "../config/database.js";
import { favoriteRepository } from "../repositories/favoriteRepository.js";
import { propertyRepository } from "../repositories/propertyRepository.js";
import { HttpError } from "../utils/httpError.js";
import type { PropertyJson } from "../types/api.js";

export function favoriteService(pool: DbPool) {
  const fav = favoriteRepository(pool);
  const props = propertyRepository(pool);

  return {
    async listIds(userIdStr: string): Promise<string[]> {
      const userId = Number(userIdStr);
      if (!Number.isFinite(userId)) throw new HttpError(400, "Invalid user id");
      return fav.listPropertyIds(userId);
    },

    async listProperties(userIdStr: string): Promise<PropertyJson[]> {
      const userId = Number(userIdStr);
      if (!Number.isFinite(userId)) throw new HttpError(400, "Invalid user id");
      const ids = await fav.listPropertyIds(userId);
      const out: PropertyJson[] = [];
      for (const idStr of ids) {
        const id = Number(idStr);
        const p = await props.findById(id);
        if (p) out.push(p);
      }
      return out;
    },

    async add(userIdStr: string, propertyIdParam: string): Promise<void> {
      const userId = Number(userIdStr);
      const propertyId = Number(propertyIdParam);
      if (!Number.isFinite(userId) || !Number.isFinite(propertyId)) {
        throw new HttpError(400, "Invalid id");
      }
      const exists = await fav.existsProperty(propertyId);
      if (!exists) throw new HttpError(404, "Property not found");
      await fav.add(userId, propertyId);
    },

    async remove(userIdStr: string, propertyIdParam: string): Promise<void> {
      const userId = Number(userIdStr);
      const propertyId = Number(propertyIdParam);
      if (!Number.isFinite(userId) || !Number.isFinite(propertyId)) {
        throw new HttpError(400, "Invalid id");
      }
      await fav.remove(userId, propertyId);
    },
  };
}
