import type { DbPool } from "../config/database.js";
import { propertyRepository } from "../repositories/propertyRepository.js";
import { HttpError } from "../utils/httpError.js";
import type { PropertyJson } from "../types/api.js";
import type { ListFilters } from "../repositories/propertyRepository.js";
import type { UserRole } from "../validation/schemas.js";

export function propertyService(pool: DbPool) {
  const props = propertyRepository(pool);

  return {
    list(filters: ListFilters): Promise<PropertyJson[]> {
      return props.findMany(filters);
    },

    async getById(idParam: string): Promise<PropertyJson> {
      const id = Number(idParam);
      if (!Number.isFinite(id)) throw new HttpError(400, "Invalid property id");
      const p = await props.findById(id);
      if (!p) throw new HttpError(404, "Property not found");
      return p;
    },

    async listMine(ownerIdStr: string): Promise<PropertyJson[]> {
      const ownerId = Number(ownerIdStr);
      if (!Number.isFinite(ownerId)) throw new HttpError(400, "Invalid user id");
      return props.findByOwnerId(ownerId);
    },

    async create(
      ownerIdStr: string,
      role: UserRole,
      body: {
        title: string;
        type: PropertyJson["type"];
        style: PropertyJson["style"];
        furnished: PropertyJson["furnished"];
        price: number;
        location: string;
        neighborhood: string;
        description: string;
        features: PropertyJson["features"];
        images: string[];
        isFeatured?: boolean;
      },
    ): Promise<PropertyJson> {
      if (role !== "owner") throw new HttpError(403, "Only owners can publish listings");
      const ownerId = Number(ownerIdStr);
      const id = await props.create({
        ownerId,
        title: body.title,
        type: body.type,
        style: body.style,
        furnished: body.furnished,
        price: body.price,
        location: body.location,
        neighborhood: body.neighborhood,
        description: body.description,
        features: body.features,
        isFeatured: body.isFeatured ?? false,
        images: body.images,
      });
      const created = await props.findById(id);
      if (!created) throw new HttpError(500, "Failed to load created property");
      return created;
    },

    async update(
      idParam: string,
      userIdStr: string,
      role: UserRole,
      body: Partial<{
        title: string;
        type: PropertyJson["type"];
        style: PropertyJson["style"];
        furnished: PropertyJson["furnished"];
        price: number;
        location: string;
        neighborhood: string;
        description: string;
        features: PropertyJson["features"];
        isFeatured: boolean;
        images: string[];
      }>,
    ): Promise<PropertyJson> {
      if (role !== "owner") throw new HttpError(403, "Only owners can update listings");
      const id = Number(idParam);
      if (!Number.isFinite(id)) throw new HttpError(400, "Invalid property id");
      const ownerId = await props.getOwnerId(id);
      if (ownerId === null) throw new HttpError(404, "Property not found");
      if (String(ownerId) !== userIdStr) throw new HttpError(403, "You can only edit your own listings");

      const ok = await props.update(id, body);
      if (!ok) throw new HttpError(404, "Property not found");
      const updated = await props.findById(id);
      if (!updated) throw new HttpError(500, "Failed to load property");
      return updated;
    },

    async remove(idParam: string, userIdStr: string, role: UserRole): Promise<void> {
      if (role !== "owner") throw new HttpError(403, "Only owners can delete listings");
      const id = Number(idParam);
      if (!Number.isFinite(id)) throw new HttpError(400, "Invalid property id");
      const ownerId = await props.getOwnerId(id);
      if (ownerId === null) throw new HttpError(404, "Property not found");
      if (String(ownerId) !== userIdStr) throw new HttpError(403, "You can only delete your own listings");
      const ok = await props.delete(id);
      if (!ok) throw new HttpError(404, "Property not found");
    },

    stats() {
      return props.stats();
    },

    neighborhoodsFromDb() {
      return props.distinctNeighborhoods();
    },
  };
}
