import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type { DbPool } from "../config/database.js";
import type { PropertyJson } from "../types/api.js";
import type { FurnishedStatus, PropertyStyle, PropertyType, SortBy } from "./propertyTypes.js";

export type { PropertyType, PropertyStyle, FurnishedStatus, SortBy };

interface PropertyListRow extends RowDataPacket {
  id: number;
  owner_id: number;
  title: string;
  type: PropertyType;
  style: PropertyStyle;
  furnished: FurnishedStatus;
  price: number;
  location: string;
  neighborhood: string;
  description: string;
  feat_water: number;
  feat_electricity: number;
  feat_wifi: number;
  feat_parking: number;
  feat_security: number;
  feat_kitchen: number;
  views: number;
  contacts: number;
  is_featured: number;
  created_at: Date;
  owner_name: string;
  owner_phone: string;
  owner_whatsapp: string | null;
}

interface ImageRow extends RowDataPacket {
  property_id: number;
  url: string;
}

function rowToJson(row: PropertyListRow, images: string[]): PropertyJson {
  const whatsapp = row.owner_whatsapp?.trim() || row.owner_phone.replace(/\s/g, "");
  return {
    id: String(row.id),
    title: row.title,
    type: row.type,
    style: row.style,
    furnished: row.furnished,
    price: row.price,
    location: row.location,
    neighborhood: row.neighborhood,
    description: row.description,
    images,
    features: {
      water: Boolean(row.feat_water),
      electricity: Boolean(row.feat_electricity),
      wifi: Boolean(row.feat_wifi),
      parking: Boolean(row.feat_parking),
      security: Boolean(row.feat_security),
      kitchen: Boolean(row.feat_kitchen),
    },
    owner: {
      name: row.owner_name,
      phone: row.owner_phone,
      whatsapp,
    },
    views: row.views,
    contacts: row.contacts,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString().slice(0, 10)
        : String(row.created_at).slice(0, 10),
    isFeatured: Boolean(row.is_featured),
  };
}

async function loadImagesMap(pool: DbPool, ids: number[]): Promise<Map<number, string[]>> {
  const map = new Map<number, string[]>();
  if (ids.length === 0) return map;
  const placeholders = ids.map(() => "?").join(",");
  const [imgRows] = await pool.query<ImageRow[]>(
    `SELECT property_id, url FROM property_images WHERE property_id IN (${placeholders}) ORDER BY sort_order ASC, id ASC`,
    ids,
  );
  for (const r of imgRows) {
    const list = map.get(r.property_id) ?? [];
    list.push(r.url);
    map.set(r.property_id, list);
  }
  return map;
}

export interface ListFilters {
  neighborhood?: string;
  location?: string;
  type?: PropertyType;
  furnished?: FurnishedStatus;
  priceMin?: number;
  priceMax?: number;
  sortBy: SortBy;
}

export function propertyRepository(pool: DbPool) {
  return {
    async findById(id: number): Promise<PropertyJson | null> {
      const [rows] = await pool.query<PropertyListRow[]>(
        `SELECT p.*, u.name AS owner_name, u.phone AS owner_phone, u.whatsapp AS owner_whatsapp
         FROM properties p
         JOIN users u ON u.id = p.owner_id
         WHERE p.id = ? LIMIT 1`,
        [id],
      );
      const row = rows[0];
      if (!row) return null;
      const imgMap = await loadImagesMap(pool, [id]);
      return rowToJson(row, imgMap.get(id) ?? []);
    },

    async findMany(filters: ListFilters): Promise<PropertyJson[]> {
      const cond: string[] = ["1=1"];
      const params: unknown[] = [];

      if (filters.neighborhood) {
        cond.push("p.neighborhood = ?");
        params.push(filters.neighborhood);
      }
      if (filters.location) {
        cond.push("p.location = ?");
        params.push(filters.location);
      }
      if (filters.type) {
        cond.push("p.type = ?");
        params.push(filters.type);
      }
      if (filters.furnished) {
        cond.push("p.furnished = ?");
        params.push(filters.furnished);
      }
      if (filters.priceMin !== undefined) {
        cond.push("p.price >= ?");
        params.push(filters.priceMin);
      }
      if (filters.priceMax !== undefined) {
        cond.push("p.price <= ?");
        params.push(filters.priceMax);
      }

      let order = "p.created_at DESC";
      if (filters.sortBy === "price-asc") order = "p.price ASC";
      if (filters.sortBy === "price-desc") order = "p.price DESC";
      if (filters.sortBy === "newest") order = "p.created_at DESC";

      const [rows] = await pool.query<PropertyListRow[]>(
        `SELECT p.*, u.name AS owner_name, u.phone AS owner_phone, u.whatsapp AS owner_whatsapp
         FROM properties p
         JOIN users u ON u.id = p.owner_id
         WHERE ${cond.join(" AND ")}
         ORDER BY ${order}`,
        params,
      );
      const ids = rows.map((r) => r.id);
      const imgMap = await loadImagesMap(pool, ids);
      return rows.map((r) => rowToJson(r, imgMap.get(r.id) ?? []));
    },

    async findByOwnerId(ownerId: number): Promise<PropertyJson[]> {
      const [rows] = await pool.query<PropertyListRow[]>(
        `SELECT p.*, u.name AS owner_name, u.phone AS owner_phone, u.whatsapp AS owner_whatsapp
         FROM properties p
         JOIN users u ON u.id = p.owner_id
         WHERE p.owner_id = ?
         ORDER BY p.created_at DESC`,
        [ownerId],
      );
      const ids = rows.map((r) => r.id);
      const imgMap = await loadImagesMap(pool, ids);
      return rows.map((r) => rowToJson(r, imgMap.get(r.id) ?? []));
    },

    async create(data: {
      ownerId: number;
      title: string;
      type: PropertyType;
      style: PropertyStyle;
      furnished: FurnishedStatus;
      price: number;
      location: string;
      neighborhood: string;
      description: string;
      features: PropertyJson["features"];
      isFeatured: boolean;
      images: string[];
    }): Promise<number> {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [res] = await conn.execute<ResultSetHeader>(
          `INSERT INTO properties (
            owner_id, title, type, style, furnished, price, location, neighborhood, description,
            feat_water, feat_electricity, feat_wifi, feat_parking, feat_security, feat_kitchen,
            views, contacts, is_featured
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`,
          [
            data.ownerId,
            data.title,
            data.type,
            data.style,
            data.furnished,
            data.price,
            data.location,
            data.neighborhood,
            data.description,
            data.features.water ? 1 : 0,
            data.features.electricity ? 1 : 0,
            data.features.wifi ? 1 : 0,
            data.features.parking ? 1 : 0,
            data.features.security ? 1 : 0,
            data.features.kitchen ? 1 : 0,
            data.isFeatured ? 1 : 0,
          ],
        );
        const propertyId = res.insertId;
        let order = 0;
        for (const url of data.images) {
          await conn.execute(
            "INSERT INTO property_images (property_id, url, sort_order) VALUES (?, ?, ?)",
            [propertyId, url, order++],
          );
        }
        await conn.commit();
        return propertyId;
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    async update(
      id: number,
      data: Partial<{
        title: string;
        type: PropertyType;
        style: PropertyStyle;
        furnished: FurnishedStatus;
        price: number;
        location: string;
        neighborhood: string;
        description: string;
        features: PropertyJson["features"];
        isFeatured: boolean;
        images: string[];
      }>,
    ): Promise<boolean> {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [existing] = await conn.query<PropertyListRow[]>(
          "SELECT id FROM properties WHERE id = ? LIMIT 1",
          [id],
        );
        if (!existing[0]) {
          await conn.rollback();
          return false;
        }

        const sets: string[] = [];
        const vals: unknown[] = [];
        const set = (col: string, v: unknown) => {
          sets.push(`${col} = ?`);
          vals.push(v);
        };

        if (data.title !== undefined) set("title", data.title);
        if (data.type !== undefined) set("type", data.type);
        if (data.style !== undefined) set("style", data.style);
        if (data.furnished !== undefined) set("furnished", data.furnished);
        if (data.price !== undefined) set("price", data.price);
        if (data.location !== undefined) set("location", data.location);
        if (data.neighborhood !== undefined) set("neighborhood", data.neighborhood);
        if (data.description !== undefined) set("description", data.description);
        if (data.isFeatured !== undefined) set("is_featured", data.isFeatured ? 1 : 0);
        if (data.features) {
          set("feat_water", data.features.water ? 1 : 0);
          set("feat_electricity", data.features.electricity ? 1 : 0);
          set("feat_wifi", data.features.wifi ? 1 : 0);
          set("feat_parking", data.features.parking ? 1 : 0);
          set("feat_security", data.features.security ? 1 : 0);
          set("feat_kitchen", data.features.kitchen ? 1 : 0);
        }

        if (sets.length > 0) {
          vals.push(id);
          await conn.query(`UPDATE properties SET ${sets.join(", ")} WHERE id = ?`, vals);
        }

        if (data.images) {
          await conn.execute("DELETE FROM property_images WHERE property_id = ?", [id]);
          let order = 0;
          for (const url of data.images) {
            await conn.execute(
              "INSERT INTO property_images (property_id, url, sort_order) VALUES (?, ?, ?)",
              [id, url, order++],
            );
          }
        }

        await conn.commit();
        return true;
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    async delete(id: number): Promise<boolean> {
      const [res] = await pool.execute<ResultSetHeader>("DELETE FROM properties WHERE id = ?", [id]);
      return res.affectedRows > 0;
    },

    async getOwnerId(id: number): Promise<number | null> {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT owner_id FROM properties WHERE id = ? LIMIT 1",
        [id],
      );
      const r = rows[0] as { owner_id: number } | undefined;
      return r ? r.owner_id : null;
    },

    async stats(): Promise<{
      room: number;
      studio: number;
      apartment: number;
      furnished: number;
    }> {
      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT
          SUM(type = 'room') AS room,
          SUM(type = 'studio') AS studio,
          SUM(type = 'apartment') AS apartment,
          SUM(furnished = 'furnished') AS furnished
        FROM properties
      `);
      const r = rows[0] as Record<string, number | null>;
      return {
        room: Number(r.room) || 0,
        studio: Number(r.studio) || 0,
        apartment: Number(r.apartment) || 0,
        furnished: Number(r.furnished) || 0,
      };
    },

    async distinctNeighborhoods(): Promise<string[]> {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT DISTINCT neighborhood FROM properties ORDER BY neighborhood ASC",
      );
      return (rows as { neighborhood: string }[]).map((x) => x.neighborhood);
    },
  };
}
