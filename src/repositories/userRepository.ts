import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type { DbPool } from "../config/database.js";
import type { UserRole } from "../validation/schemas.js";

export interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  role: UserRole;
  avatar: string | null;
}

export function userRepository(pool: DbPool) {
  return {
    async findByEmail(email: string): Promise<UserRow | null> {
      const [rows] = await pool.query<UserRow[]>(
        "SELECT id, email, password_hash, name, phone, whatsapp, role, avatar FROM users WHERE email = ? LIMIT 1",
        [email],
      );
      return rows[0] ?? null;
    },

    async findById(id: number): Promise<UserRow | null> {
      const [rows] = await pool.query<UserRow[]>(
        "SELECT id, email, password_hash, name, phone, whatsapp, role, avatar FROM users WHERE id = ? LIMIT 1",
        [id],
      );
      return rows[0] ?? null;
    },

    async create(data: {
      email: string;
      password_hash: string;
      name: string;
      phone: string;
      whatsapp?: string | null;
      role: UserRole;
    }): Promise<number> {
      const [res] = await pool.execute<ResultSetHeader>(
        `INSERT INTO users (email, password_hash, name, phone, whatsapp, role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.email,
          data.password_hash,
          data.name,
          data.phone,
          data.whatsapp ?? null,
          data.role,
        ],
      );
      return res.insertId;
    },
  };
}
