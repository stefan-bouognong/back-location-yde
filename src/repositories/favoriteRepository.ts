import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type { DbPool } from "../config/database.js";

export function favoriteRepository(pool: DbPool) {
  return {
    async listPropertyIds(userId: number): Promise<string[]> {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT property_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
      );
      return (rows as { property_id: number }[]).map((r) => String(r.property_id));
    },

    async add(userId: number, propertyId: number): Promise<void> {
      await pool.execute(
        "INSERT IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)",
        [userId, propertyId],
      );
    },

    async remove(userId: number, propertyId: number): Promise<boolean> {
      const [res] = await pool.execute<ResultSetHeader>(
        "DELETE FROM favorites WHERE user_id = ? AND property_id = ?",
        [userId, propertyId],
      );
      return res.affectedRows > 0;
    },

    async existsProperty(propertyId: number): Promise<boolean> {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT 1 FROM properties WHERE id = ? LIMIT 1",
        [propertyId],
      );
      return rows.length > 0;
    },
  };
}
