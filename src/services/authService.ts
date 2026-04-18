import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Env } from "../config/env.js";
import { userRepository } from "../repositories/userRepository.js";
import { HttpError } from "../utils/httpError.js";
import type { UserJson } from "../types/api.js";
import type { UserRole } from "../validation/schemas.js";
import type { DbPool } from "../config/database.js";

const SALT_ROUNDS = 10;

function toUserJson(row: { id: number; email: string; name: string; phone: string; role: UserRole; avatar: string | null }): UserJson {
  return {
    id: String(row.id),
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.role,
    ...(row.avatar ? { avatar: row.avatar } : {}),
  };
}

export function authService(pool: DbPool, env: Env) {
  const users = userRepository(pool);

  function signToken(user: { id: number; email: string; role: UserRole }) {
    return jwt.sign(
      { sub: String(user.id), email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    );
  }

  return {
    async register(input: { name: string; email: string; phone: string; password: string }): Promise<{ user: UserJson; token: string }> {
      const existing = await users.findByEmail(input.email.toLowerCase());
      if (existing) throw new HttpError(409, "Email already registered");

      const password_hash = await bcrypt.hash(input.password, SALT_ROUNDS);
      const id = await users.create({
        email: input.email.toLowerCase(),
        password_hash,
        name: input.name,
        phone: input.phone,
        whatsapp: null,
        role: "user",
      });
      const userRow = await users.findById(id);
      if (!userRow) throw new HttpError(500, "Registration failed");
      const user = toUserJson(userRow);
      const token = signToken({ id, email: userRow.email, role: userRow.role });
      return { user, token };
    },

    async login(input: { email: string; password: string }): Promise<{ user: UserJson; token: string }> {
      const row = await users.findByEmail(input.email.toLowerCase());
      if (!row) throw new HttpError(401, "Invalid email or password");
      const ok = await bcrypt.compare(input.password, row.password_hash);
      if (!ok) throw new HttpError(401, "Invalid email or password");
      const user = toUserJson(row);
      const token = signToken({ id: row.id, email: row.email, role: row.role });
      return { user, token };
    },

    async me(userId: string): Promise<UserJson> {
      const id = Number(userId);
      if (!Number.isFinite(id)) throw new HttpError(400, "Invalid user id");
      const row = await users.findById(id);
      if (!row) throw new HttpError(404, "User not found");
      return toUserJson(row);
    },
  };
}
