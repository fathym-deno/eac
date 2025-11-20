import { Logger } from "../_/.deps.ts";
import { EaCActuatorErrorResponse, EaCActuatorRequest, EaCDeleteRequest, EaCMetadataBase, EaCModuleActuator, EverythingAsCode, isEaCActuatorErrorResponse } from "./.deps.ts";

const SKIPPABLE_DELETE_STATUSES = new Set([404, 405, 500, 501]);

export async function callEaCActuatorDelete<T extends EaCMetadataBase>(
  logger: Logger,
  loadEaC: (entLookup: string) => Promise<EverythingAsCode>,
  handler: EaCModuleActuator,
  deleteReq: EaCDeleteRequest,
  key: string,
  currentEaC: EverythingAsCode,
  toDelete: T,
): Promise<EaCActuatorErrorResponse[]> {
  if (!toDelete || typeof toDelete !== "object") {
    return [];
  }

  const commitId = deleteReq.CommitID;
  const parentEaC = currentEaC.ParentEnterpriseLookup ? await loadEaC(currentEaC.ParentEnterpriseLookup) : undefined;

  const lookupModels = toDelete as Record<string, unknown>;
  const lookups = Object.keys(lookupModels);

  if (lookups.length === 0) {
    logger.debug(`[act-del ${commitId}] key=${key} no lookups to delete`);
    return [];
  }

  if (!handler?.APIPath) {
    logger.debug(
      `[act-del ${commitId}] key=${key} no actuator API path; skipping delete`,
    );
    return [];
  }

  const url = `${handler.APIPath.replace(/\/+$/, "")}/delete`;
  const errors: EaCActuatorErrorResponse[] = [];

  await Promise.all(
    lookups.map(async (lookup, idx) => {
      const body: EaCActuatorRequest = {
        CommitID: deleteReq.CommitID,
        EaC: currentEaC,
        Lookup: lookup,
        Model: lookupModels[lookup] as EaCMetadataBase,
        ParentEaC: parentEaC,
      };

      const started = Date.now();
      let response: Response | undefined;
      let text = "";

      try {
        response = await fetch(url, {
          method: "post",
          body: JSON.stringify(body),
          headers: { Authorization: `Bearer ${deleteReq.JWT}` },
        });

        const contentType = response.headers.get("content-type") || "";
        text = await response.text();

        logger.debug(
          `[act-del ${commitId}] (#${idx}) POST ${url} lookup=${lookup} status=${response.status} ct=${contentType} durMs=${Date.now() - started}`,
        );

        if (!response.ok) {
          if (SKIPPABLE_DELETE_STATUSES.has(response.status)) {
            logger.info(
              `[act-del ${commitId}] (#${idx}) ${key}/${lookup} delete not supported (status=${response.status})`,
            );
            return;
          }

          let parsedError: EaCActuatorErrorResponse | undefined;

          if (text) {
            try {
              const parsed = JSON.parse(text);
              if (isEaCActuatorErrorResponse(parsed)) {
                parsedError = parsed;
              }
            } catch {
              // Ignore parse errors for non-JSON payloads
            }
          }

          errors.push(
            parsedError ?? {
              HasError: true,
              Messages: {
                Error: text || response.statusText || "delete failed",
                Key: key,
                Lookup: lookup,
                Status: response.status,
              },
            },
          );

          logger.error(
            `[act-del ${commitId}] (#${idx}) ${key}/${lookup} HTTP ${response.status} ${response.statusText}`,
          );
          return;
        }

        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (isEaCActuatorErrorResponse(parsed)) {
              errors.push(parsed);
              logger.error(
                `[act-del ${commitId}] key=${key} lookup=${lookup} reported error`,
              );
              return;
            }
          } catch {
            // Non-JSON success payloads are ignored
          }
        }

        logger.info(
          `[act-del ${commitId}] key=${key} lookup=${lookup} deleted`,
        );
      } catch (err) {
        const safe = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : { message: String(err) };

        errors.push({
          HasError: true,
          Messages: {
            Error: safe.message,
            Key: key,
            Lookup: lookup,
            Name: safe.name,
            Stack: safe.stack,
          },
        });

        logger.error(
          `[act-del ${commitId}] (#${idx}) ${key}/${lookup} fetch error`,
          safe,
        );
      }
    }),
  );

  return errors;
}
