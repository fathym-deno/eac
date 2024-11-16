import { EaCRuntime, IS_BUILDING, LoggingProvider } from "./.deps.ts";
import { handleEaCCommitCheckRequest } from "./commit-check.handler.ts";
import { handleEaCCommitRequest } from "./commit.handler.ts";
import { handleEaCDeleteRequest } from "./delete.handler.ts";
import { isEaCCommitCheckRequest } from "./reqres/EaCCommitCheckRequest.ts";
import { isEaCCommitRequest } from "./reqres/EaCCommitRequest.ts";
import { isEaCDeleteRequest } from "./reqres/EaCDeleteRequest.ts";

export class EaCSteward {
  constructor(protected runtime: EaCRuntime) {}

  public async Start(): Promise<void> {
    if (!IS_BUILDING) {
      const commitKv = await this.runtime.IoC.Resolve<Deno.Kv>(
        Deno.Kv,
        "commit",
      );

      const eacKv = await this.runtime.IoC.Resolve<Deno.Kv>(Deno.Kv, "eac");

      const logger = await this.runtime.IoC.Resolve(LoggingProvider);

      /**
       * This listener set is responsible for the core EaC actions.
       */
      commitKv.listenQueue(async (msg: unknown) => {
        const trackingKey = ["Handlers", "Commits", "Processing"];

        if (isEaCCommitCheckRequest(msg)) {
          logger.Package.debug(
            `Queue message picked up for processing commit checks ${msg.CommitID}`,
          );

          trackingKey.push("Checks");
          trackingKey.push(msg.CommitID);
        } else if (isEaCDeleteRequest(msg)) {
          logger.Package.debug(
            `Queue message picked up for processing commit delete ${msg.CommitID}`,
          );

          trackingKey.push("Delete");
          trackingKey.push(msg.CommitID);
        } else if (isEaCCommitRequest(msg)) {
          logger.Package.debug(
            `Queue message picked up for processing commit ${msg.CommitID}`,
          );

          trackingKey.push("Commit");
          trackingKey.push(msg.CommitID);
        }

        try {
          const isCommitting = await commitKv.get<boolean>(trackingKey);

          if (!isCommitting.value) {
            await commitKv.set(trackingKey, true);

            if (isEaCCommitCheckRequest(msg)) {
              await handleEaCCommitCheckRequest(
                logger.Package,
                eacKv,
                commitKv,
                msg,
              );
            } else if (isEaCDeleteRequest(msg)) {
              await handleEaCDeleteRequest(
                logger.Package,
                eacKv,
                commitKv,
                msg,
              );
            } else if (isEaCCommitRequest(msg)) {
              await handleEaCCommitRequest(
                logger.Package,
                eacKv,
                commitKv,
                msg,
              );
            }
          } else {
            logger.Package.debug(
              `The commit ${
                (msg as { CommitID: string }).CommitID
              } is already processing.`,
            );
          }
        } finally {
          await commitKv.delete(trackingKey);

          logger.Package.debug(
            `The commit ${
              (msg as { CommitID: string }).CommitID
            } completed processing.`,
          );
        }
      });
    }
  }
}
