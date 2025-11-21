// deno-lint-ignore-file no-explicit-any
import { merge, TelemetryLogger } from "./.deps.ts";
import {
  EaCActuatorErrorResponse,
  isEaCActuatorErrorResponse,
} from "../actuators/reqres/EaCActuatorErrorResponse.ts";
import { EaCActuatorRequest } from "../actuators/reqres/EaCActuatorRequest.ts";
import {
  EaCActuatorResponse,
  isEaCActuatorResponse,
} from "../actuators/reqres/EaCActuatorResponse.ts";
import { EaCMetadataBase } from "../../eac/EaCMetadataBase.ts";
import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { EaCModuleActuator } from "../../eac/EaCModuleActuator.ts";
import { EaCCommitRequest } from "../_/reqres/EaCCommitRequest.ts";
import { EaCActuatorCheckRequest } from "../actuators/reqres/EaCActuatorCheckRequest.ts";

export async function callEaCActuator<T extends EaCMetadataBase>(
  logger: TelemetryLogger,
  loadEac: (entLookup: string) => Promise<EverythingAsCode>,
  handler: EaCModuleActuator,
  commitReq: EaCCommitRequest,
  key: string,
  currentEaC: EverythingAsCode,
  diff: T,
): Promise<{
  Checks: EaCActuatorCheckRequest[];
  Errors: EaCActuatorErrorResponse[];
  Result: T;
}> {
  const commitId = commitReq.CommitID;
  const current = (currentEaC[key as keyof typeof currentEaC] || {}) as Record<
    string,
    unknown
  >;
  const parentEaC = currentEaC?.ParentEnterpriseLookup
    ? await loadEac(currentEaC.ParentEnterpriseLookup)
    : undefined;

  if (!handler) {
    logger.debug(`[act ${commitId}] key=${key} no handler → passthrough`);
    return { Checks: [], Errors: [], Result: current as T };
  }

  const lookups = Object.keys(diff || {});
  logger.info(
    `[act ${commitId}] key=${key} api=${handler.APIPath} lookups=${lookups.length}`,
  );

  const toExecute = lookups.map(async (diffLookup, idx) => {
    const body: EaCActuatorRequest = {
      CommitID: commitReq.CommitID,
      EaC: currentEaC,
      Lookup: diffLookup,
      Model: diff![diffLookup],
      ParentEaC: parentEaC,
    } as EaCActuatorRequest;

    const started = Date.now();
    let res: Response | undefined;
    let text = "";

    try {
      res = await fetch(handler.APIPath, {
        method: "post",
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${commitReq.JWT}` },
      });

      const ct = res.headers.get("content-type") || "";
      text = await res.text();

      const dur = Date.now() - started;
      logger.debug(
        `[act ${commitId}] (#${idx}) POST ${handler.APIPath} lookup=${diffLookup} ` +
          `status=${res.status} ct=${ct} durMs=${dur}`,
      );

      if (!res.ok) {
        const snip = text.length > 300 ? text.slice(0, 297) + "…" : text;
        logger.error(
          `[act ${commitId}] (#${idx}) ${key}/${diffLookup} HTTP ${res.status} ${res.statusText} ` +
            `body="${snip}"`,
        );
      }

      // Try to parse JSON (preferred)
      try {
        const parsed = JSON.parse(text) as
          | EaCActuatorResponse
          | EaCActuatorErrorResponse;
        return { Lookup: diffLookup, Response: parsed };
      } catch (parseErr) {
        // Non-JSON: treat as a minimal success (model passthrough)
        logger.warn(
          `[act ${commitId}] (#${idx}) ${key}/${diffLookup} non-JSON response; ` +
            `assuming success (passthrough). parse="${
              (parseErr as Error)?.message ?? parseErr
            }"`,
        );
        return {
          Lookup: diffLookup,
          Response: {
            Lookup: diffLookup,
            Model: diff![diffLookup],
          } as EaCActuatorResponse,
        };
      }
    } catch (fetchErr) {
      // Network/exception
      const safe = fetchErr instanceof Error
        ? {
          name: fetchErr.name,
          message: fetchErr.message,
          stack: fetchErr.stack,
        }
        : { message: String(fetchErr) };
      logger.error(
        `[act ${commitId}] (#${idx}) ${key}/${diffLookup} fetch error`,
        safe,
      );
      return {
        Lookup: diffLookup,
        Response: {
          HasError: true,
          Messages: {
            Error: safe.message,
            Name: (safe as any).name,
            Stack: (safe as any).stack,
          },
        } as EaCActuatorErrorResponse,
      };
    }
  });

  const handledResponses = await Promise.all(toExecute);

  const errors: EaCActuatorErrorResponse[] = [];
  const checks: EaCActuatorCheckRequest[] = [];

  if (current) {
    for (const handled of handledResponses) {
      const handledResponse = handled.Response;

      if (isEaCActuatorResponse(handledResponse)) {
        if (handled.Lookup !== handledResponse.Lookup) {
          current[handledResponse.Lookup] = current[handled.Lookup];
          delete current[handled.Lookup];
        }

        current[handledResponse.Lookup] = merge(
          current[handledResponse.Lookup] as object,
          handledResponse.Model as object,
        );

        const cLen = handledResponse.Checks?.length ?? 0;
        logger.info(
          `[act ${commitId}] key=${key} lookup=${handledResponse.Lookup} OK checks=${cLen}`,
        );

        handledResponse.Checks?.forEach((check) => {
          check.EaC = currentEaC;
          check.Type = key;
        });

        checks.push(...(handledResponse.Checks || []));
      } else if (isEaCActuatorErrorResponse(handledResponse)) {
        const msg = typeof handledResponse.Messages?.Error === "string" &&
            handledResponse.Messages.Error !== "{}"
          ? handledResponse.Messages.Error
          : Object.keys(handledResponse.Messages ?? {}).join(", ") ||
            "unknown";
        logger.error(
          `[act ${commitId}] key=${key} lookup=${handled.Lookup} ERROR: ${msg}`,
        );
        errors.push(handledResponse);
      }
    }
  }

  logger.info(
    `[act ${commitId}] key=${key} summary lookups=${lookups.length} checks=${checks.length} errors=${errors.length}`,
  );

  return { Checks: checks, Errors: errors, Result: current as T };
}
