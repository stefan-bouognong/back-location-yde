import "dotenv/config";
import { loadEnv } from "./config/env.js";
import { createPool } from "./config/database.js";
import { createApp } from "./app.js";

const env = loadEnv();
const pool = createPool(env);
const app = createApp(env, pool);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
