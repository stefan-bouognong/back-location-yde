import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || DB_PASSWORD === undefined || !DB_NAME) {
    console.error("Missing DB_HOST, DB_USER, DB_PASSWORD, or DB_NAME in .env");
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME.replace(/`/g, "")}\``);
  await conn.query(`USE \`${DB_NAME.replace(/`/g, "")}\``);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) NOT NULL PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDir = path.join(__dirname, "..", "migrations");
  const files = (await fs.readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const [rows] = await conn.query<mysql.RowDataPacket[]>(
      "SELECT 1 FROM _migrations WHERE name = ?",
      [file],
    );
    if (rows.length > 0) {
      console.log(`Skip ${file}`);
      continue;
    }
    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    await conn.query(sql);
    await conn.query("INSERT INTO _migrations (name) VALUES (?)", [file]);
    console.log(`Applied ${file}`);
  }

  await conn.end();
  console.log("Migrations done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
