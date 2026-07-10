import type { AuthPayload } from "../shared/types";

declare global {
  namespace Express {
    interface Request {
      /** Populated by the `authenticate` middleware for protected routes. */
      user?: AuthPayload;
    }
  }
}

export {};
