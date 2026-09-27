import { NextResponse } from 'next/server';
import { sanitizeForLogging as _sanitize } from './log';

/**
 * Returns a safe error message that doesn't expose internal details in production
 */
export function safeErrorMessage(error: unknown, fallbackMessage = 'An error occurred'): string {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : String(error);
  }
  return fallbackMessage;
}

/**
 * Creates a standardized error response
 * In production, only returns the user-friendly message
 * In development, includes debug information
 */
export function errorResponse(
  error: unknown,
  userMessage = 'An error occurred',
  status = 500
): NextResponse {
  const body: { error: string; debug?: string } = {
    error: userMessage,
  };

  // Only include debug info in development
  if (process.env.NODE_ENV === 'development') {
    body.debug = error instanceof Error ? error.message : String(error);
  }

  // Log the actual error server-side (but sanitize PII)
  console.error(`[API Error] ${userMessage}:`, _sanitize(error instanceof Error ? error.message : String(error)));

  return NextResponse.json(body, { status });
}

/**
 * Creates a standardized success response
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export { sanitizeForLogging } from './log';
