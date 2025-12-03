import { assertEquals, assertThrows } from "../../test.deps.ts";
import {
  assertBodyContains,
  assertBodyEquals,
  assertContentType,
  assertHeader,
  assertHeaderContains,
  assertHtmlAttribute,
  assertHtmlClass,
  // HTML assertions
  assertHtmlContains,
  assertHtmlContentType,
  assertHtmlDoctype,
  assertHtmlElement,
  assertHtmlElementCount,
  assertHtmlId,
  assertHtmlLink,
  assertHtmlMeta,
  assertHtmlNoElement,
  assertHtmlNotContains,
  assertHtmlScript,
  assertHtmlTitle,
  assertJsonBody,
  assertJsonContains,
  assertJsonContentType,
  assertNotFound,
  assertOk,
  assertRedirect,
  assertServerError,
  // Response assertions
  assertStatus,
  extractHtmlAttribute,
  extractHtmlElementText,
} from "../../../src/runtime/testing/.exports.ts";

Deno.test("Response Assertions Tests", async (t) => {
  await t.step("assertStatus should verify status code", () => {
    const response = new Response("OK", { status: 200 });
    assertStatus(response, 200);
  });

  await t.step("assertStatus should throw for wrong status", () => {
    const response = new Response("Not Found", { status: 404 });
    assertThrows(() => assertStatus(response, 200));
  });

  await t.step("assertOk should verify 2xx status", () => {
    assertOk(new Response("OK", { status: 200 }));
    assertOk(new Response("Created", { status: 201 }));
  });

  await t.step("assertOk should throw for non-2xx status", () => {
    assertThrows(() => assertOk(new Response("Error", { status: 500 })));
  });

  await t.step("assertContentType should verify content type", () => {
    const response = new Response("", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
    assertContentType(response, "application/json");
  });

  await t.step("assertJsonContentType should verify JSON content type", () => {
    const response = new Response("{}", {
      headers: { "Content-Type": "application/json" },
    });
    assertJsonContentType(response);
  });

  await t.step("assertHtmlContentType should verify HTML content type", () => {
    const response = new Response("<html></html>", {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
    assertHtmlContentType(response);
  });

  await t.step("assertRedirect should verify redirect response", () => {
    const response = new Response(null, {
      status: 302,
      headers: { Location: "/new-page" },
    });
    assertRedirect(response, "/new-page");
  });

  await t.step("assertRedirect should support custom status", () => {
    const response = new Response(null, {
      status: 301,
      headers: { Location: "/permanent" },
    });
    assertRedirect(response, "/permanent", 301);
  });

  await t.step("assertHeader should verify header value", () => {
    const response = new Response("", {
      headers: { "X-Custom": "test-value" },
    });
    assertHeader(response, "X-Custom", "test-value");
  });

  await t.step(
    "assertHeaderContains should verify header contains value",
    () => {
      const response = new Response("", {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      assertHeaderContains(response, "Content-Type", "json");
    },
  );

  await t.step(
    "assertBodyContains should verify body contains string",
    async () => {
      const response = new Response("Hello World");
      await assertBodyContains(response, "World");
    },
  );

  await t.step("assertBodyEquals should verify exact body match", async () => {
    const response = new Response("Exact Match");
    await assertBodyEquals(response, "Exact Match");
  });

  await t.step("assertJsonBody should verify JSON body", async () => {
    const response = new Response(JSON.stringify({ id: 1, name: "Test" }));
    await assertJsonBody(response, { id: 1, name: "Test" });
  });

  await t.step(
    "assertJsonContains should verify partial JSON match",
    async () => {
      const response = new Response(
        JSON.stringify({ id: 1, name: "Test", extra: true }),
      );
      await assertJsonContains(response, { id: 1, name: "Test" });
    },
  );

  await t.step("assertNotFound should verify 404 status", () => {
    const response = new Response("Not Found", { status: 404 });
    assertNotFound(response);
  });

  await t.step("assertServerError should verify 500 status", () => {
    const response = new Response("Error", { status: 500 });
    assertServerError(response);
  });
});

Deno.test("HTML Assertions Tests", async (t) => {
  const sampleHtml = `<!doctype html>
<html>
<head>
  <title>Test Page</title>
  <meta name="description" content="A test page">
  <link rel="stylesheet" href="/styles.css">
  <script src="/app.js"></script>
</head>
<body>
  <div id="app" class="container main-app">
    <h1>Hello World</h1>
    <p class="intro">Welcome to the test.</p>
    <button id="submit-btn" class="btn primary">Submit</button>
  </div>
</body>
</html>`;

  await t.step("assertHtmlContains should verify content exists", () => {
    assertHtmlContains(sampleHtml, "Hello World");
    assertHtmlContains(sampleHtml, "Welcome to the test");
  });

  await t.step("assertHtmlContains should throw for missing content", () => {
    assertThrows(() => assertHtmlContains(sampleHtml, "Missing Content"));
  });

  await t.step("assertHtmlNotContains should verify content absent", () => {
    assertHtmlNotContains(sampleHtml, "Not Present");
  });

  await t.step("assertHtmlNotContains should throw for present content", () => {
    assertThrows(() => assertHtmlNotContains(sampleHtml, "Hello World"));
  });

  await t.step("assertHtmlElement should verify element exists", () => {
    assertHtmlElement(sampleHtml, "div");
    assertHtmlElement(sampleHtml, "h1");
    assertHtmlElement(sampleHtml, "button");
  });

  await t.step("assertHtmlElement should throw for missing element", () => {
    assertThrows(() => assertHtmlElement(sampleHtml, "table"));
  });

  await t.step("assertHtmlNoElement should verify element absent", () => {
    assertHtmlNoElement(sampleHtml, "table");
    assertHtmlNoElement(sampleHtml, "iframe");
  });

  await t.step("assertHtmlNoElement should throw for present element", () => {
    assertThrows(() => assertHtmlNoElement(sampleHtml, "div"));
  });

  await t.step("assertHtmlAttribute should verify attribute value", () => {
    assertHtmlAttribute(sampleHtml, "div", "id", "app");
    assertHtmlAttribute(sampleHtml, "button", "id", "submit-btn");
  });

  await t.step("assertHtmlClass should verify class name", () => {
    assertHtmlClass(sampleHtml, "div", "container");
    assertHtmlClass(sampleHtml, "div", "main-app");
    assertHtmlClass(sampleHtml, "button", "primary");
  });

  await t.step("assertHtmlId should verify element id", () => {
    assertHtmlId(sampleHtml, "div", "app");
    assertHtmlId(sampleHtml, "button", "submit-btn");
  });

  await t.step("assertHtmlElementCount should count elements", () => {
    assertHtmlElementCount(sampleHtml, "div", 1);
    assertHtmlElementCount(sampleHtml, "h1", 1);
  });

  await t.step("assertHtmlDoctype should verify doctype", () => {
    assertHtmlDoctype(sampleHtml);
  });

  await t.step("assertHtmlDoctype should throw for missing doctype", () => {
    assertThrows(() => assertHtmlDoctype("<html><body></body></html>"));
  });

  await t.step("assertHtmlScript should verify script src", () => {
    assertHtmlScript(sampleHtml, "/app.js");
  });

  await t.step("assertHtmlLink should verify link href", () => {
    assertHtmlLink(sampleHtml, "/styles.css");
  });

  await t.step("assertHtmlMeta should verify meta tag", () => {
    assertHtmlMeta(sampleHtml, "description", "A test page");
  });

  await t.step("assertHtmlTitle should verify title content", () => {
    assertHtmlTitle(sampleHtml, "Test Page");
  });

  await t.step("extractHtmlElementText should extract element text", () => {
    const title = extractHtmlElementText(sampleHtml, "title");
    assertEquals(title, "Test Page");

    const h1 = extractHtmlElementText(sampleHtml, "h1");
    assertEquals(h1, "Hello World");
  });

  await t.step(
    "extractHtmlElementText should return undefined for missing element",
    () => {
      const result = extractHtmlElementText(sampleHtml, "footer");
      assertEquals(result, undefined);
    },
  );

  await t.step("extractHtmlAttribute should extract attribute value", () => {
    const id = extractHtmlAttribute(sampleHtml, "div", "id");
    assertEquals(id, "app");

    const href = extractHtmlAttribute(sampleHtml, "link", "href");
    assertEquals(href, "/styles.css");
  });

  await t.step(
    "extractHtmlAttribute should return undefined for missing attribute",
    () => {
      const result = extractHtmlAttribute(sampleHtml, "div", "data-missing");
      assertEquals(result, undefined);
    },
  );
});
