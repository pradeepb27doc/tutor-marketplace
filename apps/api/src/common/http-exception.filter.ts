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

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
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
      return;
    }

    if (isApplicationError(exception)) {
      response.setHeader("X-Request-Id", requestId);
      response.status(exception.statusCode).json({
        error: {
          code: exception.code,
          message: exception.message,
          requestId,
        },
      });
      return;
    }

    response.setHeader("X-Request-Id", requestId);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected server failure.",
        requestId,
      },
    });
  }
}

function isApplicationError(error: unknown): error is { statusCode: number; code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as { statusCode: unknown }).statusCode === "number" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
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