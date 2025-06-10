// deno-lint-ignore-file no-explicit-any
import { loadJwtConfig } from "@fathym/common";
import { connect, headers as createHeaders, StringCodec } from "@nats";
import type { EaCRuntimeHandler } from "@fathym/eac/runtime/pipelines";

export default (async (_req, ctx) => {
  const servers = Deno.env.get("NATS_URL") ?? "nats://localhost:4222";

  const nc = await connect({
    servers,
    name: "eac-runtime",
  });

  const sc = StringCodec();
  const headers = createHeaders();

  const jwtCfg = loadJwtConfig();

  const [parentJWT, currentJWT] = await Promise.all([
    jwtCfg.Create({
      EnterpriseLookup: ctx.Runtime.EaC.EnterpriseLookup!,
      Username: ctx.State.Username,
    }),
    jwtCfg.Create({
      EnterpriseLookup: ctx.State.EnterpriseLookup!,
      Username: ctx.State.Username,
    }),
  ]);

  headers.set("ParentEnterpriseJWT", parentJWT);
  headers.set("EnterpriseJWT", currentJWT);

  ctx.State.Impulses = {
    NATS: nc,
    SC: sc,

    /**
     * Publish a one-way impulse to the given subject.
     */
    Send: async (subject: string, impulse: unknown): Promise<void> => {
      nc.publish(subject, sc.encode(JSON.stringify(impulse)), { headers });
      await nc.flush();
    },

    /**
     * Classic request-reply using NATS `msg.respond()` and `nc.request(...)`.
     */
    Request: async (
      subject: string,
      impulse: unknown,
      timeout = 2000,
    ): Promise<unknown> => {
      const msg = await nc.request(
        subject,
        sc.encode(JSON.stringify(impulse)),
        {
          timeout,
          headers,
        },
      );

      return JSON.parse(sc.decode(msg.data));
    },

    /**
     * Publish and wait for a reply on a secondary subject (not inbox).
     */
    SendReply: async <T = unknown>(
      publishSubject: string,
      replySubjects: string | string[],
      impulse: unknown,
      handler?: (reply: T) => Promise<unknown> | unknown,
      timeout = 2000,
    ): Promise<unknown> => {
      const subjects = Array.isArray(replySubjects)
        ? replySubjects
        : [replySubjects];
      const subs = subjects.map((subj) => nc.subscribe(subj, { max: 1 }));

      nc.publish(publishSubject, sc.encode(JSON.stringify(impulse)), {
        headers,
      });

      const timers: number[] = [];

      const races = subs.map((sub) =>
        (async () => {
          const timer = setTimeout(() => sub.unsubscribe(), timeout);
          timers.push(timer);

          for await (const msg of sub) {
            clearTimeout(timer);

            const decoded = JSON.parse(sc.decode(msg.data));

            return handler ? await handler(decoded) : decoded;
          }

          throw new Error(
            `No response received on subject: ${sub.getSubject()}`,
          );
        })()
      );

      try {
        return await Promise.race(races);
      } catch {
        throw new Error(
          `Timeout waiting for reply on subjects: ${subjects.join(", ")}`,
        );
      } finally {
        subs.forEach((sub) => sub.unsubscribe());
        timers.forEach((t) => clearTimeout(t));
      }
    },
  };

  return ctx.Next();
}) as EaCRuntimeHandler<any>;
