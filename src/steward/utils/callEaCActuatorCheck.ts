// deno-lint-ignore-file no-explicit-any
import { Logger } from "../_/.deps.ts";
import {
  EaCActuatorCheckRequest,
  EaCActuatorCheckResponse,
  EaCModuleActuators,
  EverythingAsCode,
} from "./.deps.ts";

export async function callEaCActuatorCheck(
  logger: Logger,
  loadEaC: (entLookup: string) => Promise<EverythingAsCode>,
  actuators: EaCModuleActuators,
  jwt: string,
  req: EaCActuatorCheckRequest,
): Promise<EaCActuatorCheckResponse> {
  const type = req.Type!;
  const handler = actuators[type]!;
  const url = `${handler.APIPath.replace(/\/+$/, "")}/check`;

  req.ParentEaC = req.EaC?.ParentEnterpriseLookup
    ? await loadEaC(req.EaC.ParentEnterpriseLookup)
    : undefined;

  const t0 = Date.now();
  let res: Response | undefined;
  let text = "";

  try {
    res = await fetch(url, {
      method: "post",
      body: JSON.stringify(req),
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const ct = res.headers.get("content-type") || "";
    text = await res.text();

    logger.debug(
      `[act-check] type=${type} lookup=${(req as any).Lookup ?? "∅"} ` +
        `POST ${url} status=${res.status} ct=${ct} durMs=${Date.now() - t0}`,
    );

    if (!res.ok) {
      const snip = text.length > 300 ? text.slice(0, 297) + "…" : text;
      logger.error(
        `[act-check] type=${type} HTTP ${res.status} ${res.statusText} body="${snip}"`,
      );
    }

    try {
      const parsed = JSON.parse(text) as EaCActuatorCheckResponse;
      if (parsed.HasError) {
        const msg = typeof (parsed as any).Messages?.Error === "string"
          ? (parsed as any).Messages.Error
          : Object.keys((parsed as any).Messages ?? {}).join(", ") ||
            "unknown";
        logger.error(`[act-check] type=${type} ERROR: ${msg}`);
      } else {
        logger.info(
          `[act-check] type=${type} complete=${!!parsed.Complete} ` +
            `next=${parsed.Complete ? "—" : "requeue"}`,
        );
      }
      return parsed;
    } catch (parseErr) {
      logger.warn(
        `[act-check] type=${type} non-JSON response; assuming complete. ` +
          `parse="${(parseErr as Error)?.message ?? parseErr}"`,
      );
      return { Complete: true } as EaCActuatorCheckResponse;
    }
  } catch (err) {
    const safe = err instanceof Error
      ? { name: err.name, message: err.message, stack: err.stack }
      : { message: String(err) };
    logger.error(`[act-check] type=${type} fetch error`, safe);
    return {
      Complete: true,
      HasError: true,
      Messages: { Error: safe.message },
    } as any;
  }
}
