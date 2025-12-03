import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";

/**
 * Assert that HTML contains a specific string
 */
export function assertHtmlContains(
  html: string,
  expected: string,
  message?: string,
): void {
  assertStringIncludes(
    html,
    expected,
    message ?? `Expected HTML to contain "${expected}"`,
  );
}

/**
 * Assert that HTML does NOT contain a specific string
 */
export function assertHtmlNotContains(
  html: string,
  notExpected: string,
  message?: string,
): void {
  assertEquals(
    html.includes(notExpected),
    false,
    message ?? `Expected HTML to NOT contain "${notExpected}"`,
  );
}

/**
 * Assert that HTML contains an element with the specified tag
 * Uses a simple regex-based approach (not a full DOM parser)
 */
export function assertHtmlElement(
  html: string,
  tagName: string,
  message?: string,
): void {
  const regex = new RegExp(`<${tagName}[\\s>]`, "i");
  assertEquals(
    regex.test(html),
    true,
    message ?? `Expected HTML to contain <${tagName}> element`,
  );
}

/**
 * Assert that HTML does NOT contain an element with the specified tag
 */
export function assertHtmlNoElement(
  html: string,
  tagName: string,
  message?: string,
): void {
  const regex = new RegExp(`<${tagName}[\\s>]`, "i");
  assertEquals(
    regex.test(html),
    false,
    message ?? `Expected HTML to NOT contain <${tagName}> element`,
  );
}

/**
 * Assert that HTML contains an element with a specific attribute value
 * Example: assertHtmlAttribute(html, 'div', 'id', 'app')
 */
export function assertHtmlAttribute(
  html: string,
  tagName: string,
  attrName: string,
  attrValue: string,
  message?: string,
): void {
  // Match either single or double quotes around the attribute value
  const regex = new RegExp(
    `<${tagName}[^>]*\\s${attrName}=["']${escapeRegex(attrValue)}["'][^>]*>`,
    "i",
  );
  assertEquals(
    regex.test(html),
    true,
    message ??
      `Expected HTML to contain <${tagName}> with ${attrName}="${attrValue}"`,
  );
}

/**
 * Assert that HTML contains an element with a specific class
 */
export function assertHtmlClass(
  html: string,
  tagName: string,
  className: string,
  message?: string,
): void {
  // Match class attribute containing the className (with word boundaries)
  const regex = new RegExp(
    `<${tagName}[^>]*\\sclass=["'][^"']*\\b${
      escapeRegex(className)
    }\\b[^"']*["'][^>]*>`,
    "i",
  );
  assertEquals(
    regex.test(html),
    true,
    message ??
      `Expected HTML to contain <${tagName}> with class "${className}"`,
  );
}

/**
 * Assert that HTML contains an element with a specific id
 */
export function assertHtmlId(
  html: string,
  tagName: string,
  id: string,
  message?: string,
): void {
  assertHtmlAttribute(html, tagName, "id", id, message);
}

/**
 * Assert that HTML contains a specific number of elements with the given tag
 */
export function assertHtmlElementCount(
  html: string,
  tagName: string,
  expectedCount: number,
  message?: string,
): void {
  const regex = new RegExp(`<${tagName}[\\s>]`, "gi");
  const matches = html.match(regex) || [];
  assertEquals(
    matches.length,
    expectedCount,
    message ??
      `Expected ${expectedCount} <${tagName}> elements, found ${matches.length}`,
  );
}

/**
 * Assert that HTML has a valid DOCTYPE declaration
 */
export function assertHtmlDoctype(html: string, message?: string): void {
  assertEquals(
    html.toLowerCase().startsWith("<!doctype html>"),
    true,
    message ?? "Expected HTML to start with <!DOCTYPE html>",
  );
}

/**
 * Assert that HTML contains a script tag with a specific src
 */
export function assertHtmlScript(
  html: string,
  src: string,
  message?: string,
): void {
  // Match script tag with src attribute
  const regex = new RegExp(
    `<script[^>]*\\ssrc=["']${escapeRegex(src)}["'][^>]*>`,
    "i",
  );
  assertEquals(
    regex.test(html),
    true,
    message ?? `Expected HTML to contain <script src="${src}">`,
  );
}

/**
 * Assert that HTML contains a link tag with a specific href
 */
export function assertHtmlLink(
  html: string,
  href: string,
  message?: string,
): void {
  const regex = new RegExp(
    `<link[^>]*\\shref=["']${escapeRegex(href)}["'][^>]*>`,
    "i",
  );
  assertEquals(
    regex.test(html),
    true,
    message ?? `Expected HTML to contain <link href="${href}">`,
  );
}

/**
 * Assert that HTML contains a meta tag with specific attributes
 */
export function assertHtmlMeta(
  html: string,
  name: string,
  content: string,
  message?: string,
): void {
  const regex = new RegExp(
    `<meta[^>]*\\sname=["']${escapeRegex(name)}["'][^>]*\\scontent=["']${
      escapeRegex(content)
    }["'][^>]*>`,
    "i",
  );
  // Also check reverse order (content before name)
  const regexReverse = new RegExp(
    `<meta[^>]*\\scontent=["']${escapeRegex(content)}["'][^>]*\\sname=["']${
      escapeRegex(name)
    }["'][^>]*>`,
    "i",
  );
  assertEquals(
    regex.test(html) || regexReverse.test(html),
    true,
    message ??
      `Expected HTML to contain <meta name="${name}" content="${content}">`,
  );
}

/**
 * Assert that HTML title tag contains expected text
 */
export function assertHtmlTitle(
  html: string,
  expectedTitle: string,
  message?: string,
): void {
  const regex = /<title[^>]*>([^<]*)<\/title>/i;
  const match = html.match(regex);
  assertEquals(
    match?.[1]?.trim(),
    expectedTitle,
    message ??
      `Expected HTML title to be "${expectedTitle}", got "${
        match?.[1]?.trim()
      }"`,
  );
}

/**
 * Extract text content from a specific element (first match)
 * Returns undefined if element not found
 */
export function extractHtmlElementText(
  html: string,
  tagName: string,
): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, "i");
  const match = html.match(regex);
  return match?.[1]?.trim();
}

/**
 * Extract attribute value from an element (first match)
 * Returns undefined if not found
 */
export function extractHtmlAttribute(
  html: string,
  tagName: string,
  attrName: string,
): string | undefined {
  const regex = new RegExp(
    `<${tagName}[^>]*\\s${attrName}=["']([^"']*)["'][^>]*>`,
    "i",
  );
  const match = html.match(regex);
  return match?.[1];
}

/**
 * Helper to escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
