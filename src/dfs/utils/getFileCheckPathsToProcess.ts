export function getFileCheckPathsToProcess(
  filePath: string,
  defaultFileName?: string,
  extensions?: string[],
  useCascading?: boolean,
): string[] {
  const pathParts = (filePath?.split("/") || []).filter((pp) => pp);

  // const lastPart = pathParts.findLast((pp) => pp);

  // if (!lastPart?.includes('.') && defaultFileName) {
  //   pathParts.push(defaultFileName);
  // }

  // const fileName = pathParts.pop()!;

  const fileChecks: string[] = [];

  do {
    const newFileChecks: string[] = [];

    const currentPathBase = pathParts.join("/");

    if (pathParts.length > 0) {
      newFileChecks.push(
        new URL(currentPathBase, "https://notused.com/").pathname.replace(
          "//",
          "/",
        ),
      );

      extensions?.forEach((ext) => {
        newFileChecks.unshift(
          new URL(
            `${currentPathBase}.${ext}`,
            "https://notused.com/",
          ).pathname.replace("//", "/"),
        );
      });
    }

    if (defaultFileName) {
      newFileChecks.unshift(
        new URL(
          defaultFileName,
          new URL(`${currentPathBase}/`, "https://notused.com/"),
        ).pathname.replace("//", "/"),
      );
    }

    fileChecks.push(...newFileChecks);

    if (useCascading && pathParts.length > 0) {
      pathParts.pop();
    } else {
      break;
    }
  } while (true);

  return [...new Set(fileChecks)];
}
