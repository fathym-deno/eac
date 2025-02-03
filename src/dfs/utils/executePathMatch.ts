import { EaCRuntimeContext, establishHeaders } from "./.deps.ts";
import { PathMatch } from "./PathMatch.ts";

export async function executePathMatch(
  matches: PathMatch[],
  req: Request,
  ctx: EaCRuntimeContext,
  defaultContentType?: string,
): Promise<Response> {
  const apiTestUrl = new URL(
    `.${ctx.Runtime.URLMatch.Path}`,
    new URL("https://notused.com"),
  );

  const match = matches.find((app) => {
    const isMatch = app.Pattern.test(apiTestUrl);

    return isMatch;
  });

  if (!match) {
    throw new Deno.errors.NotFound(
      `The requested path '${ctx.Runtime.URLMatch.Path}' could not be found.`,
    );
  }

  const patternResult = match!.Pattern.exec(apiTestUrl);

  ctx.Params = patternResult?.pathname.groups || {};

  let resp = match.Handlers.Execute(req, ctx);

  if (defaultContentType) {
    resp = await resp;

    if (
      !resp.headers.has("content-type") ||
      resp.headers.get("content-type") === "text/plain;charset=UTF-8"
    ) {
      resp = new Response(resp.body, {
        headers: establishHeaders(resp.headers, {
          "Content-Type": defaultContentType,
        }),
        status: resp.status,
        statusText: resp.statusText,
      });
    }
  }

  return resp;
}
