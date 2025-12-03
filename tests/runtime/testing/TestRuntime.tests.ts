import { assertEquals, assertExists, assertRejects } from "../../test.deps.ts";
import {
  createMinimalTestPlugin,
  TestRuntime,
} from "../../../src/runtime/testing/.exports.ts";

Deno.test("TestRuntime Tests", async (t) => {
  await t.step("should start and stop cleanly", async () => {
    const plugin = createMinimalTestPlugin()
      .addTextRoute("/", "Hello World");

    const runtime = new TestRuntime({
      plugins: [plugin],
      portRangeStart: 4000,
      portRangeEnd: 4099,
    });

    await runtime.start();

    assertExists(runtime.port, "Port should be set after start");
    assertExists(runtime.baseUrl, "Base URL should be set after start");
    assertEquals(runtime.baseUrl, `http://localhost:${runtime.port}`);

    await runtime.stop();
  });

  await t.step("should throw when accessing port before start", () => {
    const runtime = new TestRuntime();

    try {
      const _port = runtime.port;
      throw new Error("Expected error not thrown");
    } catch (e) {
      assertEquals(
        (e as Error).message,
        "TestRuntime not started. Call start() first.",
      );
    }
  });

  await t.step("should throw when accessing baseUrl before start", () => {
    const runtime = new TestRuntime();

    try {
      const _url = runtime.baseUrl;
      throw new Error("Expected error not thrown");
    } catch (e) {
      assertEquals(
        (e as Error).message,
        "TestRuntime not started. Call start() first.",
      );
    }
  });

  await t.step("should use custom port when specified", async () => {
    const customPort = 9876;
    const plugin = createMinimalTestPlugin()
      .addTextRoute("/", "Hello");

    const runtime = new TestRuntime({
      plugins: [plugin],
      port: customPort,
    });

    await runtime.start();

    assertEquals(runtime.port, customPort);
    assertEquals(runtime.baseUrl, `http://localhost:${customPort}`);

    await runtime.stop();
  });

  await t.step("should create a TestClient bound to the runtime", async () => {
    const plugin = createMinimalTestPlugin()
      .addTextRoute("/", "Client Test");

    const runtime = new TestRuntime({
      plugins: [plugin],
      portRangeStart: 4100,
      portRangeEnd: 4199,
    });

    await runtime.start();

    const client = runtime.createClient();
    assertExists(client, "Client should be created");

    const response = await client.get("/");
    assertEquals(response.status, 200);

    const text = await response.text();
    assertEquals(text, "Client Test");

    await runtime.stop();
  });

  await t.step("should handle HTTP requests", async () => {
    const plugin = createMinimalTestPlugin()
      .addTextRoute("/hello", "Hello World")
      .addJsonRoute("/api/data", { message: "JSON response" })
      .addHtmlRoute("/page", "<h1>Page</h1>");

    const runtime = new TestRuntime({
      plugins: [plugin],
      portRangeStart: 4200,
      portRangeEnd: 4299,
    });

    await runtime.start();
    const client = runtime.createClient();

    // Test text route
    const textResponse = await client.get("/hello");
    assertEquals(textResponse.status, 200);
    assertEquals(await textResponse.text(), "Hello World");

    // Test JSON route
    const jsonResponse = await client.get("/api/data");
    assertEquals(jsonResponse.status, 200);
    assertEquals(await jsonResponse.json(), { message: "JSON response" });

    // Test HTML route
    const htmlResponse = await client.get("/page");
    assertEquals(htmlResponse.status, 200);
    assertEquals(await htmlResponse.text(), "<h1>Page</h1>");

    await runtime.stop();
  });

  await t.step("should return 404 for unknown routes", async () => {
    // MinimalTestPlugin automatically adds a 404 catch-all route
    const plugin = createMinimalTestPlugin()
      .addTextRoute("/", "Home");

    const runtime = new TestRuntime({
      plugins: [plugin],
      portRangeStart: 4300,
      portRangeEnd: 4399,
    });

    await runtime.start();
    const client = runtime.createClient();

    const response = await client.get("/nonexistent");
    assertEquals(response.status, 404);
    await response.body?.cancel();

    await runtime.stop();
  });

  await t.step(
    "should provide config.Runtime function for plugins",
    async () => {
      // Test that plugins can access config.Runtime(config).Revision during Setup
      // This is required by FathymEaCApplicationsPlugin
      let capturedRevision: string | undefined;

      const revisionCapturingPlugin = {
        // deno-lint-ignore no-explicit-any
        async Setup(config: any) {
          // Verify config.Runtime exists and is callable
          assertExists(config.Runtime, "config.Runtime should exist");
          assertEquals(
            typeof config.Runtime,
            "function",
            "config.Runtime should be a function",
          );

          // Call it like FathymEaCApplicationsPlugin does
          const runtimeObj = config.Runtime(config);
          assertExists(runtimeObj, "Runtime function should return an object");
          assertExists(
            runtimeObj.Revision,
            "Runtime object should have Revision property",
          );

          capturedRevision = runtimeObj.Revision;

          return {
            Name: "RevisionCapturingPlugin",
          };
        },
      };

      const routePlugin = createMinimalTestPlugin()
        .addTextRoute("/", "Home");

      const runtime = new TestRuntime({
        plugins: [revisionCapturingPlugin, routePlugin],
        portRangeStart: 4400,
        portRangeEnd: 4499,
      });

      await runtime.start();

      // Verify the revision was captured
      assertExists(capturedRevision, "Revision should have been captured");
      assertEquals(
        capturedRevision,
        "test",
        "Revision should be 'test' in test mode",
      );

      await runtime.stop();
    },
  );
});
