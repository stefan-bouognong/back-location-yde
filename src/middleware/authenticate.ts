import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import type { UserRole } from "../validation/schemas.js";

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export function authenticate(env: Env) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return next(new HttpError(401, "Missing or invalid authorization header"));
    }
    const token = header.slice(7);
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
      next();
    } catch {
      next(new HttpError(401, "Invalid or expired token"));
    }
  };
}

export function optionalAuthenticate(env: Env) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return next();
    const token = header.slice(7);
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      /* ignore */
    }
    next();
  };
}
