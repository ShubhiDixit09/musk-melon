// src/lib/swytchcode/retry.ts
// Exponential backoff retry handler for transient API failures
import { getManifestConfig } from './config';

interface RetryOptions {
  maxAttempts?: number;
  backoffMs?: number;
  maxBackoffMs?: number;
  retryableStatusCodes?: number[];
}

interface RetryResult<T> {
  result: T;
  attempts: number;
  totalDurationMs: number;
}

/**
 * Execute a function with exponential backoff retries.
 * Reads defaults from .swytchcode/manifest.json execution config.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<RetryResult<T>> {
  const manifest = getManifestConfig();
  const maxAttempts = options?.maxAttempts ?? manifest.execution.retries.maxAttempts;
  const backoffMs = options?.backoffMs ?? manifest.execution.retries.backoffMs;
  const maxBackoffMs = options?.maxBackoffMs ?? manifest.execution.retries.maxBackoffMs;

  const startTime = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      return {
        result,
        attempts: attempt,
        totalDurationMs: Date.now() - startTime
      };
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      const isRetryable = isRetryableError(error, options?.retryableStatusCodes ?? manifest.execution.retries.retryableStatusCodes);

      if (!isRetryable || attempt === maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff + jitter
      const delay = Math.min(
        backoffMs * Math.pow(2, attempt - 1) + Math.random() * 500,
        maxBackoffMs
      );

      console.warn(`[Swytchcode Retry] Attempt ${attempt}/${maxAttempts} failed. Retrying in ${Math.round(delay)}ms...`);
      await sleep(delay);
    }
  }

  throw lastError || new Error('All retry attempts exhausted');
}

function isRetryableError(error: unknown, retryableCodes: number[]): boolean {
  if (error && typeof error === 'object') {
    const statusCode = (error as Record<string, unknown>).status ?? 
                       (error as Record<string, unknown>).statusCode ??
                       (error as Record<string, unknown>).code;
    if (typeof statusCode === 'number' && retryableCodes.includes(statusCode)) {
      return true;
    }
    // Network errors are always retryable
    const message = (error as Error).message || '';
    if (message.includes('ECONNRESET') || message.includes('ETIMEDOUT') || message.includes('ENOTFOUND') || message.includes('fetch failed')) {
      return true;
    }
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Generate a unique idempotency key for mutating operations */
export function generateIdempotencyKey(toolName: string, input: Record<string, unknown>): string {
  const crypto = require('node:crypto');
  const payload = JSON.stringify({ tool: toolName, input, timestamp: Math.floor(Date.now() / 60000) }); // 1-min window
  return `swy_${crypto.createHash('sha256').update(payload).digest('hex').slice(0, 24)}`;
}
