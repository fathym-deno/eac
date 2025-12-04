import { assertEquals, assertExists } from "../../test.deps.ts";
import {
  createMinimalTestPlugin,
  TestClient,
  TestRuntime,
} from "../../../src/runtime/testing/.exports.ts";

Deno.test("TestClient Tests", async (t) => {
  // Setup: create a runtime with various routes for testing
  const plugin = createMinimalTestPlugin()
    .AddTextRoute("/", "Home")
    .AddJsonRoute("/api/data", { id: 1, name: "Test" })
    .AddHtmlRoute(
      "/page",
      "<!doctype html><html><body><h1>Hello</h1></body></html>",
    )
    .AddRedirectRoute("/redirect", "/page")
    .AddRoute("/echo", (req) => {
      return new Response(`${req.method} ${new URL(req.url).pathname}`);
    });

  const runtime = new TestRuntime({ Plugins: [plugin] });

  await t.step("setup", async () => {
    await runtime.Start();
  });

  await t.step("get() should make GET requests", async () => {
    const client = runtime.CreateClient();
    const response = await client.Get("/");

    assertEquals(response.status, 200);
    assertEquals(await response.text(), "Home");
  });

  await t.step("post() should make POST requests", async () => {
    const client = runtime.CreateClient();
    const response = await client.Post("/echo");

    assertEquals(response.status, 200);
    assertEquals(await response.text(), "POST /echo");
  });

  await t.step("put() should make PUT requests", async () => {
    const client = runtime.CreateClient();
    const response = await client.Put("/echo");

    assertEquals(response.status, 200);
    assertEquals(await response.text(), "PUT /echo");
  });

  await t.step("delete() should make DELETE requests", async () => {
    const client = runtime.CreateClient();
    const response = await client.Delete("/echo");

    assertEquals(response.status, 200);
    assertEquals(await response.text(), "DELETE /echo");
  });

  await t.step("getJson() should parse JSON response", async () => {
    const client = runtime.CreateClient();
    const data = await client.GetJson<{ id: number; name: string }>(
      "/api/data",
    );

    assertEquals(data.id, 1);
    assertEquals(data.name, "Test");
  });

  await t.step("getHtml() should return HTML string", async () => {
    const client = runtime.CreateClient();
    const html = await client.GetHtml("/page");

    assertEquals(html.includes("<h1>Hello</h1>"), true);
  });

  await t.step("getWithHtml() should return response and HTML", async () => {
    const client = runtime.CreateClient();
    const { response, html } = await client.GetWithHtml("/page");

    assertEquals(response.status, 200);
    assertEquals(html.includes("<h1>Hello</h1>"), true);
  });

  await t.step("getWithJson() should return response and data", async () => {
    const client = runtime.CreateClient();
    const { response, data } = await client.GetWithJson<{ id: number }>(
      "/api/data",
    );

    assertEquals(response.status, 200);
    assertEquals(data.id, 1);
  });

  await t.step("should handle redirects", async () => {
    const client = runtime.CreateClient();
    const response = await client.Get("/redirect", { redirect: "manual" });

    assertEquals(response.status, 302);
    assertEquals(response.headers.get("Location"), "/page");
    await response.body?.cancel();
  });

  await t.step("should support custom headers", async () => {
    const client = new TestClient(runtime.BaseURL, {
      Headers: { "X-Custom-Header": "test-value" },
    });

    const response = await client.Get("/");
    assertEquals(response.status, 200);
    await response.body?.cancel();
  });

  await t.step("teardown", async () => {
    await runtime.Stop();
  });
});
