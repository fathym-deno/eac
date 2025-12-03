import { assertEquals } from "../../test.deps.ts";
import {
  createMinimalTestPlugin,
  MinimalTestPlugin,
  TestRuntime,
} from "../../../src/runtime/testing/.exports.ts";

Deno.test("MinimalTestPlugin Tests", async (t) => {
  await t.step(
    "createMinimalTestPlugin() should create plugin instance",
    () => {
      const plugin = createMinimalTestPlugin();
      assertEquals(plugin instanceof MinimalTestPlugin, true);
    },
  );

  await t.step("addTextRoute() should register text route", async () => {
    const plugin = createMinimalTestPlugin()
      .addTextRoute("/hello", "Hello World");

    const runtime = new TestRuntime({ plugins: [plugin] });
    await runtime.start();

    const client = runtime.createClient();
    const response = await client.get("/hello");

    assertEquals(response.status, 200);
    assertEquals(
      response.headers.get("Content-Type"),
      "text/plain; charset=utf-8",
    );
    assertEquals(await response.text(), "Hello World");

    await runtime.stop();
  });

  await t.step("addJsonRoute() should register JSON route", async () => {
    const testData = { message: "Hello", count: 42 };
    const plugin = createMinimalTestPlugin()
      .addJsonRoute("/api/test", testData);

    const runtime = new TestRuntime({ plugins: [plugin] });
    await runtime.start();

    const client = runtime.createClient();
    const response = await client.get("/api/test");

    assertEquals(response.status, 200);
    assertEquals(response.headers.get("Content-Type"), "application/json");
    assertEquals(await response.json(), testData);

    await runtime.stop();
  });

  await t.step("addHtmlRoute() should register HTML route", async () => {
    const html = "<html><body><h1>Test</h1></body></html>";
    const plugin = createMinimalTestPlugin()
      .addHtmlRoute("/page", html);

    const runtime = new TestRuntime({ plugins: [plugin] });
    await runtime.start();

    const client = runtime.createClient();
    const response = await client.get("/page");

    assertEquals(response.status, 200);
    assertEquals(
      response.headers.get("Content-Type"),
      "text/html; charset=utf-8",
    );
    assertEquals(await response.text(), html);

    await runtime.stop();
  });

  await t.step(
    "addRedirectRoute() should register redirect route",
    async () => {
      const plugin = createMinimalTestPlugin()
        .addRedirectRoute("/old", "/new");

      const runtime = new TestRuntime({ plugins: [plugin] });
      await runtime.start();

      const client = runtime.createClient();
      const response = await client.get("/old", { redirect: "manual" });

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("Location"), "/new");
      await response.body?.cancel();

      await runtime.stop();
    },
  );

  await t.step(
    "addRedirectRoute() should support custom status codes",
    async () => {
      const plugin = createMinimalTestPlugin()
        .addRedirectRoute("/permanent", "/new", 301);

      const runtime = new TestRuntime({ plugins: [plugin] });
      await runtime.start();

      const client = runtime.createClient();
      const response = await client.get("/permanent", { redirect: "manual" });

      assertEquals(response.status, 301);
      assertEquals(response.headers.get("Location"), "/new");
      await response.body?.cancel();

      await runtime.stop();
    },
  );

  await t.step("addRoute() should register custom handler", async () => {
    const plugin = createMinimalTestPlugin()
      .addRoute("/custom", (req) => {
        const url = new URL(req.url);
        return new Response(`Method: ${req.method}, Path: ${url.pathname}`);
      });

    const runtime = new TestRuntime({ plugins: [plugin] });
    await runtime.start();

    const client = runtime.createClient();
    const response = await client.get("/custom");

    assertEquals(response.status, 200);
    assertEquals(await response.text(), "Method: GET, Path: /custom");

    await runtime.stop();
  });

  await t.step("should support method chaining", async () => {
    const plugin = createMinimalTestPlugin()
      .addTextRoute("/text", "Text")
      .addJsonRoute("/json", { ok: true })
      .addHtmlRoute("/html", "<p>HTML</p>")
      .addRedirectRoute("/redirect", "/text");

    const runtime = new TestRuntime({ plugins: [plugin] });
    await runtime.start();

    const client = runtime.createClient();

    const textResp = await client.get("/text");
    assertEquals(textResp.status, 200);
    await textResp.body?.cancel();

    const jsonResp = await client.get("/json");
    assertEquals(jsonResp.status, 200);
    await jsonResp.body?.cancel();

    const htmlResp = await client.get("/html");
    assertEquals(htmlResp.status, 200);
    await htmlResp.body?.cancel();

    const redirectResp = await client.get("/redirect", { redirect: "manual" });
    assertEquals(redirectResp.status, 302);
    await redirectResp.body?.cancel();

    await runtime.stop();
  });

  await t.step("should handle errors in custom handlers", async () => {
    const plugin = createMinimalTestPlugin()
      .addRoute("/error", () => {
        throw new Error("Test error");
      });

    const runtime = new TestRuntime({ plugins: [plugin] });
    await runtime.start();

    const client = runtime.createClient();
    const response = await client.get("/error");

    assertEquals(response.status, 500);
    const text = await response.text();
    assertEquals(text.includes("Error"), true);

    await runtime.stop();
  });
});
