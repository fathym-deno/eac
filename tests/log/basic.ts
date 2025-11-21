import { EaCLoggingProvider } from "../../src/runtime/logging/EaCLoggingProvider.ts";

Deno.test("EaC Logging", async (t) => {
  const logging = new EaCLoggingProvider();

  await t.step("Package Logger", () => {
    const logger = logging.Package;
    logger.debug("This is a debug message");
    logger.info("This is an info message");
    logger.warn("This is a warning message");
    logger.error("This is an error message");
  });

  await t.step("Package Logger - Named", () => {
    const logger = logging.Default;
    logger.debug("This is a default debug message");
    logger.info("This is a default info message");
    logger.warn("This is a default warning message");
    logger.error("This is a default error message");
  });

  await t.step("Package Logger - Named - Not Configed", () => {
    const logger = logging.LoggerSync("blah");
    logger.debug("THIS SHOULD NOT SHOW");
    logger.info("THIS SHOULD NOT SHOW");
    logger.warn("THIS SHOULD NOT SHOW");
    logger.error("THIS SHOULD NOT SHOW");
  });
});
