import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

/**
 * Build a middleware that validates and (for the body) normalizes a part of the
 * request against a Zod schema. Unknown keys are stripped, defaults applied, and
 * the parsed value is written back so downstream handlers get typed, clean data.
 *
 * The error response shape is kept stable: `{ status, statusCode, message,
 * errors: [{ message, path }] }`.
 */
export function validate(
  schema: ZodSchema,
  part: RequestPart = "body",
): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const errors = (result.error as ZodError).issues.map((issue) => ({
        message: issue.message,
        path: issue.path,
      }));

      res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Validation error",
        errors,
      });
      return;
    }

    // `query`/`params` are read-only getters in Express 5; only the body is
    // safe to reassign, which is also the only part we normalize.
    if (part === "body") {
      req.body = result.data;
    }
    next();
  };
}
