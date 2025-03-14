/** Function to find an available port in the given range */
export async function findAvailablePort(
  start: number,
  end: number,
): Promise<number | null> {
  let firstError;
  for (let port = start; port <= end; port++) {
    try {
      await (
        await Deno.serve({ port }, () => {
          throw new Error();
        })
      ).shutdown();

      return port;
    } catch (err) {
      if (err instanceof Deno.errors.AddrInUse) {
        if (!firstError) firstError = err;
        continue;
      }
      throw err;
    }
  }

  if (firstError) throw firstError;

  return null;
}
