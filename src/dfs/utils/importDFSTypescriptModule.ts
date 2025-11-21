// deno-lint-ignore-file no-explicit-any
import { path, TelemetryLogger, toText } from "./.deps.ts";
import { EaCDistributedFileSystemDetails } from "../_/EaCDistributedFileSystemDetails.ts";
import { DFSFileHandler } from "../handlers/DFSFileHandler.ts";

export async function importDFSTypescriptModule(
  logger: TelemetryLogger,
  fileHandler: DFSFileHandler,
  filePath: string,
  dfs: EaCDistributedFileSystemDetails,
  dfsLookup: string,
  loader: "ts" | "tsx",
): Promise<{ filePath: string; module: any; contents: string } | undefined> {
  try {
    const file = await fileHandler.GetFileInfo(
      filePath,
      Date.now().toString(),
      dfs.DefaultFile,
      dfs.Extensions,
      dfs.UseCascading,
    );

    if (file) {
      try {
        let fileContents = await toText(file!.Contents);

        if (loader === "tsx") {
          fileContents =
            `import { Fragment, h } from "preact";\n${fileContents}`;
        }

        let apiUrl: string;

        filePath = file.ImportPath || file.Path;

        if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
          apiUrl = filePath;
        } else if (
          fileHandler.Root.startsWith("http://") ||
          fileHandler.Root.startsWith("https://")
        ) {
          if (filePath.startsWith("/")) {
            filePath = `.${filePath}`;
          }

          apiUrl = new URL(`${filePath}`, fileHandler.Root).href;
        } else {
          if (filePath.startsWith("file:")) {
            apiUrl = filePath;
          } else {
            apiUrl = `file:///${
              path.join(
                fileHandler.Root.includes(":/") ||
                  fileHandler.Root.includes(":\\")
                  ? ""
                  : Deno.cwd(),
                fileHandler.Root,
                filePath,
              )
            }`;
          }
        }
        // }

        const module = await import(apiUrl);

        return { filePath: apiUrl, module, contents: fileContents };
      } catch (ex) {
        console.log(file!.Path);
        throw ex;
      }
    } else {
      return undefined;
    }
  } catch (err) {
    logger.error(
      `There was an error importing the file '${filePath}' for DFS '${dfsLookup}'`,
      { err },
    );

    throw err;
  }
}
