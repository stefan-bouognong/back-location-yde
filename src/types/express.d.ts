import type { UserRole } from "../validation/schemas.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: UserRole };
    }
  }
}

export {};
