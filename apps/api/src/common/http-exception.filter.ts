import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class ApiHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const requestId = getRequestId(request);

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : null;
    const details = typeof payload === "object" && payload !== null ? payload : undefined;

    response.setHeader("X-Request-Id", requestId);
    response.status(status).json({
      error: {
        code: resolveCode(status, details),
        message: resolveMessage(status, payload),
        requestId,
        ...(details ? { details } : {}),
      },
    });
  }
}

function getRequestId(request: Request): string {
  const header = request.headers["x-request-id"];
  if (Array.isArray(header)) return header[0] ?? "req_unknown";
  return header ?? "req_unknown";
}

function resolveCode(status: number, details: unknown): string {
  if (typeof details === "object" && details !== null && "error" in details) {
    const error = (details as { error?: unknown }).error;
    if (typeof error === "string" && error.length > 0) return error.toUpperCase().replaceAll(" ", "_");
  }

  return HttpStatus[status] ?? "INTERNAL_SERVER_ERROR";
}

function resolveMessage(status: number, payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (typeof payload === "object" && payload !== null && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join("; ");
    if (typeof message === "string") return message;
  }
  return status === HttpStatus.INTERNAL_SERVER_ERROR ? "Unexpected server failure." : "Request failed.";
}