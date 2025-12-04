import { assertEquals, assertExists } from "../../test.deps.ts";
import {
  createMinimalTestPlugin,
  TestRuntime,
} from "../../../src/runtime/testing/.exports.ts";

Deno.test("TestRuntime Tests", async (t) => {
  await t.step("should start and stop cleanly", async () => {
    const plugin = createMinimalTestPlugin()
      .AddTextRoute("/", "Hello World");

    const runtime = new TestRuntime({
      Plugins: [plugin],
      PortRangeStart: 4000,
      PortRangeEnd: 4099,
    });

    await runtime.Start();

    assertExists(runtime.Port, "Port should be set after start");
    assertExists(runtime.BaseURL, "Base URL should be set after start");
    assertEquals(runtime.BaseURL, `http://localhost:${runtime.Port}`);

    await runtime.Stop();
  });

  await t.step("should throw when accessing port before start", () => {
    const runtime = new TestRuntime();

    try {
      const _port = runtime.Port;
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
      const _url = runtime.BaseURL;
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
      .AddTextRoute("/", "Hello");

    const runtime = new TestRuntime({
      Plugins: [plugin],
      Port: customPort,
    });

    await runtime.Start();

    assertEquals(runtime.Port, customPort);
    assertEquals(runtime.BaseURL, `http://localhost:${customPort}`);

    await runtime.Stop();
  });

  await t.step("should create a TestClient bound to the runtime", async () => {
    const plugin = createMinimalTestPlugin()
      .AddTextRoute("/", "Client Test");

    const runtime = new TestRuntime({
      Plugins: [plugin],
      PortRangeStart: 4100,
      PortRangeEnd: 4199,
    });

    await runtime.Start();

    const client = runtime.CreateClient();
    assertExists(client, "Client should be created");

    const response = await client.Get("/");
    assertEquals(response.status, 200);

    const text = await response.text();
    assertEquals(text, "Client Test");

    await runtime.Stop();
  });

  await t.step("should handle HTTP requests", async () => {
    const plugin = createMinimalTestPlugin()
      .AddTextRoute("/hello", "Hello World")
      .AddJsonRoute("/api/data", { message: "JSON response" })
      .AddHtmlRoute("/page", "<h1>Page</h1>");

    const runtime = new TestRuntime({
      Plugins: [plugin],
      PortRangeStart: 4200,
      PortRangeEnd: 4299,
    });

    await runtime.Start();
    const client = runtime.CreateClient();

    // Test text route
    const textResponse = await client.Get("/hello");
    assertEquals(textResponse.status, 200);
    assertEquals(await textResponse.text(), "Hello World");

    // Test JSON route
    const jsonResponse = await client.Get("/api/data");
    assertEquals(jsonResponse.status, 200);
    assertEquals(await jsonResponse.json(), { message: "JSON response" });

    // Test HTML route
    const htmlResponse = await client.Get("/page");
    assertEquals(htmlResponse.status, 200);
    assertEquals(await htmlResponse.text(), "<h1>Page</h1>");

    await runtime.Stop();
  });

  await t.step("should return 404 for unknown routes", async () => {
    // MinimalTestPlugin automatically adds a 404 catch-all route
    const plugin = createMinimalTestPlugin()
      .AddTextRoute("/", "Home");

    const runtime = new TestRuntime({
      Plugins: [plugin],
      PortRangeStart: 4300,
      PortRangeEnd: 4399,
    });

    await runtime.Start();
    const client = runtime.CreateClient();

    const response = await client.Get("/nonexistent");
    assertEquals(response.status, 404);
    await response.body?.cancel();

    await runtime.Stop();
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
        .AddTextRoute("/", "Home");

      const runtime = new TestRuntime({
        Plugins: [revisionCapturingPlugin, routePlugin],
        PortRangeStart: 4400,
        PortRangeEnd: 4499,
      });

      await runtime.Start();

      // Verify the revision was captured
      assertExists(capturedRevision, "Revision should have been captured");
      assertEquals(
        capturedRevision,
        "test",
        "Revision should be 'test' in test mode",
      );

      await runtime.Stop();
    },
  );
});
