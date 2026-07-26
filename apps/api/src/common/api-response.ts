export interface CursorPage {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface ListResponse<T> {
  data: T[];
  page: CursorPage;
}

export function listResponse<T>(
  data: T[],
  options: { limit?: number; cursor?: string | null; nextCursor?: string | null } = {},
): ListResponse<T> {
  const limit = clampLimit(options.limit);
  const nextCursor = options.nextCursor ?? inferNextCursor(data, limit);

  return {
    data,
    page: {
      nextCursor,
      hasMore: nextCursor !== null,
      limit,
    },
  };
}

export function normalizeCursorOffset(cursor?: string | null): number | undefined {
  if (!cursor) return undefined;
  const decoded = Number.parseInt(Buffer.from(cursor, "base64url").toString("utf8"), 10);
  return Number.isFinite(decoded) && decoded >= 0 ? decoded : undefined;
}

export function toOffsetCursor(offset: number): string {
  return Buffer.from(String(offset), "utf8").toString("base64url");
}

export function clampLimit(limit?: number, defaultLimit = 20, maxLimit = 100): number {
  if (!Number.isFinite(limit)) return defaultLimit;
  return Math.min(Math.max(Number(limit), 1), maxLimit);
}

function inferNextCursor<T>(data: T[], limit: number): string | null {
  if (data.length < limit) return null;
  return toOffsetCursor(data.length);
}