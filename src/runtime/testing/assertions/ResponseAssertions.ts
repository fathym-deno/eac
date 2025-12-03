import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";

/**
 * Assert that a response has a specific status code
 */
export function assertStatus(
  response: Response,
  expected: number,
  message?: string,
): void {
  assertEquals(
    response.status,
    expected,
    message ?? `Expected status ${expected}, got ${response.status}`,
  );
}

/**
 * Assert that a response is OK (status 200-299)
 */
export function assertOk(response: Response, message?: string): void {
  assertEquals(
    response.ok,
    true,
    message ?? `Expected OK response, got status ${response.status}`,
  );
}

/**
 * Assert that a response has a specific Content-Type header
 */
export function assertContentType(
  response: Response,
  expected: string,
  message?: string,
): void {
  const contentType = response.headers.get("Content-Type");
  assertEquals(
    contentType?.includes(expected),
    true,
    message ??
      `Expected Content-Type to include "${expected}", got "${contentType}"`,
  );
}

/**
 * Assert that a response is JSON (has application/json content type)
 */
export function assertJsonContentType(
  response: Response,
  message?: string,
): void {
  assertContentType(response, "application/json", message);
}

/**
 * Assert that a response is HTML (has text/html content type)
 */
export function assertHtmlContentType(
  response: Response,
  message?: string,
): void {
  assertContentType(response, "text/html", message);
}

/**
 * Assert that a response is a redirect to a specific location
 */
export function assertRedirect(
  response: Response,
  expectedLocation: string,
  expectedStatus: number = 302,
  message?: string,
): void {
  assertEquals(
    response.status,
    expectedStatus,
    message ??
      `Expected redirect status ${expectedStatus}, got ${response.status}`,
  );

  const location = response.headers.get("Location");
  assertEquals(
    location,
    expectedLocation,
    message ?? `Expected redirect to "${expectedLocation}", got "${location}"`,
  );
}

/**
 * Assert that a response has a specific header
 */
export function assertHeader(
  response: Response,
  name: string,
  expected: string,
  message?: string,
): void {
  const actual = response.headers.get(name);
  assertEquals(
    actual,
    expected,
    message ?? `Expected header "${name}" to be "${expected}", got "${actual}"`,
  );
}

/**
 * Assert that a response has a header that contains a value
 */
export function assertHeaderContains(
  response: Response,
  name: string,
  contains: string,
  message?: string,
): void {
  const actual = response.headers.get(name);
  assertEquals(
    actual?.includes(contains),
    true,
    message ??
      `Expected header "${name}" to contain "${contains}", got "${actual}"`,
  );
}

/**
 * Assert that a response body contains a string
 */
export async function assertBodyContains(
  response: Response,
  expected: string,
  message?: string,
): Promise<void> {
  const body = await response.clone().text();
  assertStringIncludes(
    body,
    expected,
    message ?? `Expected body to contain "${expected}"`,
  );
}

/**
 * Assert that a response body equals a string
 */
export async function assertBodyEquals(
  response: Response,
  expected: string,
  message?: string,
): Promise<void> {
  const body = await response.clone().text();
  assertEquals(
    body,
    expected,
    message ?? `Expected body to equal "${expected}", got "${body}"`,
  );
}

/**
 * Assert that a JSON response contains expected data
 */
export async function assertJsonBody<T>(
  response: Response,
  expected: T,
  message?: string,
): Promise<void> {
  const actual = await response.clone().json();
  assertEquals(
    actual,
    expected,
    message ?? `Expected JSON body to match`,
  );
}

/**
 * Assert that a JSON response contains a subset of expected data
 */
export async function assertJsonContains(
  response: Response,
  expected: Record<string, unknown>,
  message?: string,
): Promise<void> {
  const actual = await response.clone().json();

  for (const [key, value] of Object.entries(expected)) {
    assertEquals(
      actual[key],
      value,
      message ??
        `Expected JSON property "${key}" to be ${JSON.stringify(value)}, got ${
          JSON.stringify(actual[key])
        }`,
    );
  }
}

/**
 * Assert that a response is a 404 Not Found
 */
export function assertNotFound(response: Response, message?: string): void {
  assertStatus(response, 404, message ?? "Expected 404 Not Found");
}

/**
 * Assert that a response is a 500 Internal Server Error
 */
export function assertServerError(response: Response, message?: string): void {
  assertStatus(response, 500, message ?? "Expected 500 Internal Server Error");
}
