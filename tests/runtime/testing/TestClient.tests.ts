import { assertEquals, assertExists } from "../../test.deps.ts";
import {
  createMinimalTestPlugin,
  TestClient,
  TestRuntime,
} from "../../../src/runtime/testing/.exports.ts";

Deno.test("TestClient Tests", async (t) => {
  // Setup: create a runtime with various routes for testing
  const plugin = createMinimalTestPlugin()
    .addTextRoute("/", "Home")
    .addJsonRoute("/api/data", { id: 1, name: "Test" })
    .addHtmlRoute(
      "/page",
      "<!doctype html><html><body><h1>Hello</h1></body></html>",
    )
    .addRedirectRoute("/redirect", "/page")
    .addRoute("/echo", (req) => {
      return new Response(`${req.method} ${new URL(req.url).pathname}`);
    });

  const runtime = new TestRuntime({ plugins: [plugin] });

  await t.step("setup", async () => {
    await runtime.start();
  });

  await t.step("get() should make GET requests", async () => {
    const client = runtime.createClient();
    const response = await client.get("/");

    assertEquals(response.status, 200);
    assertEquals(await response.text(), "Home");
  });

  await t.step("post() should make POST requests", async () => {
    const client = runtime.createClient();
    const response = await client.post("/echo");

    assertEquals(response.status, 200);
    assertEquals(await response.text(), "POST /echo");
  });

  await t.step("put() should make PUT requests", async () => {
    const client = runtime.createClient();
    const response = await client.put("/echo");

    assertEquals(response.status, 200);
    assertEquals(await response.text(), "PUT /echo");
  });

  await t.step("delete() should make DELETE requests", async () => {
    const client = runtime.createClient();
    const response = await client.delete("/echo");

    assertEquals(response.status, 200);
    assertEquals(await response.text(), "DELETE /echo");
  });

  await t.step("getJson() should parse JSON response", async () => {
    const client = runtime.createClient();
    const data = await client.getJson<{ id: number; name: string }>(
      "/api/data",
    );

    assertEquals(data.id, 1);
    assertEquals(data.name, "Test");
  });

  await t.step("getHtml() should return HTML string", async () => {
    const client = runtime.createClient();
    const html = await client.getHtml("/page");

    assertEquals(html.includes("<h1>Hello</h1>"), true);
  });

  await t.step("getWithHtml() should return response and HTML", async () => {
    const client = runtime.createClient();
    const { response, html } = await client.getWithHtml("/page");

    assertEquals(response.status, 200);
    assertEquals(html.includes("<h1>Hello</h1>"), true);
  });

  await t.step("getWithJson() should return response and data", async () => {
    const client = runtime.createClient();
    const { response, data } = await client.getWithJson<{ id: number }>(
      "/api/data",
    );

    assertEquals(response.status, 200);
    assertEquals(data.id, 1);
  });

  await t.step("should handle redirects", async () => {
    const client = runtime.createClient();
    const response = await client.get("/redirect", { redirect: "manual" });

    assertEquals(response.status, 302);
    assertEquals(response.headers.get("Location"), "/page");
    await response.body?.cancel();
  });

  await t.step("should support custom headers", async () => {
    const client = new TestClient(runtime.baseUrl, {
      headers: { "X-Custom-Header": "test-value" },
    });

    const response = await client.get("/");
    assertEquals(response.status, 200);
    await response.body?.cancel();
  });

  await t.step("teardown", async () => {
    await runtime.stop();
  });
});
