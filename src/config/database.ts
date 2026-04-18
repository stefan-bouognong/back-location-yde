import mysql from "mysql2/promise";
import type { Env } from "./env.js";

export function createPool(env: Env) {
  return mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });
}

export type DbPool = ReturnType<typeof createPool>;
