import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = resolveRequestId(req);
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}

function resolveRequestId(req: Request): string {
  const header = req.headers["x-request-id"];
  if (Array.isArray(header)) return header[0] ?? randomUUID();
  return header ?? randomUUID();
}