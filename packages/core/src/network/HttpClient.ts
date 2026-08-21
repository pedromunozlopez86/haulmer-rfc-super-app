export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  correlationId?: string;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  correlationId: string;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly correlationId: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class NetworkTimeoutError extends Error {
  constructor(public readonly correlationId: string) {
    super('Network request timed out');
    this.name = 'NetworkTimeoutError';
  }
}

const CLIENT_VERSION = '0.1.0';
const DEFAULT_TIMEOUT_MS = 10_000;

export function createUuid(): string {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

export async function httpClient<T>(
  url: string,
  options: RequestOptions = {},
): Promise<HttpResponse<T>> {
  const correlationId = options.correlationId ?? createUuid();
  const requestId = createUuid();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-correlation-id': correlationId,
    'x-request-id': requestId,
    'x-client-version': CLIENT_VERSION,
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new HttpError(response.status, `HTTP ${response.status}`, correlationId);
    }

    const data = (await response.json()) as T;
    return { data, status: response.status, correlationId };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if ((err as Error).name === 'AbortError') {
      throw new NetworkTimeoutError(correlationId);
    }
    throw err;
  } finally {
    clearTimeout(timeoutHandle);
  }
}
