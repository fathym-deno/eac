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

  await t.step("AddTextRoute() should register text route", async () => {
    const plugin = createMinimalTestPlugin()
      .AddTextRoute("/hello", "Hello World");

    const runtime = new TestRuntime({ Plugins: [plugin] });
    await runtime.Start();

    const client = runtime.CreateClient();
    const response = await client.Get("/hello");

    assertEquals(response.status, 200);
    assertEquals(
      response.headers.get("Content-Type"),
      "text/plain; charset=utf-8",
    );
    assertEquals(await response.text(), "Hello World");

    await runtime.Stop();
  });

  await t.step("addJsonRoute() should register JSON route", async () => {
    const testData = { message: "Hello", count: 42 };
    const plugin = createMinimalTestPlugin()
      .AddJsonRoute("/api/test", testData);

    const runtime = new TestRuntime({ Plugins: [plugin] });
    await runtime.Start();

    const client = runtime.CreateClient();
    const response = await client.Get("/api/test");

    assertEquals(response.status, 200);
    assertEquals(response.headers.get("Content-Type"), "application/json");
    assertEquals(await response.json(), testData);

    await runtime.Stop();
  });

  await t.step("addHtmlRoute() should register HTML route", async () => {
    const html = "<html><body><h1>Test</h1></body></html>";
    const plugin = createMinimalTestPlugin()
      .AddHtmlRoute("/page", html);

    const runtime = new TestRuntime({ Plugins: [plugin] });
    await runtime.Start();

    const client = runtime.CreateClient();
    const response = await client.Get("/page");

    assertEquals(response.status, 200);
    assertEquals(
      response.headers.get("Content-Type"),
      "text/html; charset=utf-8",
    );
    assertEquals(await response.text(), html);

    await runtime.Stop();
  });

  await t.step(
    "addRedirectRoute() should register redirect route",
    async () => {
      const plugin = createMinimalTestPlugin()
        .AddRedirectRoute("/old", "/new");

      const runtime = new TestRuntime({ Plugins: [plugin] });
      await runtime.Start();

      const client = runtime.CreateClient();
      const response = await client.Get("/old", { redirect: "manual" });

      assertEquals(response.status, 302);
      assertEquals(response.headers.get("Location"), "/new");
      await response.body?.cancel();

      await runtime.Stop();
    },
  );

  await t.step(
    "addRedirectRoute() should support custom status codes",
    async () => {
      const plugin = createMinimalTestPlugin()
        .AddRedirectRoute("/permanent", "/new", 301);

      const runtime = new TestRuntime({ Plugins: [plugin] });
      await runtime.Start();

      const client = runtime.CreateClient();
      const response = await client.Get("/permanent", { redirect: "manual" });

      assertEquals(response.status, 301);
      assertEquals(response.headers.get("Location"), "/new");
      await response.body?.cancel();

      await runtime.Stop();
    },
  );

  await t.step("addRoute() should register custom handler", async () => {
    const plugin = createMinimalTestPlugin()
      .AddRoute("/custom", (req) => {
        const url = new URL(req.url);
        return new Response(`Method: ${req.method}, Path: ${url.pathname}`);
      });

    const runtime = new TestRuntime({ Plugins: [plugin] });
    await runtime.Start();

    const client = runtime.CreateClient();
    const response = await client.Get("/custom");

    assertEquals(response.status, 200);
    assertEquals(await response.text(), "Method: GET, Path: /custom");

    await runtime.Stop();
  });

  await t.step("should support method chaining", async () => {
    const plugin = createMinimalTestPlugin()
      .AddTextRoute("/text", "Text")
      .AddJsonRoute("/json", { ok: true })
      .AddHtmlRoute("/html", "<p>HTML</p>")
      .AddRedirectRoute("/redirect", "/text");

    const runtime = new TestRuntime({ Plugins: [plugin] });
    await runtime.Start();

    const client = runtime.CreateClient();

    const textResp = await client.Get("/text");
    assertEquals(textResp.status, 200);
    await textResp.body?.cancel();

    const jsonResp = await client.Get("/json");
    assertEquals(jsonResp.status, 200);
    await jsonResp.body?.cancel();

    const htmlResp = await client.Get("/html");
    assertEquals(htmlResp.status, 200);
    await htmlResp.body?.cancel();

    const redirectResp = await client.Get("/redirect", { redirect: "manual" });
    assertEquals(redirectResp.status, 302);
    await redirectResp.body?.cancel();

    await runtime.Stop();
  });

  await t.step("should handle errors in custom handlers", async () => {
    const plugin = createMinimalTestPlugin()
      .AddRoute("/error", () => {
        throw new Error("Test error");
      });

    const runtime = new TestRuntime({ Plugins: [plugin] });
    await runtime.Start();

    const client = runtime.CreateClient();
    const response = await client.Get("/error");

    assertEquals(response.status, 500);
    const text = await response.text();
    assertEquals(text.includes("Error"), true);

    await runtime.Stop();
  });
});
