import express from "express";
import cors from "cors";
import type { Env } from "./config/env.js";
import type { DbPool } from "./config/database.js";
import { authService } from "./services/authService.js";
import { propertyService } from "./services/propertyService.js";
import { favoriteService } from "./services/favoriteService.js";
import { metaService } from "./services/metaService.js";
import { createAuthController } from "./controllers/authController.js";
import { createPropertyController } from "./controllers/propertyController.js";
import { createFavoriteController } from "./controllers/favoriteController.js";
import { createMetaController } from "./controllers/metaController.js";
import { authRoutes } from "./routes/auth.routes.js";
import { propertiesRoutes } from "./routes/properties.routes.js";
import { favoritesRoutes } from "./routes/favorites.routes.js";
import { metaRoutes } from "./routes/meta.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp(env: Env, pool: DbPool) {
  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  const auth = authService(pool, env);
  const props = propertyService(pool);
  const favs = favoriteService(pool);
  const meta = metaService(() => props.neighborhoodsFromDb());

  const authCtrl = createAuthController(auth);
  const propCtrl = createPropertyController(props);
  const favCtrl = createFavoriteController(favs);
  const metaCtrl = createMetaController(meta);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRoutes(env, authCtrl));
  app.use("/api/properties", propertiesRoutes(env, propCtrl));
  app.use("/api/favorites", favoritesRoutes(env, favCtrl));
  app.use("/api/meta", metaRoutes(metaCtrl));

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(errorHandler);

  return app;
}
