import { getPackageLoggerSync, type TelemetryLogger } from "./.deps.ts";

/**
 * Options for configuring a TestClient
 */
export interface TestClientOptions {
  /** Default headers to include with all requests */
  headers?: Record<string, string>;

  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * HTTP client for testing EaC runtimes.
 *
 * @example
 * ```typescript
 * const client = new TestClient('http://localhost:3000');
 *
 * // GET request
 * const response = await client.get('/api/users');
 *
 * // GET and parse JSON
 * const users = await client.getJson<User[]>('/api/users');
 *
 * // GET HTML
 * const html = await client.getHtml('/');
 *
 * // POST request
 * const created = await client.post('/api/users', { name: 'John' });
 * ```
 */
export class TestClient {
  protected logger: TelemetryLogger;

  constructor(
    protected baseUrl: string,
    protected options: TestClientOptions = {},
  ) {
    this.logger = getPackageLoggerSync(import.meta);
  }

  /**
   * Make a GET request
   */
  async get(path: string, options?: RequestInit): Promise<Response> {
    return this.fetch(path, { method: "GET", ...options });
  }

  /**
   * Make a POST request with optional JSON body
   */
  async post(
    path: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<Response> {
    return this.fetch(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });
  }

  /**
   * Make a PUT request with optional JSON body
   */
  async put(
    path: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<Response> {
    return this.fetch(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete(path: string, options?: RequestInit): Promise<Response> {
    return this.fetch(path, { method: "DELETE", ...options });
  }

  /**
   * GET request and return HTML as string
   */
  async getHtml(path: string): Promise<string> {
    const response = await this.get(path);
    return response.text();
  }

  /**
   * GET request and parse JSON response
   */
  async getJson<T = unknown>(path: string): Promise<T> {
    const response = await this.get(path);
    return response.json();
  }

  /**
   * POST request and parse JSON response
   */
  async postJson<T = unknown>(path: string, body?: unknown): Promise<T> {
    const response = await this.post(path, body);
    return response.json();
  }

  /**
   * GET request and return both Response and HTML
   * Useful when you need to check status and parse HTML
   */
  async getWithHtml(
    path: string,
  ): Promise<{ response: Response; html: string }> {
    const response = await this.get(path);
    const html = await response.clone().text();
    return { response, html };
  }

  /**
   * GET request and return both Response and JSON
   */
  async getWithJson<T = unknown>(
    path: string,
  ): Promise<{ response: Response; data: T }> {
    const response = await this.get(path);
    const data = await response.clone().json();
    return { response, data };
  }

  /**
   * Internal fetch implementation with timeout and default headers
   */
  protected async fetch(path: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = this.options.timeout;

    const timeoutId = timeout
      ? setTimeout(() => controller.abort(), timeout)
      : undefined;

    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;
    this.logger.debug(`[test-client] ${options.method} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.options.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      this.logger.debug(
        `[test-client] response status=${response.status} url=${url}`,
      );
      return response;
    } catch (err) {
      this.logger.error(`[test-client] fetch failed url=${url}`, { err });
      throw err;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
}
