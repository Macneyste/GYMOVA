import type { ApiErrorBody, ApiResponse, AuthTokens } from '@gymova/shared-types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(status: number, body: ApiErrorBody['error']) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.details = body.details;
    this.requestId = body.requestId;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export interface TokenStorage {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(tokens: AuthTokens): Promise<void>;
  clear(): Promise<void>;
}

export interface HttpClientOptions {
  baseUrl: string;
  tokens: TokenStorage;
  /** Called when the refresh token is rejected; the app should sign the user out. */
  onSessionExpired?: () => void | Promise<void>;
  /** Extra headers (e.g. Accept-Language, X-Client-Version). Evaluated per request. */
  headers?: () => Record<string, string> | Promise<Record<string, string>>;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** multipart body; sets no content-type so the runtime adds the boundary */
  formData?: FormData;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  signal?: AbortSignal;
  idempotencyKey?: string;
}

export function buildQuery(query?: RequestOptions['query']): string {
  if (!query) return '';
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return params.length ? `?${params.join('&')}` : '';
}

/**
 * Fetch wrapper with bearer auth, automatic single-flight refresh-token rotation,
 * JSON envelope unwrapping and typed errors.
 */
export class HttpClient {
  private refreshing: Promise<boolean> | null = null;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly opts: HttpClientOptions) {
    this.fetchImpl = opts.fetchImpl ?? fetch.bind(globalThis);
  }

  get baseUrl(): string {
    return this.opts.baseUrl;
  }

  async request<T>(path: string, options: RequestOptions = {}, retried = false): Promise<T> {
    const { method = 'GET', body, formData, query, auth = true, signal, idempotencyKey } = options;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(await this.opts.headers?.()),
    };
    if (!formData) headers['Content-Type'] = 'application/json';
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    if (auth) {
      const token = await this.opts.tokens.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.opts.timeoutMs ?? 20000);
    signal?.addEventListener('abort', () => controller.abort());

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.opts.baseUrl}${path}${buildQuery(query)}`, {
        method,
        headers,
        body: formData ?? (body === undefined ? undefined : JSON.stringify(body)),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      throw new NetworkError(err instanceof Error ? err.message : undefined);
    }
    clearTimeout(timeout);

    if (response.status === 401 && auth && !retried) {
      const refreshed = await this.refreshTokens();
      if (refreshed) return this.request<T>(path, options, true);
    }

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    let parsed: ApiResponse<T> | null = null;
    try {
      parsed = text ? (JSON.parse(text) as ApiResponse<T>) : null;
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      const error =
        parsed && 'error' in parsed && parsed.error
          ? parsed.error
          : { code: 'HTTP_ERROR', message: response.statusText || 'Request failed' };
      if (response.status === 401) await this.opts.onSessionExpired?.();
      throw new ApiError(response.status, error);
    }

    if (parsed && typeof parsed === 'object' && 'success' in parsed && parsed.success) return parsed.data;
    return parsed as unknown as T;
  }

  /** Single-flight refresh: concurrent 401s share one refresh request. */
  private refreshTokens(): Promise<boolean> {
    if (!this.refreshing) {
      this.refreshing = (async () => {
        const refreshToken = await this.opts.tokens.getRefreshToken();
        if (!refreshToken) return false;
        try {
          const res = await this.fetchImpl(`${this.opts.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (!res.ok) {
            await this.opts.tokens.clear();
            await this.opts.onSessionExpired?.();
            return false;
          }
          const json = (await res.json()) as ApiResponse<AuthTokens>;
          if (!json.success) return false;
          await this.opts.tokens.setTokens(json.data);
          return true;
        } catch {
          return false;
        } finally {
          this.refreshing = null;
        }
      })();
    }
    return this.refreshing;
  }
}
